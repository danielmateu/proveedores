import React, { useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, X, AlertCircle, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingPaymentsTable({
    payments,
    title = "Pagos Pendientes",
    onApprove,
    onReject
}) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter payments based on search term
    const filteredPayments = payments.filter(payment => {
        const searchFields = [
            payment.TaxName,
            payment.servicePeriod,
            payment.paymentMethod,
            payment.Ex_InvoicingAddressID.toString(),
        ].map(field => (field || "").toLowerCase());

        return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:border-amber-800 dark:text-amber-300">Pendiente</Badge>;
            case 'processed':
                return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-800 dark:text-green-300">Procesado</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-800 dark:text-red-300">Rechazado</Badge>;
            default:
                return <Badge>Pendiente</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
                {/* <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar pago..."
                        className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div> */}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Tipo de Servicio</TableHead>
                                <TableHead>Avisos</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Importe</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                                        {payments.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                                                <p>No hay pagos pendientes</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                                                <p>No se encontraron pagos que coincidan con la búsqueda</p>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <TableRow key={payment.TotalPrice} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <TableCell>
                                            <div className="font-medium">{payment.Ex_InvoicingAddressID}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.TaxName}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.ServiceTypeName}</div>
                                        </TableCell>
                                        <TableCell>
                                            {payment.NoticeCount}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {
                                                    payment.servicePeriod
                                                        ? `${payment.servicePeriod.startDate} - ${payment.servicePeriod.endDate}`
                                                        : "N/A"
                                                }
                                            </div>

                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                                                <span>{payment.paymentMethod}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {/* {formatDate(payment.createDate)} */}
                                                {payment.createDate
                                                    ? formatDate(payment.createDate)
                                                    : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{formatCurrency(payment.TotalAmount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300"
                                                        onClick={() => onApprove && onApprove(payment.Ex_InvoicingAddressID)}
                                                    >
                                                        <Check size={16} className="text-green-600 dark:text-green-400" />
                                                        <span className="sr-only">Aprobar</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                                                        onClick={() => onReject && onReject(payment.Ex_InvoicingAddressID)}
                                                    >
                                                        <X size={16} className="text-red-600 dark:text-red-400" />
                                                        <span className="sr-only">Rechazar</span>
                                                    </Button>
                                                </>
                                                {/* {payment.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300"
                                                            onClick={() => onApprove && onApprove(payment.Ex_InvoicingAddressID)}
                                                        >
                                                            <Check size={16} className="text-green-600 dark:text-green-400" />
                                                            <span className="sr-only">Aprobar</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                                                            onClick={() => onReject && onReject(payment.Ex_InvoicingAddressID)}
                                                        >
                                                            <X size={16} className="text-red-600 dark:text-red-400" />
                                                            <span className="sr-only">Rechazar</span>
                                                        </Button>
                                                    </>
                                                )} */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}