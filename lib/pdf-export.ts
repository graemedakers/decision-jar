import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function exportToPdf(element: HTMLElement, filename: string) {
    if (!element) return;

    // Create a container for our clone
    const container = document.createElement('div');
    container.style.position = 'fixed'; // Use fixed to ensure it's in a predictable render layer
    container.style.top = '0';
    container.style.left = '0';
    // Use a width closer to actual A4 print width (approx 794px at 96 DPI)
    // This forces the content to wrap naturally for print, making text appear larger
    container.style.width = '794px';
    container.style.zIndex = '-9999';
    container.style.visibility = 'hidden'; // Hide from user, but DOM is active
    // We will make the CLONE visible inside this hidden container for toPng (which ignores container visibility usually if we target the node)
    // Wait, toPng might respect visibility: hidden.
    // Better strategy: Place it far off screen but visible.
    container.style.visibility = 'visible';
    container.style.top = '-10000px';
    container.style.left = '-10000px';

    container.style.backgroundColor = '#ffffff';

    if (document.documentElement.classList.contains('dark')) {
        container.classList.add('dark');
    }

    // Clone the node
    const clone = element.cloneNode(true) as HTMLElement;

    // 1. Reset layout constraints
    clone.style.height = 'auto';
    clone.style.width = '100%';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';

    // 2. STRIP ANIMATIONS & BOOST READABILITY
    // Animations (animate-in) often start at opacity: 0. This is the #1 cause of blank PDFs.
    const animClasses = ['animate-in', 'fade-in', 'slide-in-from-bottom-4', 'duration-500', 'transition-all', 'transition-colors', 'opacity-0'];

    clone.classList.remove(...animClasses);
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    clone.style.animation = 'none';
    clone.style.transition = 'none';

    // Boost font size for print readability
    // We scale up the base text and increase line height
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .text-xs { font-size: 14px !important; line-height: 1.6 !important; }
        .text-sm { font-size: 16px !important; line-height: 1.6 !important; }
        .text-base { font-size: 18px !important; line-height: 1.6 !important; }
        h1, h2, h3, h4, h5, h6 { margin-bottom: 0.5em !important; }
        p, li { margin-bottom: 0.5em !important; }
    `;
    clone.appendChild(style);

    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el) => {
        const e = el as HTMLElement;
        e.classList.remove(...animClasses);
        e.style.opacity = '1';
        e.style.transform = 'none';
        e.style.animation = 'none';
        e.style.transition = 'none';
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
        // 1. Capture the CLONE
        // We force width/height in toPng to ensure high-res capture even if off-screen behaves oddly
        const dataUrl = await toPng(clone, {
            cacheBust: true,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            width: 794, // Match our container width for 1:1 scale
            style: {
                visibility: 'visible' // Ensure visibility in capture
            }
        });

        // 2. Load image to get dimensions
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // 3. Initialize PDF (A4 Portrait)
        // A4 is 210mm wide.
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        const margin = 10; // 10mm margin
        const contentWidth = pdfWidth - (margin * 2);
        const contentHeight = pdfHeight - (margin * 2);

        // Calculate scaling based on the CLONE
        // clone.offsetWidth should be ~794px
        const scaleFactor = contentWidth / clone.offsetWidth;
        const totalHeightScaled = clone.offsetHeight * scaleFactor;

        // 4. Find all "safe break" elements in the CLONE
        const items = Array.from(clone.querySelectorAll('.pdf-item'));

        // Map item boundaries in PDF coordinate space (relative to top of content)
        // using the CLONE's layout
        const itemBoundaries = items.map(item => {
            const rect = item.getBoundingClientRect();
            const parentRect = clone.getBoundingClientRect();
            return {
                top: (rect.top - parentRect.top) * scaleFactor,
                bottom: (rect.bottom - parentRect.top) * scaleFactor
            };
        });

        let currentY = 0;

        while (currentY < totalHeightScaled) {
            // Determine ideal cut point (fill the page)
            let proposedCut = currentY + contentHeight;

            // If this is the last page, just cut at the end
            if (proposedCut >= totalHeightScaled) {
                proposedCut = totalHeightScaled;
            } else {
                // Adjust cut point to avoid slicing an item
                const crossingItem = itemBoundaries.find(b => b.top < proposedCut && b.bottom > proposedCut);

                if (crossingItem) {
                    // Back up to the top of this item
                    if (crossingItem.top > currentY) {
                        proposedCut = crossingItem.top - 5; // Leave 5mm padding
                    } else {
                        // Item is huge (taller than page), we MUST split it.
                        // Ideally we wouldn't, but physics.
                        // Just let it split at the original proposedCut
                    }
                }
            }

            // Create a canvas to crop the specific slice
            const canvas = document.createElement('canvas');
            // Height of this slice in PDF units (mm)
            const sliceHeightMm = proposedCut - currentY;

            if (sliceHeightMm <= 0.1) {
                break; // Stop if slice is negligible
            }

            // Height in source pixels
            const sliceHeightPx = sliceHeightMm / scaleFactor;

            // Canvas dimensions (high res)
            // Use Math.ceil to avoid 0px height issues
            canvas.width = Math.ceil(img.width);
            canvas.height = Math.ceil(sliceHeightPx * (img.width / clone.offsetWidth));

            if (canvas.height < 1 || canvas.width < 1) {
                currentY = proposedCut;
                continue;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw only the slice
                // sourceY is based on currentY (mm) converted back to image pixels
                const sourceY = (currentY / scaleFactor) * (img.width / clone.offsetWidth);

                ctx.drawImage(
                    img,
                    0, sourceY, img.width, canvas.height, // Source crop
                    0, 0, canvas.width, canvas.height // Dest
                );

                const sliceData = canvas.toDataURL('image/png');

                // Verify data is valid
                if (sliceData.length > 20) {
                    if (currentY > 0) pdf.addPage();
                    // Add image to PDF
                    pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeightMm);
                }
            }

            currentY = proposedCut;
        }

        pdf.save(`${filename}.pdf`);

    } catch (error) {
        console.error("Advanced PDF Export Failed", error);
        throw error;
    } finally {
        // Cleanup the off-screen clone
        if (container.parentNode) {
            document.body.removeChild(container);
        }
    }
}
