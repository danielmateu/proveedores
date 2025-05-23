import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, TagIcon, PhoneIcon, MapPinIcon } from "lucide-react";

import { format, parse } from "@formkit/tempo"
import { useTranslation } from "react-i18next";

export function LeadInfoDialog({ isOpen, onOpenChange, notices, status }) {

    const { t } = useTranslation();

    const getStatusTitle = () => {
        switch (status) {
            case 'inProcess':
                return (t('LeadsInProcess'));
            case 'accumulated':
                return (t('AccumulatedLeads'));
            case 'billed':
                return (t('BilledLeads'));
            case 'cancelled':
                return (t('CancelledLeads'));
            default:
                return 'Avisos';
        }
    };

    const getStatusDescription = () => {
        switch (status) {
            case 'inProcess':
                return 'Estos avisos están actualmente en proceso de gestión.';
            case 'accumulated':
                return 'Estos avisos han sido acumulados y están pendientes de facturación.';
            case 'billed':
                return 'Estos avisos ya han sido facturados y cobrados.';
            case 'cancelled':
                return 'Estos avisos han sido cancelados por el cliente';
            default:
                return 'Información detallada de los avisos.';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'inProcess':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            case 'accumulated':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'billed':
                return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-primary/10 text-primary';
        }
    };

    const getServiceTypeLabel = (serviceType) => {
        switch (serviceType) {
            case 1:
                return 'Reparación';
            case 2:
                return 'Instalación';
            case 3:
                return 'Mantenimiento';
            case 4:
                return 'Conexión';
            default:
                return 'Otro';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[725px] max-h-[85vh] overflow-hidden flex flex-col dialog-info">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {getStatusTitle()} <Badge className={getStatusColor()}>{notices.length}</Badge>
                    </DialogTitle>
                    <DialogDescription>{getStatusDescription()}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 h-[500px] mt-4">
                    {notices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo de Servicio</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notices.map((notice) => (
                                    <TableRow key={notice.NoticeHeaderID}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TagIcon className="h-4 w-4 text-muted-foreground" />
                                                <span>{getServiceTypeLabel(notice.ServiceTypeID || 1)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{notice.CustomerName || 'Sin nombre'} {notice.CustomerSurname || ''}</span>
                                                {notice.CustomerPhone && (
                                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                        <PhoneIcon className="h-3 w-3 mr-1" />
                                                        {notice.CustomerPhone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                                {/* <span>{formatDate(notice.CreateDate)}</span> */}
                                                <span>{format(notice.CreateDate, "long")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                                                <span className="truncate max-w-[120px]" title={notice.Address}>
                                                    {notice.CustomerCity || notice.CustomerAddress || 'Sin ubicación'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium">
                                                {notice.ServiceTypeID === 1 ? '10€' :
                                                    notice.ServiceTypeID === 2 ? '15€' :
                                                        notice.ServiceTypeID === 3 ? '15€' : '10€'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-muted-foreground">No hay avisos disponibles con este estado</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}