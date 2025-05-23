'use client';

import useFormStore from "@/zustand/formStore";
import { useEffect, useState, useCallback } from "react";

export default function useAddresses() {
    const { customerData, getDeliveryAddresses, getBillingAddresses } = useFormStore();
    const [deliveryAddresses, setDeliveryAddresses] = useState([]);
    const [invoicingAddresses, setInvoicingAddresses] = useState([]);

    const fetchDeliveryAddresses = useCallback(async () => {
        if (customerData?.CustomerID) {
            const addresses = await getDeliveryAddresses(customerData.CustomerID);
            setDeliveryAddresses(addresses || []);
        }
    }, [customerData?.CustomerID, getDeliveryAddresses]);

    const fetchInvoicingAddresses = useCallback(async () => {
        if (customerData?.CustomerID) {
            const addresses = await getBillingAddresses(customerData.CustomerID);
            setInvoicingAddresses(addresses || []);
        }
    }, [customerData?.CustomerID, getBillingAddresses]);

    useEffect(() => {
        fetchDeliveryAddresses();
    }, [fetchDeliveryAddresses]);

    useEffect(() => {
        fetchInvoicingAddresses();
    }, [fetchInvoicingAddresses]);

    const refreshAddresses = useCallback(async () => {
        await Promise.all([
            fetchDeliveryAddresses(),
            fetchInvoicingAddresses()
        ]);
    }, [fetchDeliveryAddresses, fetchInvoicingAddresses]);

    const addDeliveryAddress = useCallback((newAddress) => {
        setDeliveryAddresses(prev => [...prev, newAddress]);
    }, []);

    const addInvoicingAddress = useCallback((newAddress) => {
        setInvoicingAddresses(prev => [...prev, newAddress]);
    }, []);

    return {
        deliveryAddresses,
        invoicingAddresses,
        refreshAddresses,
        addDeliveryAddress,
        addInvoicingAddress
    };
}