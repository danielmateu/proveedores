import { useCallback, useRef } from 'react';

export function useComboboxFocus() {
    const buttonRef = useRef(null);

    const handleSelect = useCallback(() => {
        // Remove focus from button after selection
        if (buttonRef.current) {
            buttonRef.current.blur();
        }
    }, []);

    return { buttonRef, handleSelect };
}