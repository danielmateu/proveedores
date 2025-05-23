import { useToast } from "./use-toast";

// export default function useFetchFile(notice) {
//     const { toast } = useToast()

//     const handleGetFile = async (docTypeID) => {
//         let type, date, id;
//         switch (docTypeID) {
//             case 1:
//                 type = "NOTICES";
//                 date = notice.FECHA_CREACION_AVISO ? notice.FECHA_CREACION_AVISO?.split("T")[0].replace(/-/g, "") : null
//                 id = notice.NoticeHeaderID ? notice.NoticeHeaderID : null;
//                 break;
//             case 2:
//                 type = "QUOTITATIONS";
//                 date = notice.FECHA_PRESUPUESTO ? notice.FECHA_PRESUPUESTO?.split("T")[0].replace(/-/g, "") : null
//                 id = notice.QuotitationHeaderID ? notice.QuotitationHeaderID : null
//                 break;
//             case 3:
//                 type = "INVOICES";
//                 date = notice.FECHA_FACTURA ? notice.FECHA_FACTURA?.split("T")[0].replace(/-/g, "") : null
//                 id = notice.InternalInvoiceNumber ? notice.InternalInvoiceNumber + "_INV" : null
//                 break;
//             case 4:
//                 type = "REFUNDS";
//                 date = notice.FECHA_ABONO ? notice.FECHA_ABONO?.split("T")[0].replace(/-/g, "") : null
//                 id = notice.InternalRefundNumber ? notice.InternalRefundNumber + "_INV" : null
//                 break;
//             default:
//                 console.warn("DoctypeID no reconocido");
//                 break;
//         }

//         await fetchGetFile(type, date, id);
//     };

//     const fetchGetFile = async (type, date, id) => {
//         const file = await fetch(`http://192.168.12.250:3030/getFile/RAPITECNIC/${type}/${date}/${id}`);
//         if (!file.ok)
//             return toast({
//                 title: "Error al abrir PDF",
//                 description: `Parece que no existe ningún archivo PDF con el número proporcionado.`,
//                 variant: "destructive",
//                 duration: 4000,
//             })

//         window.open(file.url);
//     };

//     return { handleGetFile, fetchGetFile };
// }

export default function useFetchFile() {
    const { toast } = useToast()

    const handleGetFile = async (notice, docTypeID) => {
        // console.log('notice:', notice);
        let type, date, id;
        try {
            switch (docTypeID) {
                case 1:
                    type = "NOTICES";
                    date = notice?.FECHA_CREACION_AVISO?.split("T")[0].replace(/-/g, "") || null;
                    id = notice?.NoticeHeaderID || null;
                    break;
                case 2:
                    type = "QUOTITATIONS";
                    date = notice?.FECHA_PRESUPUESTO?.split("T")[0].replace(/-/g, "") || null;
                    id = notice?.QuotitationHeaderID || null;
                    break;
                case 3:
                    type = "INVOICES";
                    date = notice?.FECHA_FACTURA?.split("T")[0].replace(/-/g, "") || null;
                    id = notice?.InternalInvoiceNumber ? notice.InternalInvoiceNumber + "_INV" : null;
                    break;
                case 4:
                    type = "REFUNDS";
                    date = notice?.FECHA_ABONO?.split("T")[0].replace(/-/g, "") || null;
                    id = notice?.InternalRefundNumber ? notice.InternalRefundNumber + "_INV" : null;
                    break;
                default:
                    console.warn("DoctypeID no reconocido");
                    return;
            }

            if (!date || !id) {
                throw new Error("Fecha o ID no definidos");
            }

            await fetchGetFile(type, date, id);
        } catch (error) {
            console.error('Error al obtener el archivo:', error);
            toast({
                title: "Hubo un error al intentar obtener el archivo.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const fetchGetFile = async (type, date, id) => {
        const file = await fetch(`http://192.168.12.250:3030/getFile/RAPITECNIC/${type}/${date}/${id}`);
        if (!file.ok)
            return toast({
                title: "Error al abrir PDF",
                description: `Parece que no existe ningún archivo PDF con el número proporcionado.`,
                variant: "info",
                duration: 3000,
            })

        window.open(file.url);
    };

    return { handleGetFile, fetchGetFile };
}

