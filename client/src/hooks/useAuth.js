import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserInfoStore } from '@/zustand/userInfoStore';
import { io } from 'socket.io-client';
import { useToast } from './use-toast';

const apiUrl = import.meta.env.VITE_API_URL;
const websocket = import.meta.env.VITE_WEBSOCKET;

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const setUserInfo = useUserInfoStore((state) => state.setUserInfo);

    const { toast } = useToast();

    const login = async ({ email, password, empresa }) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/authcontroller/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ empresa, email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            const { userInfo, token } = data;

            setUserInfo(userInfo);

            const storageItems = {
                token,
                UserName: `${userInfo.Name} ${userInfo.Surname}`.trim() || userInfo.Email,
                role: userInfo.Administrator ? 'admin' : 'user',
                LoginID: userInfo.ExternalLoginID,
                email: userInfo.Email,
                profile: userInfo.ExternalLoginID,
                empresa,
                justLoggedIn: 'true',
                workdayStatus: '0',
                city: userInfo.City || '',
                province: userInfo.Province || '',
                zipCode: userInfo.ZipCode || '',
            };

            Object.entries(storageItems).forEach(([key, value]) => {
                localStorage.setItem(key, String(value));
            });

            navigate('/inicio');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al conectar con el servidor');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };


    const register = async ({
        address,
        cell,
        city,
        companyName,
        email,
        empresa,
        idnumber,
        name,
        password,
        phone,
        province,
        secondSurname,
        surname,
        zipCode,
        documentType,
        userType,
    }) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiUrl}/authcontroller/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    cell,
                    city,
                    companyName,
                    email,
                    empresa,
                    idnumber,
                    name,
                    password,
                    phone,
                    province,
                    secondSurname,
                    surname,
                    zipCode,
                    documentType,
                    userType,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al registrar usuario');
            }

            // Iniciar sesión automáticamente después del registro
            // await login({ email, password, empresa });
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Error al registrar usuario');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const registerUser = async (userData) => {
        console.log('userData', userData);
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/authcontroller/registerUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userData }),
        });

        if (!response.ok) {
            const data = await response.json();
            setError(data.message || 'Error al registrar usuario');
            setIsLoading(false);
            toast({
                title: 'Error',
                description: data.message || 'Error al registrar usuario',
                variant: 'destructive',
            })
            return;
        }

        toast({
            title: 'Usuario registrado',
            description: 'El usuario ha sido registrado correctamente.',
            variant: 'success',
        });

        // Navegar a la página de gestiones
        navigate('/gestiones');
        setIsLoading(false);
        setError(null);
    }

    return {
        login,
        register,
        isLoading,
        error,
        registerUser,
    };
};