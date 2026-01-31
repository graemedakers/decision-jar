import { useState } from 'react';
import { exportToPdf } from "@/lib/pdf-export";

export function usePdfExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingShopping, setIsExportingShopping] = useState(false);

    const handleExportPdf = async (element: HTMLElement | null, filename: string) => {
        if (!element) return;
        setIsExporting(true);
        try {
            await exportToPdf(element, filename);
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportShoppingPdf = async (element: HTMLElement | null, filename: string) => {
        if (!element) return;
        setIsExportingShopping(true);
        try {
            await exportToPdf(element, filename);
        } catch (error) {
            console.error("Shopping PDF Export failed", error);
        } finally {
            setIsExportingShopping(false);
        }
    };

    return {
        isExporting,
        isExportingShopping,
        handleExportPdf,
        handleExportShoppingPdf
    };
}
