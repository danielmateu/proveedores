'use client';

export default function useReportData() {
    
    

    const weeklyData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Avisos Aceptados',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: 'rgb(55, 199, 102)', // COLOR DE LA LINEA
                backgroundColor: 'rgba(55, 199, 102, 0.5)', // COLOR DEL PUNTO
            },
            {
                label: 'Avisos No Aceptados',
                data: [28, 48, 40, 19, 86, 27, 90],
                borderColor: 'rgb(253, 162, 35)',
                backgroundColor: 'rgba(253, 162, 35, 0.5)',
            },
            {
                label: 'Avisos totales',
                data: [28, 100, 40, 19, 86, 27, 90],
                borderColor: 'rgb(253, 5, 100)',
                backgroundColor: 'rgba(253, 5, 100, 0.5)',
            },
        ],
    }

    

    return {
        weeklyData
    }
}