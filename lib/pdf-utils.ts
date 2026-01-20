import { jsPDF } from "jspdf";

/**
 * Generates a PDF shopping list from markdown content.
 * Looks for a section starting with "Shopping List" (case-insensitive, can have emoji).
 */
export const downloadShoppingListPdf = (markdown: string, title?: string) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Extract title if not provided
    if (!title) {
        const titleMatch = markdown.match(/^# (.*)$/m);
        title = titleMatch ? titleMatch[1] : "Shopping List";
    }

    // PDF Header
    doc.setFontSize(22);
    doc.text(title, margin, y);
    y += 15;

    // Split by H3 (###) which we use for sections
    const sections = markdown.split(/^### /gm);
    const shoppingListSection = sections.find(s => s.toLowerCase().includes('shopping list'));

    if (shoppingListSection) {
        const lines = shoppingListSection.split('\n');
        doc.setFontSize(16);
        doc.text("Shopping List", margin, y);
        y += 10;
        doc.setFontSize(11);

        lines.forEach(line => {
            const trimmed = line.trim();
            // Skip the section header itself
            if (!trimmed || trimmed.toLowerCase().includes('shopping list')) return;

            if (trimmed.startsWith('- **') && trimmed.endsWith('**')) {
                // Category bold header
                y += 5;
                doc.setFont("helvetica", "bold");
                doc.text(trimmed.replace(/\*\*/g, '').replace(/^- /, ''), margin, y);
                y += 6;
                doc.setFont("helvetica", "normal");
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                // List item with checkbox
                const content = trimmed.replace(/^[-*] /, '');
                doc.text(`[ ] ${content}`, margin + 5, y);
                y += 6;
            } else if (trimmed) {
                // Just text
                doc.text(trimmed, margin, y);
                y += 6;
            }

            // Page overflow check
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });
    } else {
        doc.text("No specific shopping list found in the generated plan.", margin, y);
    }

    // Save PDF
    doc.save(`${title.replace(/\s+/g, '_')}_Shopping_List.pdf`);
};
