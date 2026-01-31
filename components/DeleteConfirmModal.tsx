
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = "Delete Idea", description = "Are you sure you want to remove this idea? This action cannot be undone." }: DeleteConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden" raw>
                <div className="p-6">
                    <DialogHeader onClose={onClose} showClose={true} className="px-0 pt-0 border-none">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 dark:text-white">
                            <div className="p-2.5 rounded-2xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-base mt-2">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <DialogFooter className="bg-slate-50 dark:bg-black/20 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-none shadow-lg shadow-red-500/20 px-8"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Delete Idea
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
