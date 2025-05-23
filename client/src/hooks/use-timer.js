import { useEffect, useRef, useState } from "react";

// In useTimer.js
export function useTimer(initialInterval = 100) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef(initialInterval);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + intervalRef.current);
            }, intervalRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning]);

    const reset = () => {
        setTime(0);
        setIsRunning(true);
    };

    const pause = () => {
        setIsRunning(false);
    };

    const resume = () => {
        setIsRunning(true);
    };

    return {
        time,
        reset,
        pause,
        resume,
        isRunning
    };
}
