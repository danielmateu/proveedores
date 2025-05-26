import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "@formkit/tempo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "react-i18next";
import CalendarRange from "../CalendarRange";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptionsMapping = [
    {
        id: 1,
        name: 'En proceso',
        statusId: ["1", "26"],
    },
    {
        id: 2,
        name: 'Finalizado',
        statusId: ["27"]
    },
    {
        id: 3,
        name: 'Cobrado',
        statusId: ["38"]
    },
    {
        id: 4,
        name: 'Anulado',
        statusId: ["20"]
    },
];

export default function NoticesTables({ notices, title = "Avisos Filtrados", all = false, onDeleteNotice }) {
    // console.log('notices', notices);
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noticeToDelete, setNoticeToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getStatusBadgeVariant = (statusId) => {
        const status = statusOptionsMapping.find(s => s.statusId.includes(statusId));
        switch (status?.id) {
            case 1: return "secondary"; // En proceso
            case 2: return "success";   // Finalizados
            case 3: return "info"; // Anulados
            case 4: return "destructive"; // Cobrado
            default: return "secondary";
        }
    };

    const getStatusName = (statusId) => {
        const status = statusOptionsMapping.find(s => s.statusId.includes(statusId));
        return status ? status.name : 'Desconocido';
    };

    const handleDateRangeChange = (range) => {
        setDateRange({
            from: range?.from ? new Date(range.from) : undefined,
            to: range?.to ? new Date(range.to) : undefined
        });
    };

    const handleDeleteClick = (e, notice) => {
        e.stopPropagation();
        setNoticeToDelete(notice);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!noticeToDelete) return;
        
        setIsDeleting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const loginID = localStorage.getItem('LoginID');
            
            const response = await fetch(`${apiUrl}/noticeController/deleteNotice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    docEntry: noticeToDelete.NoticeHeaderID,
                    timestamp: new Date().toISOString(),
                    loginID: loginID,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar el aviso: ${response.statusText}`);
            }

            const data = await response.json();
            
            toast({
                title: "Aviso eliminado",
                description: data.message || "El aviso ha sido eliminado correctamente",
                variant: "success",
            });
            
            // Call the parent component's onDeleteNotice function if provided
            if (onDeleteNotice) {
                onDeleteNotice(noticeToDelete.NoticeHeaderID);
            }
        } catch (error) {
            console.error("Error al eliminar el aviso:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el aviso. Inténtelo de nuevo más tarde.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setNoticeToDelete(null);
        }
    };

    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <span>{title}</span>
                    <div className="flex gap-2 items-center">
                        <Badge variant="" className=''>{notices.length} {notices.length === 1 ? "aviso" : "avisos"}</Badge>
                        {all && (
                            <CalendarRange
                                date={dateRange}
                                setDate={handleDateRangeChange}
                            />
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {notices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <ScrollArea className={cn("h-44",
                            all ? "h-fit" : "",
                        )}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            ID
                                        </TableHead>
                                        <TableHead>
                                            {/* Fecha */}
                                            {t('Date')}
                                        </TableHead>
                                        <TableHead>
                                            {/* Cliente */}
                                            {t('Customer')}
                                        </TableHead>
                                        <TableHead>
                                            {/* Aparato */}
                                            {t('Equipment')}
                                        </TableHead>
                                        <TableHead>
                                            Marca
                                        </TableHead>
                                        <TableHead>
                                            {/* Estado */}
                                            {t('Status')}
                                        </TableHead>
                                        <TableHead>
                                            Colaborador
                                        </TableHead>
                                        {onDeleteNotice && (
                                            <TableHead className="text-right">
                                                Acciones
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notices.map((notice) => (
                                        <TableRow key={notice.NoticeHeaderID} className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <TableCell className="font-medium">{notice.NoticeHeaderID}</TableCell>
                                            <TableCell>{format(notice.CreateDate, "long")}</TableCell>
                                            <TableCell>{`${notice.CustomerName} ${notice.CustomerSurname}`}</TableCell>
                                            <TableCell>{notice.ApparatusName}</TableCell>
                                            <TableCell>{notice.BrandName}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(notice.StatusID.toString())}>
                                                    {getStatusName(notice.StatusID.toString())}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{`${notice.CustomerTaxName}`}</TableCell>
                                            {onDeleteNotice && (
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                        onClick={(e) => handleDeleteClick(e, notice)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        {/* No hay avisos que coincidan con los criterios de filtrado */}
                        {t('NoResults')}

                    </div>
                )}
            </CardContent>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el aviso {noticeToDelete?.NoticeHeaderID}. 
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                "Eliminar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card >
    );
}