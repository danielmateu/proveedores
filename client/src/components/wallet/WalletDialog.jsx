import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCent, ChevronRight, Download, ListFilter, ReceiptText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletSummary } from "./WalletSummary";
import { WalletTransactionList } from "./WalletTransactionList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"


export function WalletDialog({ transactions, isLoading }) {

    console.log('Transactions:', transactions);
    const [filter, setFilter] = useState("all");
    const [view, setView] = useState("summary");

    // Calculate summary data
    const summaryData = useMemo(() => {
        if (!transactions.length) {
            return {
                balance: 0,
                transactionCount: 0,
                oldestDate: null,
                newestDate: null
            };
        }

        // Calculate total pending balance
        const balance = transactions.reduce((sum, tx) =>
            tx.Status.toLowerCase() === "pending" ? sum + tx.Amount : sum, 0);

        // Find date range
        const dates = transactions.map(tx => new Date(tx.Date));
        const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));

        return {
            balance,
            transactionCount: transactions.length,
            oldestDate,
            newestDate
        };
    }, [transactions]);

    // Filter transactions based on selected filter
    const filteredTransactions = useMemo(() => {
        if (filter === "all") return transactions;

        return transactions.filter(tx =>
            tx.Status.toLowerCase() === filter.toLowerCase()
        );
    }, [transactions, filter]);

    // Get distribution by service type for the chart
    const serviceTypeDistribution = useMemo(() => {
        const distribution = {};

        transactions.forEach(tx => {
            const type = tx.Description || "";
            distribution[type] = (distribution[type] || 0) + 1;
        });

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    // console.log('Service Type Distribution:', serviceTypeDistribution);

    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="overview" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="overview"
                            onClick={() => setView("summary")}
                        >
                            Vista General
                        </TabsTrigger>
                        <TabsTrigger value="transactions"
                            onClick={() => setView("transactions")}
                        >
                            Transacciones
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-[130px] h-8">
                                    <div className="flex items-center gap-2">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Filter" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pendientes
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completados
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelados
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* {view === "transactions" && (
                        )} */}

                        <Button variant="outline" size="sm" className="flex gap-1 h-8">
                            <ReceiptText className="h-3.5 w-3.5" />
                            Generar Factura
                        </Button>
                        <Button variant="outline" size="sm" className="flex gap-1 h-8">
                            <Download className="h-3.5 w-3.5" />
                            Exportar
                        </Button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabsContent value="overview" className="mt-0 ">
                            <WalletSummary
                                balance={summaryData.balance}
                                transactionCount={summaryData.transactionCount}
                                oldestDate={summaryData.oldestDate}
                                newestDate={summaryData.newestDate}
                            />

                            <Card >
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Transacciones Recientes
                                    </CardTitle>
                                    <CardDescription>
                                        Tu última actividad en la billetera
                                    </CardDescription>
                                </CardHeader>
                                <CardContent
                                    className="h-44"
                                >
                                    <WalletTransactionList
                                        transactions={transactions.slice(0, 3)}
                                        isLoading={isLoading}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                        onClick={() => {
                                            setView("transactions");
                                            document.querySelector('[value="transactions"]')?.dispatchEvent(
                                                new MouseEvent('click', { bubbles: true })
                                            );
                                        }}
                                    >
                                        Ver todas las transacciones
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {serviceTypeDistribution.map((item, idx) => (
                                    <Card key={idx} className={cn(
                                        "relative overflow-hidden",
                                        idx === 0 && "border-blue-100 dark:border-blue-900",
                                        idx === 1 && "border-green-100 dark:border-green-900",
                                        idx === 2 && "border-amber-100 dark:border-amber-900"
                                    )}>
                                        <div className={cn(
                                            "absolute inset-0 w-1.5",
                                            idx === 0 && "bg-blue-500",
                                            idx === 1 && "bg-green-500",
                                            idx === 2 && "bg-amber-500"
                                        )} />
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="font-normal">
                                                    {Math.round((item.value / summaryData.transactionCount) * 100)}%
                                                </Badge>
                                                <span className="text-2xl font-semibold">{item.value}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div> */}
                        </TabsContent>

                        <TabsContent value="transactions" className="mt-0">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-1">
                                    Historial de Transacciones
                                </h2>
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground text-sm">
                                        Viendo {filteredTransactions.length} transaccion{filteredTransactions.length !== 1 ? 'es' : ''}
                                        {/* {filter !== "all" && (
                                            <Badge variant="outline" className="ml-2 font-normal">
                                                Filtrado por: {filter}
                                            </Badge>
                                        )} */}
                                    </p>
                                </div>
                            </div>

                            <WalletTransactionList
                                transactions={filteredTransactions}
                                isLoading={isLoading}
                            />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            <div className="mt-auto pt-6 text-center border-t border-border text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Última actualización de la billetera: {new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}