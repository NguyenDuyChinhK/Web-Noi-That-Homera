import Context from './Context';
import cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { requestAuth, requestGetCart } from '../config/request';

import { useEffect, useState } from 'react';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [dataCart, setDataCart] = useState({});

    const token = cookies.get('logged');

    const getAuthUser = async () => {
        const res = await requestAuth();
        const bytes = CryptoJS.AES.decrypt(res.metadata.auth, import.meta.env.VITE_SECRET_CRYPTO);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        const user = JSON.parse(originalText);
        setDataUser(user);
    };

    const getCart = async () => {
        const res = await requestGetCart();
        setDataCart(res.metadata);
    };

    useEffect(() => {
        if (token !== '1') return;

        const fetchData = async () => {
            try {
                await getAuthUser();
                await getCart();
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [token]);

    return <Context.Provider value={{ dataUser, getAuthUser, dataCart, getCart }}>{children}</Context.Provider>;
}
