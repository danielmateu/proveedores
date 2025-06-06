import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    Building2,
    ClipboardCheck,
    CreditCard,
    FileText,
    LayoutDashboard,
    Loader,
    ShieldAlert,
    ShieldCheck,
    Users,
    Wallet,
    Calendar,
    CheckCircle,
    XCircle,
    CalendarIcon,
    HandCoins,
    MessageSquare
} from "lucide-react";
import StatCard from "@/components/StatCard";
import CalendarRange from "@/components/CalendarRange";

import { Badge } from "@/components/ui/badge";
import CustomersTable from "@/components/tables/CustomersTable";
import NoticesTable from "@/components/tables/NoticesTables";
import PendingPaymentsTable from "@/components/tables/PendingPaymentsTable";
import { useNoticesStore } from "@/zustand/noticesStore";
import { useCustomersStore } from "@/zustand/customersStore";
import { useUserInfoStore } from "@/zustand/userInfoStore";
import { usePendingPaymentsStore } from "@/zustand/pendingPaymentsStore";

import { mockDashboardStats } from "@/mocks/data";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import AcceptedPaymentsTable from '@/components/tables/AcceptedPaymentsTable';
import { AdminChatPanel } from '@/components/chat/AdminChatPanel';

export default function SuperAdminPage() {
    const userInfo = useUserInfoStore((state) => state.userInfo);
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedModule, setSelectedModule] = useState("0");
    const [serviceTypeFilter, setServiceTypeFilter] = useState('0');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [selectedPaymentPeriod, setSelectedPaymentPeriod] = useState(null);

    const { toast } = useToast();
    const { customers, fetchCustomers, isLoading: customersLoading } = useCustomersStore();
    const { notices, fetchNotices, isLoading: noticesLoading, fetchAllNotices, externalNotices, removeNotice } = useNoticesStore();
    const { pendingPayments, fetchPendingPayments, isLoading: paymentsLoading } = usePendingPaymentsStore();
    
    // Añadir un identificador único a cada pago para evitar problemas de referencia
    const pendingPaymentsWithId = useMemo(() => {
        return pendingPayments.map((payment, index) => ({
            ...payment,
            id: payment.PaymentID || `payment-${index}` // Asegurarse de que cada pago tenga un ID único
        }));
    }, [pendingPayments]);

    const pendingPaymentsAmout = useMemo(() => {
        return pendingPayments.reduce((total, payment) => total + payment.TotalAmount, 0);
    }, [pendingPayments]);

    // Pagos realizados, filtramos de external notices los que tienen paid en true
    const paidNotices = useMemo(() => {
        return externalNotices.filter(notice => notice.paid === true);
    }, [externalNotices]);

    const { t } = useTranslation();

    useEffect(() => {
        document.title = 'Rapitecnic | ' + t('SuperAdminPanel');
    }, []);

    useEffect(() => {
        if (userInfo?.Ex_InvoicingAddressID) {
            fetchCustomers();
            fetchNotices(userInfo.Ex_InvoicingAddressID);
            fetchAllNotices();
        }
        fetchPendingPayments();
    }, [userInfo?.Ex_InvoicingAddressID]);

    const filteredNotices = useMemo(() => {
        return externalNotices.filter(notice => {
            const matchesSearch = searchQuery.toLowerCase().trim() === '' ||
                notice.CustomerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notice.CustomerSurname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notice.CustomerPhone?.includes(searchQuery) ||
                notice.CustomerCell?.includes(searchQuery);

            const matchesStatus = statusFilter === 'all' ||
                statusOptionsMapping.find(s =>
                    s.id.toString() === statusFilter &&
                    s.statusId.includes(notice.StatusID.toString())
                ) !== undefined;

            const normalizeDate = (date) => {
                const normalized = new Date(date);
                normalized.setHours(0, 0, 0, 0);
                return normalized;
            };

            const matchesDate = (!dateRange.from || !dateRange.to) ||
                (normalizeDate(notice.CreateDate) >= normalizeDate(dateRange.from) &&
                    normalizeDate(notice.CreateDate) <= normalizeDate(dateRange.to));

            const matchesCustomer = !selectedCustomer ||
                notice.CustomerID === selectedCustomer.CustomerID;

            const matchesModule = selectedModule === "0" ||
                (selectedModule.includes(',')
                    ? selectedModule.split(',').includes(notice.Ex_StatusID.toString())
                    : notice.Ex_StatusID.toString() === selectedModule);

            const matchesUser = userInfo?.Administrator || notice.ExternalLoginID === userInfo?.ExternalLoginID;

            const matchesServiceType = serviceTypeFilter === '0' || notice.ServiceTypeID?.toString() === serviceTypeFilter;

            return matchesSearch && matchesStatus && matchesDate && matchesCustomer &&
                matchesModule && matchesUser && matchesServiceType;
        });
    }, [notices, externalNotices, searchQuery, statusFilter, dateRange, selectedCustomer, selectedModule, userInfo, serviceTypeFilter]);

    const pendingNotices = useMemo(() => {
        return externalNotices.filter(notice => notice.StatusID !== 27 && notice.StatusID !== 38);
    }, [externalNotices]);

    const finalizedNotices = useMemo(() => {
        return externalNotices.filter(notice => notice.StatusID === 27 || notice.StatusID === 38);
    }, [externalNotices]);

    const handleDateRangeChange = (range) => {
        setDateRange({
            from: range?.from ? new Date(range.from) : undefined,
            to: range?.to ? new Date(range.to) : undefined
        });
    };

    const handleApprovePayment = (paymentId) => {
        // In a real implementation, this would call an API endpoint
        toast({
            title: "Pago aprobado",
            description: `El pago #${paymentId} ha sido aprobado correctamente`,
            variant: "success",
        });
    };

    const handleRejectPayment = (paymentId) => {
        // In a real implementation, this would call an API endpoint
        toast({
            title: "Pago rechazado",
            description: `El pago #${paymentId} ha sido rechazado`,
            variant: "destructive",
        });
    };

    const handleResetFilters = () => {
        setDateRange({ from: undefined, to: undefined });
        setSearchQuery('');
        setStatusFilter('all');
        setSelectedCustomer(null);
        setSelectedModule("0");
        setServiceTypeFilter('0');
    };

    const generatePaymentPeriods = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const periods = [];

        // Generate 6 payment periods (3 past, current, 2 future)
        for (let i = -3; i <= 2; i++) {
            // Calculate the month offset
            let targetMonth = currentMonth + Math.floor(i / 2);
            let targetYear = currentYear;

            // Adjust year if needed
            while (targetMonth < 0) {
                targetMonth += 12;
                targetYear--;
            }
            while (targetMonth > 11) {
                targetMonth -= 12;
                targetYear++;
            }

            // Determine if this is first half (1-15) or second half (16-end) of month
            const isFirstHalf = (i % 2 === 0);

            // Create start and end dates
            let startDate, endDate;

            if (isFirstHalf) {
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth, 15);
            } else {
                startDate = new Date(targetYear, targetMonth, 16);
                // Last day of month
                endDate = new Date(targetYear, targetMonth + 1, 0);
            }

            // Determine if this period is current
            const isPast = endDate < today;
            const isCurrent = !isPast && startDate <= today && today <= endDate;

            periods.push({
                id: i,
                startDate,
                endDate,
                label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                status: isPast ? "completed" : isCurrent ? "current" : "upcoming"
            });
        }

        return periods;
    };

    const paymentPeriods = useMemo(() => generatePaymentPeriods(), []);

    const handleProcessPayments = () => {
        if (!selectedPaymentPeriod) {
            toast({
                title: "Error",
                description: "Por favor seleccione un período de pago",
                variant: "destructive",
            });
            return;
        }

        setProcessingPayment(true);

        // Simulate API call
        setTimeout(() => {
            setProcessingPayment(false);
            setShowPaymentDialog(false);

            toast({
                title: "Pagos procesados",
                description: `Se han procesado los pagos para el período ${selectedPaymentPeriod.label}`,
                variant: "success",
            });

            // Reset selection
            setSelectedPaymentPeriod(null);
        }, 2000);
    };

    const handleDeleteNotice = async (noticeId) => {
        // Optimistically update the UI by removing the notice from local state
        removeNotice(noticeId);

        // Then refresh the notices list to ensure sync with backend
        if (userInfo?.Ex_InvoicingAddressID) {
            // Small delay to ensure backend has processed the deletion
            setTimeout(() => {
                fetchAllNotices();
            }, 500);
        }

        toast({
            title: "Aviso eliminado",
            description: "El aviso ha sido eliminado correctamente",
            variant: "success",
        });
    };

    if (customersLoading || noticesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-4" />
                    <p className="mt-4 text-gray-600">{t("loading")}</p>
                </div>
            </div>
        );
    }

    const isFilterActive = dateRange.from || dateRange.to || searchQuery || statusFilter !== 'all' ||
        selectedCustomer || selectedModule !== "0" || serviceTypeFilter !== '0';

    const clearFilter = () => {
        setDateRange({ from: undefined, to: undefined });
        setSearchQuery('');
        setStatusFilter('all');
        setSelectedCustomer(null);
        setSelectedModule("0");
        setServiceTypeFilter('0');
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start gap-2 justify-between lg:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400 hidden sm:block" />
                            <h1
                                className="text-3xl font-bold text-gray-900 dark:text-white truncate"
                                onClick={handleResetFilters}
                            >
                                {t("PanelSuperAdmin")}
                            </h1>

                            {isFilterActive && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="mt-2 flex items-center gap-2 hover:cursor-pointer clean-filter">
                                            <Badge
                                                onClick={clearFilter}
                                                className="bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800 hover:text-white">
                                                <CalendarIcon className="w-3 h-3 mr-1" />
                                                {t('ActiveFilter')}
                                            </Badge>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {t('ClickToClearFilter')}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center space-x-2">
                            <Badge className="hidden md:flex"
                                variant={"info"}
                            >
                                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                                {t("SuperAdminAccess")}
                            </Badge>

                            <Button
                                disabled
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => setShowPaymentDialog(true)}
                            >
                                <CreditCard className="h-4 w-4" />
                                Procesar Pagos Quincenales
                            </Button>

                            <CalendarRange
                                date={dateRange}
                                setDate={handleDateRangeChange}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 ">
                        <TabsTrigger value="dashboard" className="items-center">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="customers">
                            <Users className="h-4 w-4 mr-2" />
                            {t("customers")}
                        </TabsTrigger>
                        <TabsTrigger value="notices">
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            {t("notices")}
                        </TabsTrigger>
                        <TabsTrigger value="payments">
                            <Wallet className="h-4 w-4 mr-2" />
                            {t("PendingPayments")}
                        </TabsTrigger>
                        <TabsTrigger value="completed-payments">
                            <HandCoins className="h-4 w-4 mr-2" />
                            Pagos realizados
                        </TabsTrigger>
                        <TabsTrigger value="chat">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <StatCard
                                title={(t("TotalCustomers"))}
                                value={customers.length}
                                description={`${(t('active', { count: customers.length }))}, ${(t('inactive', { count: mockDashboardStats.customers.inactive }))}`}
                                icon={Building2}
                                trend={{ value: 8, isPositive: true }}
                                className="bg-blue-50 dark:bg-blue-950"
                            />
                            <StatCard
                                title={(t("TotalNotices"))}
                                value={externalNotices.length}
                                description={`${pendingNotices.length} ${(t('InProcess'))}, 
                                ${finalizedNotices.length} ${(t('Finished'))}
                                `}
                                icon={Activity}
                                className="bg-amber-50 dark:bg-amber-950"
                            />
                            <StatCard
                                title={(t("PendingPayments"))}
                                value={pendingPayments?.length}
                                description={`${pendingPaymentsAmout}€ ${t('ToProcess')}`}
                                icon={CreditCard}
                                className="bg-purple-50 dark:bg-purple-950"
                            />
                            <StatCard
                                title={(t("TotalInvoiced"))}
                                value={`${pendingPaymentsAmout}€`}
                                description={t('ThisMonth')}
                                icon={FileText}
                                trend={{ value: 0, isPositive: true }}
                                className="bg-green-50 dark:bg-green-950"
                            />
                        </div>

                        <div className="mt-6">
                            <NoticesTable notices={filteredNotices.slice(0, 10)} title={(t('Lastnotices'))} onDeleteNotice={handleDeleteNotice} userInfo={userInfo} />
                        </div>

                        <div className="mt-6">
                            <PendingPaymentsTable
                                payments={pendingPaymentsWithId}
                                title={(t('PendingPayments'))}
                                onApprove={handleApprovePayment}
                                onReject={handleRejectPayment}
                            />
                        </div>

                        <div className="mt-6">
                            <AcceptedPaymentsTable
                                payments={paidNotices}
                            />
                        </div>

                        <div className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Calendario de Pagos Quincenales
                                    </CardTitle>
                                    <CardDescription>
                                        Gestione los pagos quincenales a proveedores de servicios
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {paymentPeriods.map(period => (
                                            <Card
                                                key={period.id}
                                                className={`cursor-pointer transition-all ${period.status === "completed"
                                                    ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                                                    : period.status === "current"
                                                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                                        : "bg-gray-50 dark:bg-gray-800"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedPaymentPeriod(period);
                                                    setShowPaymentDialog(true);
                                                }}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">{period.label}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {period.status === "completed"
                                                                    ? "Completado"
                                                                    : period.status === "current"
                                                                        ? "Período actual"
                                                                        : "Próximo período"}
                                                            </p>
                                                        </div>
                                                        {period.status === "completed" && (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="customers">
                        <CustomersTable
                            customers={customers}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            dateRange={dateRange}
                        />
                    </TabsContent>

                    <TabsContent value="notices">
                        <NoticesTable notices={filteredNotices} title={(t('AllNotices'))} all={true} onDeleteNotice={handleDeleteNotice} userInfo={userInfo} />
                    </TabsContent>

                    <TabsContent value="payments">
                        <PendingPaymentsTable
                            payments={pendingPayments}
                            onApprove={handleApprovePayment}
                            onReject={handleRejectPayment}
                        />
                    </TabsContent>

                    <TabsContent value="completed-payments">
                        <AcceptedPaymentsTable
                            payments={paidNotices}
                        />
                    </TabsContent>

                    <TabsContent value="chat">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Centro de mensajes
                                </CardTitle>
                                <CardDescription>
                                    Gestione las conversaciones con los usuarios de la plataforma
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AdminChatPanel />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Procesar Pagos Quincenales</DialogTitle>
                        <DialogDescription>
                            Seleccione el período para procesar los pagos a los proveedores de servicios.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm font-medium">Período de pago</label>
                            <div className="grid grid-cols-1 gap-2">
                                {paymentPeriods.map(period => (
                                    <div
                                        key={period.id}
                                        className={`p-3 border rounded-md cursor-pointer ${selectedPaymentPeriod?.id === period.id
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                            : "border-gray-200 dark:border-gray-700"
                                            }`}
                                        onClick={() => setSelectedPaymentPeriod(period)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{period.label}</span>
                                            {selectedPaymentPeriod?.id === period.id && (
                                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {period.status === "completed"
                                                ? "Período pasado"
                                                : period.status === "current"
                                                    ? "Período actual"
                                                    : "Período futuro"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleProcessPayments}
                            disabled={!selectedPaymentPeriod || processingPayment}
                        >
                            {processingPayment ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                "Procesar Pagos"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}