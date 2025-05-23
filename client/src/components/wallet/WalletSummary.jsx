import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, TrendingUp, Calendar, AlertCircle, HandCoins } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function WalletSummary({
    balance,
    transactionCount,
    oldestDate,
    newestDate
}) {
    const [displayBalance, setDisplayBalance] = useState(0);

    // Animated counting effect for balance
    useEffect(() => {
        let startValue = 0;
        const duration = 1500; // ms
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;

        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentValue = Math.floor(balance * progress);

            setDisplayBalance(currentValue);

            if (frame === totalFrames) {
                clearInterval(counter);
                setDisplayBalance(balance); // Ensure the final value is exact
            }
        }, frameDuration);

        return () => clearInterval(counter);
    }, [balance]);

    const formatDateRange = () => {
        if (!oldestDate || !newestDate) return "Sin transacciones";

        const oldestFormatted = oldestDate.toLocaleDateString();
        const newestFormatted = newestDate.toLocaleDateString();

        if (oldestFormatted === newestFormatted) {
            return oldestFormatted;
        }

        return `${oldestFormatted} - ${newestFormatted}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-md overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Balance Total
                            </h3>
                            <HandCoins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-50 mb-2">
                            {formatCurrency(displayBalance)}
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-4">
                            {transactionCount} Transacciones pendientes
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-blue-100 dark:border-blue-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-muted-foreground">Periodo de transacciones</h3>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-base font-medium mt-2">{formatDateRange()}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="border-blue-100 dark:border-blue-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                                {balance > 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                            <p className="text-base font-medium mt-2">
                                {balance > 0 ? "Listo para recibir" : "Sin pagos pendientes"}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}