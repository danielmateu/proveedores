import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const apiURL = import.meta.env.VITE_API_URL;

export const useCustomersStore = create(
    persist(
        (set, get) => ({
            customers: [],
            isLoading: false,
            error: null,
            lastFetched: null,

            fetchCustomers: async () => {
                // Verificar si ya tenemos datos y si han pasado menos de 5 minutos desde la última carga
                const { lastFetched, customers } = get();
                const now = Date.now();
                const fiveMinutesInMs = 5 * 60 * 1000;
                
                if (lastFetched && now - lastFetched < fiveMinutesInMs && customers.length > 0) {
                    console.log('Usando datos en caché de clientes');
                    return;
                }
                
                set({ isLoading: true });
                try {
                    console.log('Fetching customers from API');
                    const response = await fetch(`${apiURL}/noticeController/getEx_InvoicingAddress`);
                    if (!response.ok) throw new Error('Error fetching customers');
                    const data = await response.json();
                    set({ 
                        customers: data, 
                        error: null,
                        lastFetched: Date.now()
                    });
                } catch (error) {
                    set({ error: error.message });
                    console.error('Error fetching customers:', error);
                } finally {
                    set({ isLoading: false });
                }
            },
            
            // Método para forzar una recarga ignorando la caché
            forceRefreshCustomers: async () => {
                set({ isLoading: true });
                try {
                    const response = await fetch(`${apiURL}/noticeController/getEx_InvoicingAddress`);
                    if (!response.ok) throw new Error('Error fetching customers');
                    const data = await response.json();
                    set({ 
                        customers: data, 
                        error: null,
                        lastFetched: Date.now()
                    });
                } catch (error) {
                    set({ error: error.message });
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'customers-storage',
            partialize: (state) => ({ 
                customers: state.customers,
                lastFetched: state.lastFetched
            }),
        }
    )
);