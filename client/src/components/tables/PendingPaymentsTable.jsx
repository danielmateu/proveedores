import React, { useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, X, AlertCircle, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function PendingPaymentsTable({
    payments,
    title = "Pagos Pendientes",
    onApprove,
    onReject
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedPaymentId, setExpandedPaymentId] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const { toast } = useToast();

    // Filter payments based on search term
    const filteredPayments = payments.filter(payment => {
        const searchFields = [
            payment.TaxName,
            payment.servicePeriod,
            payment.paymentMethod,
            payment.Ex_InvoicingAddressID?.toString(),
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

    const handleRowClick = (payment) => {
        setSelectedPayment(payment);
        setIsLoadingDetails(true);
        setDetailsDialogOpen(true);
        
        // In a real implementation, this would fetch data from the API using the query:
        // SELECT * FROM [Rapitecnic].[dbo].[ex_GetPendingPaymentsExtended] 
        // where Ex_InvoicingAddressID = ${payment.Ex_InvoicingAddressID} and MES=${month} and QUINCENA=${quincena}
        
        // For now, we'll simulate the API call with a timeout
        setTimeout(() => {
            // Generate mock data based on the payment
            const mockDetails = Array.from({ length: payment.NoticeCount || 3 }, (_, i) => ({
                id: `${payment.Ex_InvoicingAddressID}-${i+1}`,
                noticeId: `NOT${100000 + Math.floor(Math.random() * 900000)}`,
                customerName: `Cliente ${i+1}`,
                serviceType: payment.ServiceTypeName || "Reparación",
                date: new Date(payment.Date || new Date()).toLocaleDateString(),
                amount: (payment.TotalAmount / (payment.NoticeCount || 3)).toFixed(2),
                status: "Pendiente",
                address: `Calle Ejemplo ${i+1}, Barcelona`,
                zipCode: `0800${i+1}`,
                phone: `6${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`
            }));
            
            setPaymentDetails(mockDetails);
            setIsLoadingDetails(false);
        }, 1000);
    };

    const toggleExpandRow = (paymentId) => {
        if (expandedPaymentId === paymentId) {
            setExpandedPaymentId(null);
        } else {
            setExpandedPaymentId(paymentId);
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
                                <TableHead></TableHead>
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
                                    <TableCell colSpan={11} className="text-center py-6 text-gray-500">
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
                                    <React.Fragment key={payment.Ex_InvoicingAddressID || payment.id}>
                                        <TableRow 
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                            onClick={() => handleRowClick(payment)}
                                        >
                                            <TableCell className="w-10">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExpandRow(payment.Ex_InvoicingAddressID || payment.id);
                                                    }}
                                                >
                                                    {expandedPaymentId === (payment.Ex_InvoicingAddressID || payment.id) ? 
                                                        <ChevronUp className="h-4 w-4" /> : 
                                                        <ChevronDown className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </TableCell>
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onApprove && onApprove(payment.Ex_InvoicingAddressID);
                                                            }}
                                                        >
                                                            <Check size={16} className="text-green-600 dark:text-green-400" />
                                                            <span className="sr-only">Aprobar</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onReject && onReject(payment.Ex_InvoicingAddressID);
                                                            }}
                                                        >
                                                            <X size={16} className="text-red-600 dark:text-red-400" />
                                                            <span className="sr-only">Rechazar</span>
                                                        </Button>
                                                    </>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {expandedPaymentId === (payment.Ex_InvoicingAddressID || payment.id) && (
                                            <TableRow>
                                                <TableCell colSpan={11} className="bg-gray-50 dark:bg-gray-800/50 p-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium mb-2">Información adicional:</div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="font-medium">Cliente:</span> {payment.TaxName}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Tipo de servicio:</span> {payment.ServiceTypeName || "Varios"}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Número de avisos:</span> {payment.NoticeCount || "N/A"}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Método de pago:</span> {payment.paymentMethod || "Transferencia"}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Importe total:</span> {formatCurrency(payment.TotalAmount)}
                                                            </div>
                                                            <div>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleRowClick(payment)}
                                                                >
                                                                    Ver detalles completos
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Detalles de Pago</DialogTitle>
                        <DialogDescription>
                            {selectedPayment && (
                                <>Información detallada de los avisos para {selectedPayment.TaxName}</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isLoadingDetails ? (
                        <div className="flex justify-center items-center py-8">
                            <AlertCircle className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2">Cargando detalles...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID Aviso</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Dirección</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Importe</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentDetails.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell className="font-medium">{detail.noticeId}</TableCell>
                                            <TableCell>{detail.customerName}</TableCell>
                                            <TableCell>{detail.serviceType}</TableCell>
                                            <TableCell>{detail.date}</TableCell>
                                            <TableCell>
                                                <div className="truncate max-w-[150px]">
                                                    {detail.address}
                                                    <div className="text-xs text-gray-500">{detail.zipCode}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{detail.phone}</TableCell>
                                            <TableCell>{formatCurrency(detail.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {paymentDetails.length > 0 && (
                                <div className="flex justify-between items-center mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div>
                                        <span className="font-medium">Total avisos:</span> {paymentDetails.length}
                                    </div>
                                    <div>
                                        <span className="font-medium">Importe total:</span> {formatCurrency(
                                            paymentDetails.reduce((sum, detail) => sum + parseFloat(detail.amount), 0)
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {paymentDetails.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No hay detalles disponibles para este pago
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}