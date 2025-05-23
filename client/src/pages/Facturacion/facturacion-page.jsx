
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserInfoStore } from "@/zustand/userInfoStore";
import { useNoticesStore } from "@/zustand/noticesStore";
import { AlertCircle, Building2, Clock, LucideEuro, PiggyBank, Annoyed, CalendarIcon, BookOpenCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import CalendarRange from "@/components/CalendarRange";
import { cn, isWithinDateRange } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import NoticesTable from "@/components/tables/NoticesTables";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LeadInfoDialog } from "@/components/dialogs/LeadInfoDialog";
import { useTranslation } from "react-i18next";
import { useTourSteps } from "@/hooks/useTourSteps";
import { useTour } from "@reactour/tour";
import { WalletDialogWrapper } from "@/components/dialogs/WalletDialogWrapper";
import { usePendingPaymentsStore } from "@/zustand/pendingPaymentsStore";
import { Button } from "@/components/ui/button";

export default function FacturacionPage() {
    const { t } = useTranslation();
    const userInfo = useUserInfoStore((state) => state.userInfo);

    const { pendingPayments, fetchPendingPayments, isLoading: paymentsLoading } = usePendingPaymentsStore();

    console.log('pendingPayments', pendingPayments);

    const { notices, fetchNotices, isLoading } = useNoticesStore();
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [userPendingPayments, setUserPendingPayments] = useState([]);

    // console.log('userPendingPayments', userPendingPayments);

    // Filtraremos los pendinPayments por el Ex_InvoicingAddressID
    useEffect(() => {
        if (userInfo?.Ex_InvoicingAddressID) {
            const filteredPayments = pendingPayments.filter(payment => payment.Ex_InvoicingAddressID === userInfo.Ex_InvoicingAddressID);
            setUserPendingPayments(filteredPayments);
        }
    }, [pendingPayments, userInfo?.Ex_InvoicingAddressID]);

    const bonusTable = [
        {
            type: t('RepairLeads'),
            volumeMonthly: '<100',
            compensation: '10€',
            volume: '>100',
            value: '15€'
        },
        {
            type: t('InstallationLeads'),
            volumeMonthly: '<100',
            compensation: '15€',
            volume: '>100',
            value: '20€'
        },
        {
            type: t('ClimateMaintenanceLeads'),
            volumeMonthly: '<100',
            compensation: '15€',
            volume: '>100',
            value: '20€'
        }
    ];

    const getStatusIds = (status) => {
        switch (status) {
            case 'inProcess':
                return [26, 1];
            case 'accumulated':
                return [27];
            case 'billed':
                return [38];
            case 'cancelled':
                return [20];
            default:
                return [];
        }
    };

    const steps = useTourSteps();
    const { isOpen, currentStep, setIsOpen, setCurrentStep, setSteps } = useTour()

    useEffect(() => {
        if (isOpen) {
            setSteps(steps);
        }
        setCurrentStep(0);
        document.title = 'Rapitecnic | ' + t('FacturationPage');
    }, []);

    useEffect(() => {
        if (userInfo?.Ex_InvoicingAddressID) {
            fetchNotices(userInfo.Ex_InvoicingAddressID);
            fetchPendingPayments();
        }
    }, [userInfo?.Ex_InvoicingAddressID, fetchNotices, fetchPendingPayments]);

    const filteredNotices = useMemo(() => {
        let filtered = notices;

        if (dateRange.from || dateRange.to) {
            filtered = filtered.filter(notice =>
                isWithinDateRange(new Date(notice.CreateDate), dateRange)
            );
        }

        if (selectedStatus) {
            const statusIds = getStatusIds(selectedStatus);
            filtered = filtered.filter(notice =>
                statusIds.includes(notice.StatusID)
            );
        }

        return filtered;
    }, [notices, dateRange, selectedStatus]);

    const calculateBillingStats = (noticesToProcess) => {
        const stats = {
            accumulated: { count: 0, value: 0, percentage: 0 },
            billed: { count: 0, value: 0, percentage: 0 },
            inProcess: { count: 0, value: 0, percentage: 0 },
            cancelled: { count: 0, value: 0, percentage: 0 }
        };

        noticesToProcess.forEach(notice => {
            const baseValue = notice.ServiceTypeID === 1 ? 10 :
                notice.ServiceTypeID === 2 ? 15 :
                    notice.ServiceTypeID === 3 ? 15 : 10;

            if (notice.StatusID === 27) {
                stats.accumulated.count++;
                stats.accumulated.value += baseValue;
            } else if (notice.StatusID === 38) {
                stats.billed.count++;
                stats.billed.value += baseValue;
            } else if ([26, 1].includes(notice.StatusID)) {
                stats.inProcess.count++;
                stats.inProcess.value += baseValue;
            } else if (notice.StatusID === 20) {
                stats.cancelled.count++;
                stats.cancelled.value += 0;
            }
        });

        const totalNotices = noticesToProcess.length;
        if (totalNotices > 0) {
            stats.accumulated.percentage = (stats.accumulated.count / totalNotices) * 100;
            stats.billed.percentage = (stats.billed.count / totalNotices) * 100;
            stats.inProcess.percentage = (stats.inProcess.count / totalNotices) * 100;
            stats.cancelled.percentage = (stats.cancelled.count / totalNotices) * 100;
        }

        return stats;
    };

    const billingStats = useMemo(() => calculateBillingStats(notices), [notices]);

    const handleDateRangeChange = (range) => {
        setDateRange({
            from: range?.from ? new Date(range.from) : undefined,
            to: range?.to ? new Date(range.to) : undefined
        });
    };

    const handleCardClick = (status) => {
        setSelectedStatus(status);
        setDialogOpen(true);
        // setCurrentStep(4)
        handleCloseTour();
    };

    const statusFilteredNotices = useMemo(() => {
        if (!selectedStatus) return [];
        const statusIds = getStatusIds(selectedStatus);
        return notices.filter(notice => statusIds.includes(notice.StatusID));
    }, [selectedStatus, notices]);

    const isFilterActive = !!dateRange.from || !!dateRange.to || !!selectedStatus;

    const getCardStyles = (status) => {
        const baseStyles = "transition-all duration-300 cursor-pointer hover:shadow-lg";

        switch (status) {
            case 'inProcess':
                return `${baseStyles} in-process-card`;
            case 'accumulated':
                return `${baseStyles} border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900 accumulated-card`;
            case 'billed':
                return `${baseStyles} border-sky-200 bg-sky-50 dark:bg-sky-950 dark:border-sky-900`;
            case 'cancelled':
                return `${baseStyles} border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900`;
            default:
                return baseStyles;
        }
    };

    const clearFilter = () => {
        setDateRange({ from: undefined, to: undefined });
        setSelectedStatus(null);
        handleCloseTour();
    }

    const startTour = () => {
        setCurrentStep(0);
        setSteps(steps);
        setIsOpen(true);
    };

    const handleCloseTour = () => {
        setIsOpen(false);
        setCurrentStep(0);
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t('Billing')}
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
                    <div className="flex gap-8">
                        <Button
                            onClick={startTour}
                            variant="gradientGlow"
                        // className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {/* Iniciar Tour */}
                            {t('StartTour')}
                        </Button>
                        <div className="flex items-center justify-center gap-4 calendar-filter">

                            <div className="relative monedero-info"
                                onClick={handleCloseTour}
                            >
                                <WalletDialogWrapper

                                />
                            </div>
                            <CalendarRange
                                date={dateRange}
                                setDate={handleDateRangeChange}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-4 facturacion-header">
                {!userInfo?.Administrator ? (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                <CardTitle className="text-orange-800 dark:text-orange-400">
                                    {t('RestrictedAccess')}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-orange-700 dark:text-orange-300">
                                {t('NoAdminPermissions')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4 text-orange-700 dark:text-orange-300">
                                <Building2 className="h-5 w-5 mt-1" />
                                <div className="space-y-2">
                                    <p>{t('BillingDataAdminOnly')}</p>
                                    <p className="text-sm">{t('ContactSupport')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 cards-filter">
                            <Card
                                className={getCardStyles('inProcess')}
                                onClick={() => handleCardClick('inProcess')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('LeadsInProcess')}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {billingStats.inProcess.count} {t('Leads', { count: billingStats.inProcess.count })}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-muted-foreground"></p>
                                        <Badge variant="outline" className="ml-2">
                                            {billingStats.inProcess.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={getCardStyles('accumulated')}
                                onClick={
                                    () => {
                                        handleCardClick('accumulated')
                                        setCurrentStep(4)
                                    }
                                }
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('AccumulatedLeads')}
                                    </CardTitle>
                                    {/* <PiggyBank className="h-4 w-4 text-muted-foreground" /> */}
                                    <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {billingStats.accumulated.count} {t('Leads', { count: billingStats.accumulated.count })}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-muted-foreground">
                                            {t('Value')}: {billingStats.accumulated.value}€
                                        </p>
                                        <Badge variant="outline" className="ml-2">
                                            {billingStats.accumulated.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={getCardStyles('billed')}
                                onClick={() => handleCardClick('billed')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('BilledLeads')}
                                    </CardTitle>
                                    <LucideEuro className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {billingStats.billed.count} {t('Leads', { count: billingStats.billed.count })}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-muted-foreground">
                                            {t('Value')}: {billingStats.billed.value}€
                                        </p>
                                        <Badge variant="outline" className="ml-2">
                                            {billingStats.billed.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={getCardStyles('cancelled')}
                                onClick={() => handleCardClick('cancelled')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t('CancelledLeads')}
                                    </CardTitle>
                                    <Annoyed className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {billingStats.cancelled.count} {t('Leads', { count: billingStats.cancelled.count })}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-muted-foreground"></p>
                                        <Badge variant="outline" className="ml-2">
                                            {billingStats.cancelled.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key="filtered-table"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", duration: 0.5 }}
                            >
                                <NoticesTable
                                    notices={filteredNotices}
                                    title={t('NoticesDateRange', {
                                        from: dateRange.from ? dateRange.from.toLocaleDateString() : '',
                                        to: dateRange.to ? dateRange.to.toLocaleDateString() : ''
                                    })}
                                />
                            </motion.div>
                        </AnimatePresence>

                        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4")}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('CollaboratorBonuses')}</CardTitle>
                                    <CardDescription>
                                        {t('BonusTableDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('PriceTable')}</TableHead>
                                                    <TableHead>{t('Volume')}</TableHead>
                                                    <TableHead>{t('Value')}</TableHead>
                                                    <TableHead>{t('Volume')}</TableHead>
                                                    <TableHead>{t('Value')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bonusTable.map((row, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{row.type}</TableCell>
                                                        <TableCell>{row.volumeMonthly}</TableCell>
                                                        <TableCell>{row.compensation}</TableCell>
                                                        <TableCell>{row.volume}</TableCell>
                                                        <TableCell>{row.value}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('BillingProcess')}</CardTitle>
                                    <CardDescription>
                                        {t('BillingProcessDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {t('LeadsBilling')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('BillingDates')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {t('AutomaticInvoiceGeneration')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('GeneratedAfterBilling')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {t('TransferIssuance')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('ProcessedAfterBilling')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <LeadInfoDialog
                            isOpen={dialogOpen}
                            onOpenChange={setDialogOpen}
                            notices={statusFilteredNotices}
                            status={selectedStatus}
                        />
                    </>
                )}
            </main>
        </div>
    );
}