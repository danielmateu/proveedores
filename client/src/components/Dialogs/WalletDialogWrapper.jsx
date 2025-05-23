import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PiggyBankIcon } from "lucide-react";
import { WalletDialog } from "@/components/wallet";
import { usePendingPaymentsStore } from "@/zustand/pendingPaymentsStore";
import { useUserInfoStore } from "@/zustand/userInfoStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";


export function WalletDialogWrapper() {
    const [open, setOpen] = useState(false);
    const userInfo = useUserInfoStore((state) => state.userInfo);
    const { pendingPayments, fetchPendingPayments, isLoading } = usePendingPaymentsStore();
    // console.log('Pending Payments:', pendingPayments);
    const [userTransactions, setUserTransactions] = useState([]);

    // Fetch data when dialog opens
    useEffect(() => {
        if (userInfo?.Ex_InvoicingAddressID && open) {
            fetchPendingPayments();
        }
    }, [userInfo?.Ex_InvoicingAddressID, open, fetchPendingPayments]);

    // Transform pending payments into transactions
    useEffect(() => {
        if (userInfo?.Ex_InvoicingAddressID) {
            const filteredPayments = pendingPayments
                .filter(payment => payment.Ex_InvoicingAddressID === userInfo.Ex_InvoicingAddressID)
                .map(payment => ({
                    Ex_InvoicingAddressID: payment.Ex_InvoicingAddressID,
                    Amount: payment.TotalAmount,
                    Date: payment.Date || new Date().toISOString(),
                    Description: payment.ServiceTypeName || "Payment for service",
                    Status: payment.Status || "pending",
                    NoticeCount: payment.NoticeCount,
                    // ServiceType: payment.ServiceTypeName || getRandomServiceType(),
                    // NoticeID: payment.Ex_InvoicingAddressID
                    NoticeID: payment.NoticeID || `NOT${100000 + Math.floor(Math.random() * 900000)}`,
                })
                );

            // console.log('Filtered Payments:', filteredPayments);

            setUserTransactions(filteredPayments);
            // if (pendingPayments.length === 0 && !isLoading) {
            //     const sampleData = generateSampleTransactions(userInfo.Ex_InvoicingAddressID);
            //     setUserTransactions(sampleData);
            // } else {
            // }
        }
    }, [pendingPayments, userInfo?.Ex_InvoicingAddressID, isLoading]);

    const pendingCount = userTransactions.filter(tx => tx.Status.toLowerCase() === 'pending').length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative inline-block">
                    <PiggyBankIcon className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                    {pendingCount > 0 && (
                        <>
                            {/* Ping animation */}
                            <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500/30 animate-ping" />
                            {/* Static badge */}
                            <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-[10px] font-medium text-white">
                                    {pendingCount}
                                </span>
                            </span>
                        </>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px] max-h-[85vh] overflow-hidden flex flex-col">
                <ScrollArea className="h-[50rem] rounded-md border p-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <PiggyBankIcon className="h-5 w-5" />
                            Tu Monedero
                        </DialogTitle>
                        <DialogDescription>
                            Aquí puedes ver el saldo de tu monedero y los detalles de tus transacciones.
                        </DialogDescription>
                    </DialogHeader>

                    <WalletDialog
                        transactions={userTransactions}
                        isLoading={isLoading}
                    />
                </ScrollArea>
            </DialogContent>

        </Dialog>
    );
}

// Helper functions to generate sample data for preview purposes
function getRandomServiceType() {
    const types = ["Reparación", "Instalación", "Mantenimiento", "Consulta"];
    return types[Math.floor(Math.random() * types.length)];
}

function getRandomStatus() {
    const statuses = ["pending", "completed", "cancelled"];
    const weights = [0.7, 0.2, 0.1]; // 70% pending, 20% completed, 10% cancelled

    const random = Math.random();
    let sum = 0;

    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random < sum) return statuses[i];
    }

    return statuses[0];
}

function generateSampleTransactions(invoiceAddressId) {
    const count = 5 + Math.floor(Math.random() * 5); // 5-9 transactions
    const transactions = [];

    const now = new Date();

    for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

        const serviceType = getRandomServiceType();
        const status = getRandomStatus();
        const amount = 10 + Math.floor(Math.random() * 40); // Random amount between 10-50€

        transactions.push({
            Ex_InvoicingAddressID: invoiceAddressId,
            Amount: amount,
            Date: date.toISOString(),
            Description: `Servicio de ${serviceType.toLowerCase()}`,
            Status: status,
            ServiceType: serviceType,
            NoticeID: `NOT${100000 + Math.floor(Math.random() * 900000)}`
        });
    }

    // Sort by date, newest first
    return transactions.sort((a, b) =>
        new Date(b.Date).getTime() - new Date(a.Date).getTime()
    );
}