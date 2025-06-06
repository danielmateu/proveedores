import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AcceptedPaymentsTable({ payments, title = "Pagos Realizados" }) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter payments based on search term
    const filteredPayments = payments.filter(payment => {
        const searchFields = [
            payment.CustomerName,
            payment.CustomerSurname,
            payment.ApparatusName,
            payment.NoticeHeaderID?.toString(),
        ].map(field => (field || "").toLowerCase());

        return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Buscar pago..."
                        className="pl-8 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Servicio</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Importe</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                                        No hay pagos realizados que coincidan con la búsqueda
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <TableRow key={payment.NoticeHeaderID} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <TableCell className="font-medium">
                                            {payment.NoticeHeaderID}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{payment.CustomerName} {payment.CustomerSurname}</div>
                                                <div className="text-sm text-gray-500">{payment.CustomerPhone || payment.CustomerCell}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                {payment.ApparatusName || "Servicio"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {payment.CreateDate ? format(new Date(payment.CreateDate), 'dd MMM yyyy', { locale: es }) : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {payment.ServiceTypeID === 1 ? formatCurrency(10) :
                                                    payment.ServiceTypeID === 2 ? formatCurrency(15) :
                                                        payment.ServiceTypeID === 3 ? formatCurrency(15) : formatCurrency(10)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                                                Pagado
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <FileText size={16} className="text-gray-500" />
                                                </button>
                                                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <Check size={16} className="text-green-500" />
                                                </button>
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