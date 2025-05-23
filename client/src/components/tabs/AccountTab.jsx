import React, { useRef, useState } from 'react';

import { PencilLine, Upload, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '../ui/select';

const AccountTab = ({ userInfo }) => {

    // console.log('userInfo', userInfo);

    const { userProfile, updateUserProfile } = useSettings();
    const { t } = useTranslation();
    const [editName, setEditName] = useState(false);
    const [editTaxName, setEditTaxName] = useState(false);
    const [editRole, setEditRole] = useState(false);
    const [editUserType, setEditUserType] = useState(false);
    // const [name, setName] = useState(userProfile.name);
    const [name, setName] = useState(userInfo.name);
    const [role, setRole] = useState(userInfo.Administrator);
    const [userType, setUserType] = useState(userInfo.Business);
    const fileInputRef = useRef(null);

    const handleSaveName = () => {
        updateUserProfile({ name });
        setEditName(false);
    };

    const handleSaveTaxName = () => {
        updateUserProfile({ taxName: name });
        setEditTaxName(false);
    }

    const handleSaveRole = () => {
        updateUserProfile({ role });
        setEditRole(false);
    };

    const handleSaveUserType = () => {
        updateUserProfile({ userType });
        setEditUserType(false);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const roles = ['Administrador', 'Usuario'];
    const businessTypes = ['Empresa', 'Autónomo'];

    return (
        <div className="py-6 space-y-8">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="relative group">
                    <div
                        className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={handleAvatarClick}
                    >
                        {userProfile.avatar ? (
                            <img
                                src={userProfile.avatar}
                                alt={userProfile.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={40} className="text-gray-400 dark:text-gray-500" />
                        )}
                    </div>
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleAvatarClick}
                    >
                        <Upload size={20} className="text-white" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    updateUserProfile({ avatar: e.target?.result });
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <div className="mt-2 text-center">
                        <button className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                            {/* {t('Edit')} */}
                            Editar
                        </button>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t('Name')}
                            </h3>
                            {!editName ? (
                                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                                    {/* {userProfile.name} */}
                                    {userInfo.Name} {userInfo.Surname}
                                </p>
                            ) : (
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                        {!editName ? (
                            <button
                                onClick={() => setEditName(true)}
                                className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1"
                            >
                                <PencilLine size={14} />
                                {/* {t('ChangeNameBtn')} */}
                                Cambiar nombre
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditName(false)}
                                    className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={handleSaveName}
                                    className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                                >
                                    {t('Save')}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {/* {t('Name')} */}
                                Nombre de la empresa
                            </h3>
                            {!editTaxName ? (
                                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                                    {/* {userProfile.name} */}
                                    {userInfo.TaxName}
                                </p>
                            ) : (
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                        {!editTaxName ? (
                            <button
                                // onClick={() => setEditName(true)}
                                onClick={() => setEditTaxName(true)}
                                className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1"
                            >
                                <PencilLine size={14} />
                                {/* {t('ChangeNameBtn')} */}
                                Cambiar nombre
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    // onClick={() => setEditName(false)}
                                    onClick={() => setEditTaxName(false)}
                                    className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={handleSaveTaxName}
                                    className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                                >
                                    {t('Save')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {/* {t('EmailAddress')} */}
                                Correo electrónico
                            </h3>
                            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                                {/* {userProfile.email} */}
                                {userInfo.Email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {/* {t('ManagedBy')} Google */}
                                Gestionado por Rapitecnic
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {/* {t('Role')} */}
                                Tipo de usuario
                            </h3>
                            {!editUserType ? (
                                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                                    {/* {userProfile.role} */}
                                    {/* {userInfo.Administrator ? 'Administrador' : 'Usuario'} */}
                                    {userInfo.Business ? 'Empresa' : 'Autónomo'}
                                </p>
                            ) : (
                                <div className="mt-1">
                                    <Select
                                        defaultValue={userInfo.Business ? 'Empresa' : 'Autónomo'}
                                    >
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Selecciona el tipo de negocio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                businessTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        {!editUserType ? (
                            <button
                                // onClick={() => setEditRole(true)}
                                onClick={() => setEditUserType(true)}
                                className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1"
                            >
                                <PencilLine size={14} />
                                {/* {t('ChangeRoleBtn')} */}
                                Cambiar tipo de usuario
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    // onClick={() => setEditRole(false)}
                                    onClick={() => setEditUserType(false)}
                                    className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                >
                                    {/* {t('Cancel')} */}
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveUserType}
                                    className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                                >
                                    {/* {t('Save')} */}
                                    Guardar
                                </button>
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {/* {t('Role')} */}
                                Rol
                            </h3>
                            {!editRole ? (
                                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                                    {/* {userProfile.role} */}
                                    {userInfo.Administrator ? 'Administrador' : 'Usuario'}
                                </p>
                            ) : (
                                <div className="mt-1">
                                    <Select defaultValue={userInfo.Administrator ? 'Administrador' : 'Usuario'}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Selecciona el rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                roles.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        {!editRole ? (
                            <button
                                onClick={() => setEditRole(true)}
                                className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1"
                            >
                                <PencilLine size={14} />
                                {/* {t('ChangeRoleBtn')} */}
                                Cambiar rol
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditRole(false)}
                                    className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                >
                                    {/* {t('Cancel')} */}
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveRole}
                                    className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                                >
                                    {/* {t('Save')} */}
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountTab;