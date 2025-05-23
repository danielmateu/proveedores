import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency, truncateText } from "@/lib/utils";
import { Eye, Edit, MoreHorizontal, Building, User, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../ui/input";
import { useUserInfoStore } from "@/zustand/userInfoStore";
import { format } from "@formkit/tempo";
import CalendarRange from "../CalendarRange";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useTranslation } from "react-i18next";

export default function CustomersTable({
    customers,
    title = "Clientes",
    searchQuery,
    onSearchChange
}) {
    const userInfo = useUserInfoStore((state) => state.userInfo);

    const { t } = useTranslation()

    // const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

    const filteredCustomers = useMemo(() => {
        if (!userInfo?.Administrator) return [];

        // Ordenar todos los clientes primero por nombre (orden alfabético)
        const sortedCustomers = [...customers].sort((a, b) =>
            a.Name.localeCompare(b.Name)
        );

        // Luego aplicar el filtrado sobre los clientes ordenados
        return sortedCustomers.filter(customer => {
            const searchTerm = searchQuery.toLowerCase();
            return (
                customer.Name?.toLowerCase().includes(searchTerm) ||
                customer.Surname?.toLowerCase().includes(searchTerm) ||
                customer.Phone?.includes(searchTerm) ||
                customer.Cell?.includes(searchTerm)
            );
        });
    }, [customers, searchQuery, userInfo?.Administrator]);

    // const handleDateRangeChange = (range) => {
    //     setDateRange({
    //         from: range?.from ? new Date(range.from) : undefined,
    //         to: range?.to ? new Date(range.to) : undefined
    //     });
    // };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
                <div className="flex gap-2">
                    <div className="relative">
                        <Input
                            placeholder="Buscar por nombre o teléfono..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-6"
                        />
                        <Search size={14} className="absolute left-2 top-3.5 text-gray-400" />
                    </div>
                    {/* <CalendarRange
                        date={dateRange}
                        setDate={handleDateRangeChange}
                    /> */}
                </div>

            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {/* Cliente */}
                                    {(t('Customer'))}
                                </TableHead>
                                <TableHead>
                                    {/* Contacto */}
                                    {(t('Contact'))}
                                </TableHead>
                                <TableHead>
                                    {/* Ubicación */}
                                    {(t('Location'))}
                                </TableHead>
                                <TableHead>
                                    {/* Tipo */}
                                    {(t('Type'))}
                                </TableHead>
                                <TableHead>
                                    {/* Alta */}
                                    {(t('Created'))}
                                </TableHead>
                                <TableHead>
                                    {/* Balance */}
                                    {(t('Balance'))}
                                </TableHead>
                                <TableHead className="text-right">
                                    {/* Acciones */}
                                    {(t('Actions'))}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                                        No se encontraron clientes que coincidan con la búsqueda
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.Ex_InvoicingAddressID} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <TableCell>
                                            <div className="flex items-start gap-2">
                                                <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    {customer.Business === true ? (
                                                        <Building size={16} />
                                                    ) : (
                                                        <User size={16} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium flex flex-col">
                                                        <p className="truncate">{`${customer.Name}`} {customer.Surname && ` ${customer.Surname}`}
                                                        </p>
                                                        <p className="text-slate-600">{customer.TaxName}</p>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {customer.TaxIDNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm flex flex-col gap-1">
                                                {customer.Email && (
                                                    <div className="text-blue-600 dark:text-blue-400 truncate">
                                                        {customer.Email}
                                                    </div>
                                                )}
                                                {customer.Cell && (
                                                    <div className="text-gray-600 dark:text-gray-400">{customer.Cell}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="truncate max-w-[150px]">
                                                    {truncateText(customer.Address, 20)}
                                                </div>
                                                {customer.City !== "NULL" && (
                                                    <div className="text-gray-600 dark:text-gray-400">
                                                        {customer.City}, {customer.ZipCode !== "NULL" ? customer.ZipCode : ""}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={customer.Business > 0 ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"}>
                                                {customer.Business === false ? "Autónomo" : "Empresa"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(customer.CreateDate || "")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {customer.Balance !== undefined ? formatCurrency(customer.Balance) : "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger>
                                                        {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0"> */}
                                                        <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                                                        <span className="sr-only">Ver detalles</span>
                                                        {/* </Button> */}
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Detalles del cliente
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Aquí puedes ver los detalles del cliente seleccionado, tales como conversiones de Leads, saldo acumulado, saldo pagado, Leads no realizados...
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                    </DialogContent>
                                                </Dialog>

                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                    <Edit size={16} className="text-amber-600 dark:text-amber-400" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal size={16} />
                                                    <span className="sr-only">Más opciones</span>
                                                </Button>
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