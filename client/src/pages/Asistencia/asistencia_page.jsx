// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//     PocketKnife,
//     Drill,
//     BadgeEuro,
//     Award,
//     ArrowRight
// } from 'lucide-react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useTranslation } from 'react-i18next';

// const ModuleCard = ({ title, icon, path, description }) => (
//     <Link
//         to={path}
//         className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//     >
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-500"></div>
//         <div className="p-8 flex flex-col items-center space-y-4">
//             <div className="text-blue-500 dark:text-blue-400 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
//                 {icon}
//             </div>
//             <div className="text-center space-y-2">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                     {title}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-pretty">
//                     {description}
//                 </p>
//             </div>
//             <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
//                 <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
//             </div>
//         </div>
//     </Link>
// );

// export default function AsistenciaPage() {
//     const navigate = useNavigate();
//     const { t } = useTranslation();

//     const modules = [
//         {
//             title: t('RepairRequest'),
//             icon: <PocketKnife className="w-12 h-12" />,
//             path: '/asistencia/reparacion',
//             description: t('RepairDesc')
//         },
//         {
//             title: t('InstallationRequest'),
//             icon: <Drill className="w-12 h-12" />,
//             path: '/asistencia/instalacion',
//             description: t('InstallationDesc')
//         },
//         // {
//         //     title: t('SaleRequest'),
//         //     icon: <BadgeEuro className="w-12 h-12" />,
//         //     path: '/asistencia/venta',
//         //     description: t('SaleDesc')
//         // },
//         // {
//         //     title: t('WarrantyRequest'),
//         //     icon: <Award className="w-12 h-12" />,
//         //     path: '/asistencia/garantia',
//         //     description: t('WarrantyDesc')
//         // },
//     ];

//     const handleSelectChange = (value) => {
//         navigate(value);
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//             <header className="bg-white dark:bg-gray-800 shadow">
//                 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                         {t('AssistanceRequest')}
//                     </h1>
//                     <Select onValueChange={handleSelectChange}>
//                         <SelectTrigger className="w-48">
//                             <SelectValue placeholder={t('AssistanceType')} />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {modules.map((module, index) => (
//                                 <SelectItem key={index} value={module.path}>
//                                     {module.title}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>
//             </header>

//             <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//                 <div className="space-y-8">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {modules.map((module, index) => (
//                             <ModuleCard key={index} {...module} />
//                         ))}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    PocketKnife,
    Drill,
    BadgeEuro,
    Award,
    ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useTour } from '@reactour/tour';
import { useTourSteps } from '@/hooks/useTourSteps';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer/Footer';


const ModuleCard = ({ title, icon, path, description, className }) => (
    <Link
        to={path}
        className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-500"></div>
        <div className="p-8 flex flex-col items-center space-y-4">
            <div className="text-blue-500 dark:text-blue-400 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                {icon}
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-pretty">
                    {description}
                </p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
        </div>
    </Link>
);

export default function AsistenciaPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setSteps, isOpen, setIsOpen, setCurrentStep } = useTour();
    const steps = useTourSteps();

    useEffect(() => {
        // document.title = 'Rapitecnic | ' + t('AssistanceRequest');
        document.title = 'Rapitecnic | Asistencia';
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSteps(steps);
        }
    }, [steps, setSteps, isOpen]);

    const modules = [
        {
            title: t('RepairRequest'),
            icon: <PocketKnife className="w-12 h-12" />,
            path: '/asistencia/reparacion',
            description: t('RepairDesc'),
            className: 'repair-module'
        },
        {
            title: t('InstallationRequest'),
            icon: <Drill className="w-12 h-12" />,
            path: '/asistencia/instalacion',
            description: t('InstallationDesc'),
            className: 'installation-module'
        },
    ];

    const handleSelectChange = (value) => {
        navigate(value);
    };

    const startTour = () => {
        setCurrentStep(0);
        setSteps(steps);
        setIsOpen(true);
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-85px)] bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow ">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('AssistanceRequest')}
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={startTour}
                            variant="gradientGlow"
                        // className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {/* Iniciar Tour */}
                            {t('StartTour')}
                        </Button>
                        <Select onValueChange={handleSelectChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={t('AssistanceType')} />
                            </SelectTrigger>
                            <SelectContent>
                                {modules.map((module, index) => (
                                    <SelectItem key={index} value={module.path}>
                                        {module.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex-grow">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 asistencia-header">
                        {modules.map((module, index) => (
                            <ModuleCard key={index} {...module} />
                        ))}
                    </div>
                </div>
            </main>
            {/* <Footer /> */}
        </div>

    );
}