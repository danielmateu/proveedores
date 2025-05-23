'use client';

import { useToast } from "./use-toast";

const apiUrl = import.meta.env.VITE_API_URL;

export default function useWhatsappApiCall() {

    const { toast } = useToast();

    const handleWhatsAppClick = (notice) => {
        // Al final, se ha optado por llamar a la API de WhatsApp para obtener el mensaje a copiar
        whatsappApiCall(notice);
    };

    // const whatsappApiCall = async (notice) => {
    //     try {
    //         const noticeHeaderId = Number(notice.NoticeHeaderID);
    //         const response = await axios.get(
    //             `${apiUrl}/functionsController/getCopyWhatsapp?noticeheaderid=${noticeHeaderId}`
    //         );

    //         // Extraer la propiedad correcta del objeto response.data
    //         const text = response.data.copyWhatsapp;

    //         if (typeof text === "string") {
    //             // console.log("WhatsApp text:", text);

    //             navigator.clipboard.writeText(text);

    //             toast({
    //                 variant: "info",
    //                 title: `WhatsApp copiado`,
    //                 description: text,
    //             });
    //         } else {
    //             console.info("El texto de WhatsApp no es una cadena de texto.");
    //             throw new Error("El texto de WhatsApp no es una cadena de texto.");
    //         }
    //     } catch (error) {
    //         console.error("Error al llamar a la API de WhatsApp:", error);
    //         toast({
    //             variant: "error",
    //             title: `Error`,
    //             description: `No se pudo copiar el mensaje de WhatsApp.`,
    //         });
    //     }
    // };

    const whatsappApiCall = async (notice) => {
        try {
            const noticeHeaderId = Number(notice.NoticeHeaderID);
            const response = await fetch(`${apiUrl}/functionsController/getCopyWhatsapp?noticeheaderid=${noticeHeaderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const text = responseData.copyWhatsapp;

            if (typeof text === "string") {
                // console.log("WhatsApp text:", text);

                navigator.clipboard.writeText(text);

                toast({
                    variant: "info",
                    title: `WhatsApp copiado`,
                    description: text,
                });
            } else {
                console.info("El texto de WhatsApp no es una cadena de texto.");
                throw new Error("El texto de WhatsApp no es una cadena de texto.");
            }
        } catch (error) {
            console.error("Error al llamar a la API de WhatsApp:", error);
            toast({
                variant: "error",
                title: `Error`,
                description: `No se pudo copiar el mensaje de WhatsApp.`,
            });
        }
    };

    return {
        handleWhatsAppClick
    }
}