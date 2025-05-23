
import React, { useEffect, useState } from "react";
import { Link, useHref, useLocation, useNavigate } from "react-router-dom";
import { useUserInfoStore } from "@/zustand/userInfoStore";
import useExitConfirmation from "@/hooks/useExitConfirmation";
import {
    BadgeEuro,
    Drill,
    PocketKnife,
    Award,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import NavbarMode from "./navbar-mode";
import NavbarSidebar from "./NavbarSidebar";
import NavProfileUser from "./NavProfileUser";
import { useTranslation } from "react-i18next";
import { set } from "date-fns";
import { useTour } from "@reactour/tour";

export const Navbar = ({ activeTab, empresa, setActiveTab, onOpenDashboard }) => {
    const { t } = useTranslation();

    const menuItems = [
        {
            label: t('AssistanceServices'),
            to: "/asistencia",
            items: [
                { to: "/asistencia/reparacion", text: t('RepairService'), icon: PocketKnife },
                { to: "/asistencia/instalacion", text: t('InstallationService'), icon: Drill },
                // { to: "/asistencia/venta", text: t('SaleService'), icon: BadgeEuro },
                // { to: "/asistencia/garantia", text: t('WarrantyService'), icon: Award }
            ],
        },
        {
            label: t('MyServices'),
            to: "/resumen",
            items: [],
        },
        {
            label: t('SATS'),
            to: "/sats",
            items: [],
        },
    ];

    const { handleNavigate, cancelExit, confirmExit } = useExitConfirmation(setActiveTab);

    const route = useHref();
    const location = useLocation();
    const navigate = useNavigate();

    const userInfo = useUserInfoStore((state) => state.userInfo);
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        if (userInfo.Name && userInfo.Surname) {
            setUserName(userInfo.Name + " " + userInfo.Surname);
        }
        else if (userInfo.TaxName) {
            setUserName(userInfo.TaxName);
        }
        else {
            setUserName(t('User'));
        }
    }, [userInfo, t]);

    const clearUserInfo = useUserInfoStore((state) => state.clearUserInfo);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        setActiveTab("dashboard");
        clearUserInfo();
    };

    const { isOpen, currentStep, setIsOpen, setCurrentStep, setSteps } = useTour()

    const TooltipItemLink = ({ to, icon: Icon, children, action, restrictedProfiles = [], permission }) => (
        <Link
            to={to || "#"}
            onClick={(e) => {
                if (action && to) {
                    e.preventDefault();
                    action();
                    handleNavigate(e, to, restrictedProfiles, permission);
                } else if (action) {
                    e.preventDefault();
                    action();
                } else {
                    handleNavigate(e, to, restrictedProfiles, permission);
                }
            }}
            className={cn(
                "flex items-center justify-between gap-4 w-full p-2 text-sm font-semibold text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 hover:bg-slate-100 rounded-lg blindcolor:hover:border blindcolor:border-black blindcolor:rounded ",
                route === to
                    ? "bg-slate-100 dark:bg-slate-700"
                    : "dark:hover:bg-slate-700 hover:bg-slate-100"
            )}
        >
            <span className={cn("flex items-center gap-4 justify-between w-full")}>
                {children}
                <Icon size={15} />
            </span>
        </Link>
    );

    return (
        <nav className="mx-auto p-4 flex items-center justify-between bg-sky-100 dark:bg-sky-800 text-slate-800 dark:text-slate-400 h-20">
            <Link
                className="min-w-fit w-fit hidden md:flex items-center gap-2 group"
                onClick={
                    (e) => {
                        handleNavigate(e, "/inicio", null, null)
                        setIsOpen(false)
                        setCurrentStep(0)
                        // if (isOpen) {
                        //     setIsOpen(false)
                        //     setCurrentStep(0)
                        // } else {
                        //     setIsOpen(false)
                        //     setCurrentStep(0)
                        // }
                    }

                }
            >
                <div className=" flex items-center gap-2 ">
                    <img
                        src="/rapitecnic-sin-letras.png"
                        alt="logo web"
                        className="w-10 cursor-pointer blindcolor:sepia"
                    />
                    <div className="md:flex flex-col hidden group-hover:scale-105 transition">
                        <p className="dark:text-white text-lg font-bold">
                            RAPI
                            <span className="text-purple-800 dark:text-purple-500 font-medium blindcolor:text-black">
                                TECNIC
                            </span>
                        </p>
                        <p className="text-sm font-semibold text-slate-600 italic dark:text-slate-400 hidden">
                            {t('TechnicalService')}
                        </p>
                    </div>
                </div>
            </Link>

            <NavbarSidebar
                menuItems={menuItems}
                username={userInfo?.UserName}
                role={userInfo?.role}
                handleLogout={handleLogout}
                route={route}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="hidden md:flex items-center justify-center py-3 blindcolor:bg-transparent">
                <TooltipProvider>
                    {menuItems.map((menu, index) => {
                        if (menu.items.length === 0) {
                            return (
                                <Link
                                    key={index}
                                    to={menu.to || "#"}
                                    onClick={(e) => handleNavigate(e, menu.to)}
                                    className={cn(
                                        "px-2 text-sm font-semibold hover:text-sky-600 transition",
                                        location.pathname.startsWith(menu.to)
                                            ? "text-slate-400 blindcolor:border-2 blindcolor:text-black blindcolor:rounded"
                                            : "text-slate-800 dark:text-slate-300",
                                    )}
                                >
                                    {menu.label}
                                </Link>
                            )
                        }
                        return (
                            <Tooltip key={index} disableHoverableContent={false} delayDuration={0}>
                                <Link
                                    to={menu.to || "#"}
                                    onClick={(e) => handleNavigate(e, menu.to)}
                                    className={cn(
                                        "hover:text-sky-600 transition",
                                        location.pathname.startsWith(menu.to)
                                            ? "text-slate-400 blindcolor:border-2 blindcolor:text-black blindcolor:rounded"
                                            : "text-slate-800 dark:text-slate-300",
                                    )}
                                >
                                    <TooltipTrigger
                                        className={cn("px-2 text-sm font-semibold", {
                                            "text-slate-400 blindcolor:text-black blindcolor:border-2 blindcolor:rounded blindcolor:border-black":
                                                menu.items.some((item) => isActive(item.to)),
                                        })}
                                    >
                                        {menu.label}
                                    </TooltipTrigger>
                                </Link>
                                <TooltipContent side={"bottom"} align={"start"} className="w-60">
                                    <span className="text-xs">{menu.label}</span>
                                    <Separator />
                                    {menu.items.map((item, idx) => (
                                        <TooltipItemLink
                                            key={idx}
                                            to={item.to}
                                            icon={item.icon}
                                            action={item.action}
                                            restrictedProfiles={item.restrictedProfiles}
                                            permission={item.permission}
                                        >
                                            {item.text}
                                        </TooltipItemLink>
                                    ))}
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
                <NavProfileUser
                    user={userName}
                    role={userInfo?.Administrator}
                    handleLogout={handleLogout}
                />
                {/* <NavbarMode /> */}
            </div>
        </nav>
        // <>
        //     <header className=" bg-slate-100 dark:bg-slate-800">
        //     </header>
        // </>
    );
};
