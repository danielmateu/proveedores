import { useToast } from "@/hooks/use-toast";

const apiURL = import.meta.env.VITE_API_URL

export default function usePaymentsAdministration() {
  const { toast } = useToast()
    // función insertar observación (está repetido)
    const insertObservationPayment = async (LoginID, CustomerID, Remarks, TotalPayment, NoticeHeaderID) => {
        try {
            const response = await fetch(`${apiURL}/administrationController/addObservation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({LoginID, Remarks, CustomerID, TotalPayment, NoticeHeaderID})
            })
            if (!response.ok) {
                return response.message
            }
        } catch (error) {
            console.error(error);
        }
    }


    const handleUpdateRemovePayment = async (CustomerID, TotalPayment, PaymentId, NoticeHeaderID, ConfirmationDate, Remark, isRevised, isTransfer) => {
        try {
            const LoginID = localStorage.getItem("LoginID")
            // remark en la tabla payments
            const updateRemark = isRevised
                ? (Remark ? Remark + ' | Revisado desde el buscador' : 'Revisado desde el buscador') 
                : (Remark ? Remark + ' | Quitado desde el buscador' : 'Quitado desde el buscador');
                
            const response = await fetch(`${apiURL}/administrationController/updatePaymentStatus`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    PaymentId, ConfirmationDate, updateRemark, LoginID
                })
            })

            // si el pago se revisa, mostrar remark revisado (en observaciones)
            const insertRemark = isRevised ? ` ${isTransfer ? 'Transferencia' : 'TPV'} DE ${TotalPayment} € ${isTransfer ? 'Revisada' : 'Revisado'}` :  `${isTransfer ? 'Transferencia' : 'TPV'} DE ${TotalPayment} €`
            
            // customerID y noticeheaderid, en ingresos banco devuelven null
            await insertObservationPayment(LoginID, CustomerID, insertRemark , TotalPayment, NoticeHeaderID)


            if (!response.ok) return toast({ title: "Ha habido un error al revisar el pago.", variant: "destructive", duration: 3000, })

            return toast({
                title: "Pago revisado con éxito",
                variant: "success",
                duration: 3000,
            })
        } catch (error) {
            console.error("Ha habido un error al revisar el pago", error);
            return toast({
                title: "Ha habido un error al revisar el pago",
                variant: "destructive",
                duration: 3000,
            })
        }
    }

    // handleUpdate del cambio de método de pago
    const handleUpdatePaymentMethod = async (CustomerID, PaymentMethodID, PaymentID, NoticeHeaderID, setIsOpen, paymentMethods, selectedPayment) => {
        try {
            const LoginID = localStorage.getItem("LoginID")
            const response = await fetch(`${apiURL}/administrationController/updatePaymentMethod`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    PaymentMethodID, PaymentID
                })
            })

            const remark =  `Cambio método de pago de ${paymentMethods[selectedPayment-1]?.PaymentMode} a ${paymentMethods[PaymentMethodID-1]?.PaymentMode}`
            
            await insertObservationPayment(LoginID, CustomerID, remark, 0, NoticeHeaderID)


            if (!response.ok) return toast({ title: "Ha habido un error al modificar el método de pago.", variant: "destructive", duration: 3000, })

            return toast({
                title: "Método de pago modificado",
                variant: "success",
                duration: 3000,
            })
        } catch (error) {
            console.error("Ha habido un error al modificar el método de pago", error);
            return toast({
                title: "Ha habido un error al modificar el método de pago",
                variant: "destructive",
                duration: 3000,
            })
        }finally{
            setIsOpen(false)
        }
    }

    const handleUpdateTpvRemark = async (CustomerID, Remark, PaymentId, NoticeHeaderID) => {
        try {
            const LoginID = localStorage.getItem("LoginID")

            const updateRemark = Remark && Remark.includes('TPV VIRTUAL') ? 'TPV MANUAL' : 'TPV VIRTUAL'

            const response = await fetch(`${apiURL}/administrationController/updateTpvRemark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    updateRemark, PaymentId
                })
            })

            const remark =  `Tipo de pago cambiado De ${Remark} a ${updateRemark}`
            
            await insertObservationPayment(LoginID, CustomerID, remark, 0, NoticeHeaderID)


            if (!response.ok) return toast({ title: "Ha habido un error al cambiar el tipo de TPV.", variant: "destructive", duration: 3000, })

            return toast({
                title: "Tipo de TPV cambiado",
                variant: "success",
                duration: 3000,
            })
        } catch (error) {
            console.error("Ha habido un error al cambiar el tipo de TPV", error);
            return toast({
                title: "Ha habido un error al cambiar el tipo de TPV",
                variant: "destructive",
                duration: 3000,
            })
        }
    }

  return {insertObservationPayment, handleUpdateRemovePayment, handleUpdatePaymentMethod, handleUpdateTpvRemark}
}
