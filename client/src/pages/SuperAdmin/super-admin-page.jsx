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
    MessageSquare
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL;
const socket = io(apiUrl);

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
    const [chatUsers, setChatUsers] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChatDialog, setShowChatDialog] = useState(false);
    const messagesEndRef = useRef(null);

    const { toast } = useToast();
    const { customers, fetchCustomers, isLoading: customersLoading } = useCustomersStore();
    const { notices, fetchNotices, isLoading: noticesLoading, fetchAllNotices, externalNotices } = useNoticesStore();
    const { pendingPayments, fetchPendingPayments, isLoading: paymentsLoading } = usePendingPaymentsStore();
    const { t } = useTranslation();

    useEffect(() => {
        document.title = 'Rapitecnic | ' + t('SuperAdminPanel');
        
        // Connect to socket for chat
        socket.on('connect', () => {
            console.log('Connected to socket as admin');
            
            // Identify as superadmin
            socket.emit('identify', {
                userId: userInfo?.ExternalLoginID,
                name: `${userInfo?.Name || ''} ${userInfo?.Surname || ''}`.trim(),
                role: 'admin',
                isSuperAdmin: true
            });
        });
        
        // Listen for user status changes
        socket.on('user-status', (data) => {
            setChatUsers(prev => {
                // Update existing user or add new one
                const existingUserIndex = prev.findIndex(u => u.userId === data.userId);
                if (existingUserIndex >= 0) {
                    const updatedUsers = [...prev];
                    updatedUsers[existingUserIndex] = {
                        ...updatedUsers[existingUserIndex],
                        status: data.status,
                        lastSeen: data.timestamp
                    };
                    return updatedUsers;
                } else {
                    return [...prev, {
                        userId: data.userId,
                        name: data.name,
                        status: data.status,
                        lastSeen: data.timestamp,
                        unreadCount: 0
                    }];
                }
            });
        });
        
        // Listen for chat messages
        socket.on('chat-message', (data) => {
            // Only process messages not sent by this user
            if (data.sender !== userInfo?.ExternalLoginID) {
                setChatMessages(prev => [...prev, data]);
                
                // Update unread count for user
                setChatUsers(prev => {
                    const updatedUsers = [...prev];
                    const userIndex = updatedUsers.findIndex(u => u.userId === data.sender);
                    if (userIndex >= 0) {
                        if (!selectedChatUser || selectedChatUser.userId !== data.sender || !showChatDialog) {
                            updatedUsers[userIndex].unreadCount = (updatedUsers[userIndex].unreadCount || 0) + 1;
                        }
                    }
                    return updatedUsers;
                });
            }
        });
        
        return () => {
            socket.off('user-status');
            socket.off('chat-message');
        };
    }, [userInfo, selectedChatUser, showChatDialog]);

    // Scroll to bottom when chat messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

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
            let targetMonth = currentMonth + Math.floor(i/2);
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
        // Refresh the notices list after deletion
        if (userInfo?.Ex_InvoicingAddressID) {
            fetchAllNotices();
        }
        
        toast({
            title: "Aviso eliminado",
            description: "El aviso ha sido eliminado correctamente",
            variant: "success",
        });
    };

    const handleSendChatMessage = () => {
        if (!newMessage.trim() || !selectedChatUser) return;
        
        const messageData = {
            id: Date.now(),
            text: newMessage,
            sender: userInfo.ExternalLoginID,
            senderName: `${userInfo.Name} ${userInfo.Surname || ''}`.trim(),
            recipient: selectedChatUser.userId,
            timestamp: new Date().toISOString(),
            isAdmin: true
        };
        
        // Send message via socket
        socket.emit('chat-message', messageData);
        
        // Add to local state
        setChatMessages(prev => [...prev, messageData]);
        
        // Clear input
        setNewMessage('');
    };

    const handleOpenChat = (user) => {
        setSelectedChatUser(user);
        
        // Reset unread count for this user
        setChatUsers(prev => {
            const updatedUsers = [...prev];
            const userIndex = updatedUsers.findIndex(u => u.userId === user.userId);
            if (userIndex >= 0) {
                updatedUsers[userIndex].unreadCount = 0;
            }
            return updatedUsers;
        });
        
        // Filter messages for this user
        const userMessages = chatMessages.filter(msg => 
            msg.sender === user.userId || 
            (msg.sender === userInfo.ExternalLoginID && msg.recipient === user.userId)
        );
        
        setShowChatDialog(true);
    };

    const getTotalUnreadMessages = () => {
        return chatUsers.reduce((total, user) => total + (user.unreadCount || 0), 0);
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
                                {t("SuperAdminAccess")}
                            </Badge>
                            
                            <Button 
                                variant="outline" 
                                className="flex items-center gap-2 relative"
                                onClick={() => setShowChatDialog(true)}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Chat de Soporte
                                {getTotalUnreadMessages() > 0 && (
                                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                        {getTotalUnreadMessages()}
                                    </Badge>
                                )}
                            </Button>
                            
                            <Button 
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
                        <TabsTrigger value="chat">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                            {getTotalUnreadMessages() > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {getTotalUnreadMessages()}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <StatCard
                                title={(t("TotalCustomers"))}
                                value={customers.length}
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
                            <NoticesTable 
                                notices={filteredNotices.slice(0, 10)} 
                                title={(t('Lastnotices'))} 
                                onDeleteNotice={handleDeleteNotice}
                            />
                        </div>

                        <div className="mt-6">
                            <PendingPaymentsTable
                                payments={filteredPayments}
                                title={(t('PendingPayments'))}
                                onApprove={handleApprovePayment}
                                onReject={handleRejectPayment}
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
                                                className={`cursor-pointer transition-all ${
                                                    period.status === "completed" 
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
                        <NoticesTable 
                            notices={filteredNotices} 
                            title={(t('AllNotices'))} 
                            all={true} 
                            onDeleteNotice={handleDeleteNotice}
                        />
                    </TabsContent>

                    <TabsContent value="payments">
                        <PendingPaymentsTable
                            payments={filteredPayments}
                            onApprove={handleApprovePayment}
                            onReject={handleRejectPayment}
                        />
                    </TabsContent>
                    
                    <TabsContent value="chat">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Chat de Soporte
                                </CardTitle>
                                <CardDescription>
                                    Gestione las conversaciones con los usuarios de la plataforma
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="col-span-1 border rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b">
                                            <h3 className="font-medium">Usuarios</h3>
                                        </div>
                                        <ScrollArea className="h-[500px]">
                                            {chatUsers.length > 0 ? (
                                                <div className="divide-y">
                                                    {chatUsers.map(user => (
                                                        <div 
                                                            key={user.userId}
                                                            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between ${
                                                                selectedChatUser?.userId === user.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                            }`}
                                                            onClick={() => handleOpenChat(user)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarFallback>
                                                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                                                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                                    }`}></span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{user.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {user.status === 'online' ? 'En línea' : 'Desconectado'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {user.unreadCount > 0 && (
                                                                <Badge variant="destructive" className="rounded-full">
                                                                    {user.unreadCount}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center text-gray-500">
                                                    No hay usuarios conectados
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    
                                    <div className="col-span-2 border rounded-lg overflow-hidden">
                                        {selectedChatUser ? (
                                            <>
                                                <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>
                                                                {selectedChatUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-medium">{selectedChatUser.name}</h3>
                                                            <p className="text-xs text-gray-500">
                                                                {selectedChatUser.status === 'online' ? 'En línea' : 'Desconectado'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <ScrollArea className="h-[400px] p-4">
                                                    <div className="space-y-4">
                                                        {chatMessages
                                                            .filter(msg => 
                                                                msg.sender === selectedChatUser.userId || 
                                                                (msg.sender === userInfo.ExternalLoginID && msg.recipient === selectedChatUser.userId)
                                                            )
                                                            .map(message => (
                                                                <div 
                                                                    key={message.id} 
                                                                    className={`flex ${message.sender === userInfo.ExternalLoginID ? 'justify-end' : 'justify-start'}`}
                                                                >
                                                                    <div className={`max-w-[70%] rounded-lg p-3 ${
                                                                        message.sender === userInfo.ExternalLoginID 
                                                                            ? 'bg-blue-500 text-white' 
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                                    }`}>
                                                                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                                                                        <p className="text-xs mt-1 opacity-70">
                                                                            {new Date(message.timestamp).toLocaleTimeString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                        <div ref={messagesEndRef} />
                                                    </div>
                                                </ScrollArea>
                                                
                                                <div className="p-3 border-t">
                                                    <div className="flex gap-2">
                                                        <Textarea
                                                            value={newMessage}
                                                            onChange={(e) => setNewMessage(e.target.value)}
                                                            placeholder="Escribe un mensaje..."
                                                            className="resize-none min-h-[40px]"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSendChatMessage();
                                                                }
                                                            }}
                                                        />
                                                        <Button onClick={handleSendChatMessage}>
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full flex items-center justify-center p-6">
                                                <div className="text-center">
                                                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                        Selecciona un usuario para chatear
                                                    </h3>
                                                    <p className="text-gray-500 mt-2">
                                                        Las conversaciones aparecerán aquí
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                        className={`p-3 border rounded-md cursor-pointer ${
                                            selectedPaymentPeriod?.id === period.id 
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
            
            <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Chat de Soporte</DialogTitle>
                        <DialogDescription>
                            Gestione las conversaciones con los usuarios de la plataforma
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow overflow-hidden">
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b">
                                <h3 className="font-medium">Usuarios</h3>
                            </div>
                            <ScrollArea className="h-[400px]">
                                {chatUsers.length > 0 ? (
                                    <div className="divide-y">
                                        {chatUsers.map(user => (
                                            <div 
                                                key={user.userId}
                                                className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between ${
                                                    selectedChatUser?.userId === user.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                }`}
                                                onClick={() => handleOpenChat(user)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback>
                                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                        }`}></span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {user.status === 'online' ? 'En línea' : 'Desconectado'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {user.unreadCount > 0 && (
                                                    <Badge variant="destructive" className="rounded-full">
                                                        {user.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-500">
                                        No hay usuarios conectados
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                        
                        <div className="col-span-2 border rounded-lg overflow-hidden flex flex-col">
                            {selectedChatUser ? (
                                <>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {selectedChatUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-medium">{selectedChatUser.name}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {selectedChatUser.status === 'online' ? 'En línea' : 'Desconectado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <ScrollArea className="flex-grow p-4 h-[300px]">
                                        <div className="space-y-4">
                                            {chatMessages
                                                .filter(msg => 
                                                    msg.sender === selectedChatUser.userId || 
                                                    (msg.sender === userInfo.ExternalLoginID && msg.recipient === selectedChatUser.userId)
                                                )
                                                .map(message => (
                                                    <div 
                                                        key={message.id} 
                                                        className={`flex ${message.sender === userInfo.ExternalLoginID ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[70%] rounded-lg p-3 ${
                                                            message.sender === userInfo.ExternalLoginID 
                                                                ? 'bg-blue-500 text-white' 
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                        }`}>
                                                            <p className="whitespace-pre-wrap break-words">{message.text}</p>
                                                            <p className="text-xs mt-1 opacity-70">
                                                                {new Date(message.timestamp).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                    
                                    <div className="p-3 border-t mt-auto">
                                        <div className="flex gap-2">
                                            <Textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Escribe un mensaje..."
                                                className="resize-none min-h-[40px]"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendChatMessage();
                                                    }
                                                }}
                                            />
                                            <Button onClick={handleSendChatMessage}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center p-6">
                                    <div className="text-center">
                                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            Selecciona un usuario para chatear
                                        </h3>
                                        <p className="text-gray-500 mt-2">
                                            Las conversaciones aparecerán aquí
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Add missing imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useRef } from "react";

// Add missing statusOptionsMapping
const statusOptionsMapping = [
    {
        id: 1,
        name: 'InProcess',
        statusId: ["1", "26"],
    },
    {
        id: 2,
        name: 'Finished',
        statusId: ["27"]
    },
    {
        id: 3,
        name: 'Charged',
        statusId: ["38"]
    },
    {
        id: 4,
        name: 'Canceled',
        statusId: ["20"]
    },
];