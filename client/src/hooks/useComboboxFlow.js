import { useCallback, useRef } from 'react';



const flowOrder = ['proveedor', 'estado', 'marca', 'aparato', 'tipo'];

export function useComboboxFlow() {
    const buttonRefs = useRef({
        proveedor: null,
        estado: null,
        marca: null,
        aparato: null,
        tipo: null
    });

    const registerRef = useCallback((type, ref) => {
        buttonRefs.current[type] = ref;
    }, []);

    const focusNext = useCallback((currentType) => {
        const currentIndex = flowOrder.indexOf(currentType);
        const nextType = flowOrder[currentIndex + 1];

        if (nextType && buttonRefs.current[nextType]) {
            buttonRefs.current[nextType]?.focus();
        }
    }, []);

    return { registerRef, focusNext };
}