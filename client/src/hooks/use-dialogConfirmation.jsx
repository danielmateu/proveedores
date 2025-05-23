import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [onConfirm, setOnConfirm] = useState(() => () => { });
    const [message, setMessage] = useState("¿Estás seguro de realizar estos cambios?");

    const openDialog = (confirmCallback, customMessage) => {
        setOnConfirm(() => confirmCallback); // Guardar el callback a ejecutar al confirmar
        setMessage(customMessage || "¿Estás seguro de realizar estos cambios?");
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    const confirm = () => {
        if (onConfirm) onConfirm();
        closeDialog();
    };

    const ConfirmationModal = () => {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px] space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl">¡Atención!</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-lg">{message}</DialogDescription>
                    <DialogFooter className="justify-start md:justify-end">
                        <Button className="text-base blindcolor:bg-white blindcolor:text-black" type="button" variant="destructive" onClick={closeDialog}>
                            Cancelar
                        </Button>
                        <Button className="text-base blindcolor:bg-white blindcolor:text-black" type="button" variant="" onClick={confirm}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return { ConfirmationModal, openDialog, closeDialog };
};