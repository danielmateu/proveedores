import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "@formkit/tempo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "react-i18next";
import CalendarRange from "../CalendarRange";
import { useState } from "react";

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

export default function NoticesTables({ notices, title = "Avisos Filtrados", all = false }) {
    // console.log('notices', notices);

    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

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
        </Card >
    );
}