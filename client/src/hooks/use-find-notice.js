'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "./use-toast";
import { io } from 'socket.io-client';

const apiURL = import.meta.env.VITE_API_URL;
const socket = io(apiURL);

export default function useFindNotices() {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [NotFound, setNotFound] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const [notice, setNotice] = useState({});
    const [hasSearched, setHasSearched] = useState(false);
    const [customerID, setCustomerID] = useState('');

    const form = useForm({
        defaultValues: {
            searchTerm: '',
        },
    });

    const { toast } = useToast()

    useEffect(() => {
        socket.on('noticeUpdate', (updatedNotice) => {
            setNotices(currentNotices => {
                const updatedNotices = currentNotices.map(notice =>
                    notice.NoticeHeaderID === updatedNotice.NoticeHeaderID
                        ? { ...notice, ...updatedNotice }
                        : notice
                );
                return updatedNotices;
            });
        });

        return () => {
            socket.off('noticeUpdate');
        };
    }, []);

    async function onSubmitToDelete(data) {
        setIsLoading(true);
        setNotices([]);

        try {
            const response = await fetch(`${apiURL}/noticeController/searchNoticeToDelete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ termsearch: data.searchTerm }),
            });

            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            const responseData = await response.json();

            if (responseData.NotFound) {
                toast({
                    title: "No se encontraron resultados",
                    description: "Parece que no hay avisos con el número proporcionado.",
                    variant: "destructive",
                });
                setNotFound(responseData.NotFound);
                setShowPopover(true);
                form.reset();
            }

            if (responseData.Accepted) {
                toast({
                    title: "Aviso ya aceptado",
                    description: responseData.Accepted,
                    variant: "info",
                });
                form.reset();
            }

            if (responseData.Not_Accepted) {
                try {
                    const response = await fetch(`${apiURL}/noticeController/searchNotices`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ termsearch: data.searchTerm }),
                    });

                    const responseData = await response.json();
                    const notice = responseData.find(notice => notice.DocEntry === data.searchTerm);

                    if (responseData.NotFound) {
                        toast({
                            title: "No se encontraron resultados",
                            description: "Parece que no hay avisos con el número proporcionado.",
                            variant: "destructive",
                        });
                        setNotFound(responseData.NotFound);
                        setShowPopover(true);
                    } else {
                        setNotices(responseData);
                        setShowPopover(false);
                        setNotice(notice);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }

            if (responseData.notices) {
                setNotices(responseData.notices);
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un error al procesar la solicitud",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const deleteNotice = async (docEntry, loginID) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiURL}/noticeController/deleteNotice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    docEntry: docEntry,
                    timestamp: new Date().toISOString(),
                    loginID: loginID,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            toast({
                title: "Aviso eliminado",
                description: responseData.message,
                variant: "success",
            });

            // Emit socket event for notice deletion
            socket.emit('statusChange', {
                noticeId: docEntry,
                status: 'deleted',
            });
        } catch (error) {
            console.error('Error al eliminar el aviso:', error);
            toast({
                title: "Error",
                description: 'Parece que no tienes permisos para eliminar este aviso.',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    // const deleteNotice = async (docEntry, loginID) => {
    //     setIsLoading(true);
    //     try {
    //         const response = await axios.post(`${apiURL}/noticeController/deleteNotice`, {
    //             docEntry: docEntry,
    //             timestamp: new Date().toISOString(),
    //             loginID: loginID
    //         });

    //         toast({
    //             title: "Aviso eliminado",
    //             description: response.data.message,
    //             variant: "success",
    //         });

    //         // Emit socket event for notice deletion
    //         socket.emit('statusChange', {
    //             noticeId: docEntry,
    //             status: 'deleted'
    //         });

    //     } catch (error) {
    //         console.error('Error al eliminar el aviso:', error);
    //         toast({
    //             title: "Error",
    //             description: 'Parece que no tienes permisos para eliminar este aviso.',
    //             variant: "destructive",
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    async function findNotices(data) {
        setIsLoading(true);
        setNotices([]);
        setNotFound('');
        setShowPopover(false);
        setHasSearched(true);

        try {
            const response = await fetch(`${apiURL}/noticeController/searchNotices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ termsearch: data.searchTerm }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText);
                return;
            }

            const responseData = await response.json();

            if (responseData.NotFound) {
                toast({
                    title: "No se encontraron resultados",
                    description: "Parece que no hay avisos con el número proporcionado.",
                    variant: "destructive",
                });
                setNotFound(responseData.NotFound);
                setShowPopover(true);
            } else if (responseData.length == 0) {
                toast({
                    title: "Atención",
                    description: "No se han encontrado avisos relacionado con los datos del cliente o con el número de aviso.",
                    variant: "info",
                });
            } else {
                setNotices(responseData);
                setShowPopover(false);
                setNotice(responseData[0]);
                setCustomerID(responseData[0].CustomerID);
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            toast({
                title: "Error",
                description: "Hubo un error. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function getNoticesByStatus(status) {
        setIsLoading(true);
        setNotices([]);
        setNotFound('');
        setShowPopover(false);

        try {
            const response = await fetch(`${apiURL}/noticeController/searchNoticesByStatus?status=${status}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setNotices(data);
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            toast({
                title: "Error",
                description: "Hubo un error. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return {
        notices,
        isLoading,
        NotFound,
        showPopover,
        getNoticesByStatus,
        // onSubmit,
        findNotices,
        onSubmitToDelete,
        form,
        notice,
        setNotices,
        deleteNotice,
        customerID,
        hasSearched
    };
}