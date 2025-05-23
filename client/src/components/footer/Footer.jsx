import React from 'react';
import FAQSection from './FAQSection';
import { Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
// import { tiktok } from 'public/icons/index.js';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mx-auto px-4 sm:px-6 lg:px-8 pb-5" >
            <div className="pt-8">
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-64"> */}
                <div className="flex md:justify-between md:items-end md:flex-row flex-col gap-8 md:gap-0">
                    {/* <div>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Sobre nosotros</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Servicio técnico de reparación de electrodomésticos en Barcelona y alrededores. Nuestro equipo de técnicos altamente capacitados está listo para ayudarle con cualquier problema que tenga con sus electrodomésticos.
                        </p>
                    </div> */}

                    <div >
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">FAQ</h3>
                        <div className="flex gap-2 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                                ¿Necesitas ayuda?{' '}
                            </p>
                            <Dialog>
                                <DialogTrigger
                                    className=''
                                >
                                    <p className="text-blue-500 hover:text-blue-600 dark:text-sky-400 dark:hover:text-sky-500">
                                        Preguntas Frecuentes
                                    </p>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Preguntas Frecuentes
                                        </DialogTitle>
                                        <DialogDescription>
                                            Aquí encontrarás respuestas a las preguntas más comunes sobre el uso de la aplicación.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FAQSection />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className=''>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Contacto</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                            <li>Teléfono soporte técnico: +34 93 737 62 93</li>

                            {/* <li>Email: rapitecnic@rapitecnic.com</li>
                            <li>Dirección: Plaça del Vapor, 9, 08915 Badalona</li> */}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Síguenos</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/rapitecnicserviciointegral/" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                                <span className="sr-only">Instagram</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="https://www.facebook.com/Rapitecnic/" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="https://www.youtube.com/channel/UCCSg5F-7nNv9vObzE8p0Ecw" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                                <span className="sr-only">YouTube</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@rapitecnicsl" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300">
                                <span className="sr-only">TikTok</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/company/rapitecnic/" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>

                        {/* <Dialog>
                            <DialogTrigger
                                className='flex gap-2 pt-6'
                            >
                                <p className="text-gray-600 dark:text-gray-400">
                                    ¿Necesitas ayuda?{' '}
                                </p>
                                <p className="text-blue-500 hover:text-blue-600 dark:text-sky-400 dark:hover:text-sky-500">
                                    Preguntas Frecuentes
                                </p>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                </DialogHeader>
                                <FAQSection />
                            </DialogContent>
                        </Dialog> */}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    © {currentYear} Rapitecnic. Todos los derechos reservados.
                </p>
                <div className="mt-4 md:mt-0 flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                        Hecho con <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" /> por el equipo IT
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;