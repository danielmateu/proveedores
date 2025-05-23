'use client';

import { addDays } from "date-fns";
import { useEffect, useState } from "react";

export default function useAgendaTechnics() {

    const appointments = [
        {
            order: 1,
            status: 'PENDIENTE',
            time: '',
            day: (new Date()),
            start: '14:00',
            startReal: '',
            end: '20:00',
            endReal: '',
            provider: 'ACEPTACION PRESUPUESTO',
            technician: 'RODRIGO',
            cp: '08912',
            location: 'BADALONA',
            aviso: '123456',
            Aparato: 'Lavadora',
            Marca: 'Bosch',
            Motivo_averia: 'No enciende',
            Cliente: 'Juan Pérez',
            Dirección: 'C/ Mayor 12',
            Móvil: '666777888',
            Fijo: '931234567',
            Tramitador: 'Marta',
            Observación: 'No se ha podido contactar con el cliente',
            Modelo: 'WAS24460EE',
            Estado: 'Pendiente',
            Observaciones: 'No se ha podido contactar con el cliente',
            Total: '1400€',
        },
        {
            order: 2,
            status: 'DOMICILIO',
            time: '',
            day: ((new Date())),
            start: '10:00',
            startReal: '',
            end: '12:00',
            endReal: '',
            provider: 'ACEPTACION PRESUPUESTO',
            technician: 'RODRIGO',
            cp: '08912',
            location: 'DOMICILIO',
            aviso: '123457',
            Aparato: 'Lavadora',
            Marca: 'Bosch',
            Motivo_averia: 'No enciende',
            Cliente: 'Juan Pérez',
            Dirección: 'C/ Mayor 12',
            Móvil: '666777888',
            Fijo: '931234567',
            Tramitador: 'Marta',
            Observación: 'No se ha podido contactar con el cliente',
            Modelo: 'WAS24460EE',
            Estado: 'Pendiente',
            Observaciones: 'No se ha podido contactar con el cliente',
            Total: '1400€',
        },
        {
            order: 3,
            status: 'ASIGNADO',
            time: '',
            day: (addDays(new Date(), 2)),
            start: '08:00',
            startReal: '',
            end: '10:00',
            endReal: '',
            provider: 'ACEPTACION PRESUPUESTO',
            technician: 'JUAN',
            cp: '08912',
            location: 'BADALONA',
            aviso: '123458',
            Aparato: 'Lavadora',
            Marca: 'Bosch',
            Motivo_averia: 'No enciende',
            Cliente: 'Juan Pérez',
            Dirección: 'C/ Mayor 12',
            Móvil: '666777888',
            Fijo: '931234567',
            Tramitador: 'Marta',
            Observación: 'No se ha podido contactar con el cliente',
            Modelo: 'WAS24460EE',
            Estado: 'Pendiente',
            Observaciones: 'No se ha podido contactar con el cliente',
            Total: '1400€',
        }
    ]

    const Technics = [
        {
            name: 'RODRIGO',
            time: '10:00 - 14:00',
            location: 'BADALONA',
        },
        {
            name: 'JUAN',
            time: '14:00 - 18:00',
            location: 'BADALONA',
        },
    ]

    const [date, setDate] = useState()
    const [showDateRange, setShowDateRange] = useState(false)
    const [dateRange, setDateRange] = useState({ from: null, to: null })
    const [statues, setStatues] = useState([]);

    const [showPending, setShowPending] = useState(false)
    const [showHome, setShowHome] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const [technicFilter, setTechnicFilter] = useState('all')
    const [appointmentNumber, setAppointmentNumber] = useState('')

    const handleDateRangeChange = (newDateRange) => {
        setDateRange(newDateRange);
    };

    const handleShowDateRangeChange = (checked) => {
        setShowDateRange(checked);
        if (!checked) {
            setDateRange({ from: null, to: null });
        }
    };

    const filteredAppointments = appointments.filter(appointment => {

        const appointmentDate = new Date(appointment.day);
        if (showPending && appointment.status !== 'PENDIENTE') return false;
        if (showHome && appointment.status !== 'DOMICILIO') return false;
        if (dateRange?.from && dateRange?.to) {
            return appointmentDate >= dateRange?.from && appointmentDate <= dateRange?.to;
        }

        if (!showDateRange && date) {
            return appointmentDate.toDateString() === date.toDateString();
        }

        if (statusFilter !== 'all' && appointment.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

        if (technicFilter !== 'all' && appointment.technician.toLowerCase() !== technicFilter.toLowerCase()) return false;

        if (appointmentNumber && appointment.aviso !== appointmentNumber) return false;
        return true;
    });

    const getStatues = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;

        try {
            const response = await fetch(`${apiUrl}/noticeController/getStatus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStatues(data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };
    // const getStatues = async () => {

    //     const apiUrl = import.meta.env.VITE_API_URL;

    //     try {
    //         const response = await axios.get(`${apiUrl}/noticeController/getStatus`);
    //         // console.log(response.data);
    //         setStatues(response.data);
    //     } catch (error) {
    //         console.error('Error fetching statuses:', error);
    //     }
    // }

    useEffect(() => {
        getStatues();
    }, [])

    return {
        appointments,
        Technics,
        getStatues,
        statues,
        filteredAppointments
    }
}