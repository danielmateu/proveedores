import { useEffect, useState } from "react";

const apiURL = import.meta.env.VITE_API_URL

export function useProgress() {

    const [percentages, setPercentages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getPercentages = async () => {
        try {
            const response = await fetch(`${apiURL}/homecontroller/Progress`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPercentages(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al cargar los porcentajes:', error);
        }
    };
    // const getPercentages = async () => {
    //     try {
    //         const response = await axios.get(`${apiURL}/homecontroller/Progress`);
    //         setPercentages(response.data);
    //         setIsLoading(false);

    //     } catch (error) {

    //         console.error('Error al cargar los porcentajes:', error);
    //     }
    // }

    useEffect(() => {
        getPercentages();
    }, [])


    return { percentages, isLoading };
}
