import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserInfoStore = create(
    persist(
        (set) => ({
            userInfo: null,
            setUserInfo: (user) => set({ userInfo: user }),
            clearUserInfo: () => set({ userInfo: null }),
        }),
        {
            name: 'user-store', // Nombre de la clave en localStorage
            storage: createJSONStorage(() => localStorage),
            // Opcional: puedes especificar qué parte del estado quieres persistir
            partialize: (state) => ({ userInfo: state.userInfo }),
        }
    )
);