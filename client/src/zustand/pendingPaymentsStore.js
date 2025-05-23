import { create } from 'zustand';

const apiURL = import.meta.env.VITE_API_URL;

export const usePendingPaymentsStore = create((set) => ({
    pendingPayments: [],
    isLoading: false,
    error: null,

    fetchPendingPayments: async () => {
        set({ isLoading: true });

        try {
            const response = await fetch(`${apiURL}/noticeController/get_Ex_PendingPayments`);
            if (!response.ok) throw new Error('Error fetching pending payments');
            const data = await response.json();
            set({ pendingPayments: data, error: null });
        } catch (error) {
            set({ error: error.message });
            console.error('Error fetching pending payments:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));

// import { create } from 'zustand';


// const API_URL = import.meta.env.VITE_API_URL;
// const FETCH_COOLDOWN = 60000; // 1 minute cooldown between fetches

// export const usePendingPaymentsStore = create((set, get) => ({
//     pendingPayments: [],
//     isLoading: false,
//     error: null,
//     lastFetched: null,

//     fetchPendingPayments: async () => {
//         // Check if we've fetched within the cooldown period
//         const now = Date.now();
//         const lastFetched = get().lastFetched;
//         if (lastFetched && now - lastFetched < FETCH_COOLDOWN) {
//             return; // Skip if fetched recently
//         }

//         set({ isLoading: true, error: null });

//         try {
//             const response = await fetch(`${API_URL}/noticeController/get_Ex_PendingPayments`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 // credentials: 'include', // Include cookies if needed
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();

//             set({
//                 pendingPayments: data,
//                 error: null,
//                 lastFetched: now,
//                 isLoading: false
//             });
//         } catch (error) {
//             console.error('Error fetching pending payments:', error);
//             set({
//                 error: error instanceof Error ? error.message : 'Failed to fetch pending payments',
//                 isLoading: false
//             });
//         }
//     }
// }));