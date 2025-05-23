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
} from "lucide-react";
import StatCard from "@/components/StatCard";
import CalendarRange from "@/components/CalendarRange";
import { isWithinDateRange } from "@/lib/utils";

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

// import { Head } from '@unhead/react';

export default function SuperAdminPage() {
    const userInfo = useUserInfoStore((state) => state.userInfo);
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedModule, setSelectedModule] = useState("0");
    const [serviceTypeFilter, setServiceTypeFilter] = useState('0');

    const { customers, fetchCustomers, isLoading: customersLoading } = useCustomersStore();
    // console.log('customers', customers);
    const { notices, fetchNotices, isLoading: noticesLoading, fetchAllNotices, externalNotices } = useNoticesStore();
    // console.log('notices', notices);
    // console.log('externalNotices', externalNotices);
    const { pendingPayments, fetchPendingPayments, isLoading: paymentsLoading } = usePendingPaymentsStore();
    // console.log('pendingPayments', pendingPayments);
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
    }, [notices, searchQuery, statusFilter, dateRange, selectedCustomer, selectedModule, userInfo, serviceTypeFilter]);

    const filteredPayments = useMemo(() => {
        if (!dateRange.from && !dateRange.to) return pendingPayments;

        return pendingPayments.filter(payment =>
            isWithinDateRange(new Date(payment.createDate), dateRange)
        );
    }, [dateRange, pendingPayments]);

    const pendingNotices = useMemo(() => {
        return externalNotices.filter(notice => notice.StatusID !== 27 && notice.StatusID !== 38);
    }, [notices]);

    const handleDateRangeChange = (range) => {
        setDateRange({
            from: range?.from ? new Date(range.from) : undefined,
            to: range?.to ? new Date(range.to) : undefined
        });
    };

    const handleApprovePayment = (paymentId) => {
        console.log(`Approving payment ${paymentId}`);
    };

    const handleRejectPayment = (paymentId) => {
        console.log(`Rejecting payment ${paymentId}`);
    };

    const handleResetFilters = () => {
        setDateRange({ from: undefined, to: undefined });
        setSearchQuery('');
        setStatusFilter('all');
        setSelectedCustomer(null);
        setSelectedModule("0");
        setServiceTypeFilter('0');
    };

    if (customersLoading || noticesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div> */}
                    <Loader className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-4" />
                    <p className="mt-4 text-gray-600">{t("loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <h1
                                        className="text-3xl font-bold text-gray-900 dark:text-white hover:cursor-pointer truncate"
                                        onClick={handleResetFilters}
                                    >
                                        {/* Panel SuperAdmin */}
                                        {t("PanelSuperAdmin")}
                                    </h1>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="">
                                    <p>{t('ClearFilters')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge className="hidden md:flex"
                                variant={"info"}
                            >
                                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                                {/* Acceso SuperAdmin */}
                                {t("SuperAdminAccess")}
                            </Badge>
                            {/* <CalendarRange
                                date={dateRange}
                                setDate={handleDateRangeChange}
                            /> */}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="">
                    <TabsList className="bg-gray-100 dark:bg-gray-700 p-1">
                        <TabsTrigger value="dashboard" className="hidden sm:flex items-center">
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
                    </TabsList>

                    <TabsContent value="dashboard">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <StatCard
                                title={(t("TotalCustomers"))}
                                value={customers.length}
                                // description={`${mockDashboardStats.customers.active} activos, ${mockDashboardStats.customers.inactive} inactivos`}
                                // description={`${customers.length} activos, ${mockDashboardStats.customers.inactive} inactivos`}
                                description={`${(t('active', { count: mockDashboardStats.customers.active }))}, ${(t('inactive', { count: mockDashboardStats.customers.inactive }))}`}
                                icon={Building2}
                                trend={{ value: 8, isPositive: true }}
                                className="bg-blue-50 dark:bg-blue-950"
                            />
                            <StatCard
                                title={(t("TotalNotices"))}
                                value={externalNotices.length}
                                description={`${pendingNotices.length} ${(t('InProcess'))}`}
                                icon={Activity}
                                className="bg-amber-50 dark:bg-amber-950"
                            />
                            <StatCard
                                title={(t("PendingPayments"))}
                                value={pendingPayments?.length}
                                description={`${mockDashboardStats.payments.pendingAmount}€ ${t('ToProcess')}`}
                                icon={CreditCard}
                                className="bg-purple-50 dark:bg-purple-950"
                            />
                            <StatCard
                                title={(t("TotalInvoiced"))}
                                value={`${mockDashboardStats.payments.totalAmount}€`}
                                description={t('ThisMonth')}
                                icon={FileText}
                                trend={{ value: 12, isPositive: true }}
                                className="bg-green-50 dark:bg-green-950"
                            />
                        </div>

                        <div className="mt-6">
                            <NoticesTable notices={filteredNotices.slice(0, 10)} title={(t('Lastnotices'))} />
                        </div>

                        <div className="mt-6">
                            <PendingPaymentsTable
                                payments={filteredPayments}
                                title={(t('PendingPayments'))}
                                onApprove={handleApprovePayment}
                                onReject={handleRejectPayment}
                            />
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
                        <NoticesTable notices={filteredNotices} title={(t('AllNotices'))} all={true} />
                    </TabsContent>

                    <TabsContent value="payments">
                        <PendingPaymentsTable
                            payments={filteredPayments}
                            onApprove={handleApprovePayment}
                            onReject={handleRejectPayment}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}