import axios from 'axios';
import cookies from 'js-cookie';

const request = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

export const requestGetAllProduct = async () => {
    const res = await request.get('/api/get-all-product');
    return res.data;
};

export const requestChatbot = async () => {
    const res = await request.post('/api/chatbot');
    return res.data;
};

export const requestSearch = async (valueSearch) => {
    const res = await request.get('/api/search', { params: { valueSearch } });
    return res.data;
};

export const requestUploadImage = async (formData) => {
    const res = await request.post('/api/upload-image', formData);
    return res.data;
};

//// category

export const requestForgotPassword = async (data) => {
    const res = await request.post('/api/forgot-password', data);
    return res.data;
};

export const requestResetPassword = async (data) => {
    const res = await request.post('/api/reset-password', data);
    return res.data;
};

export const requestUpdateCategory = async (data) => {
    const res = await request.post('/api/update-category', data);
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await request.delete('/api/delete-category', { params: { id } });
    return res.data;
};

export const requestStatistical = async () => {
    const res = await request.get('/api/statistical');
    return res.data;
};

export const requestAdmin = async () => {
    const res = await request.get('/admin');
    return res.data;
};

export const requestRegister = async (data) => {
    const res = await request.post('/api/register', data);
    return res.data;
};

export const requestLoginGoogle = async (credential) => {
    const res = await request.post('/api/login-google', { credential });
    return res.data;
};

export const requestLogin = async (data) => {
    const res = await request.post('/api/login', data);
    return res.data;
};

export const requestAuth = async () => {
    const res = await request.get('/api/auth');
    return res.data;
};

export const requestLogout = async () => {
    const res = await request.get('/api/logout');
    return res.data;
};

const requestRefreshToken = async () => {
    const res = await request.get('/api/refresh-token');
    return res.data;
};

export const requestCreateCategory = async (data) => {
    const res = await request.post('/api/create-category', data);
    return res.data;
};

export const requestGetAllCategory = async () => {
    const res = await request.get('/api/get-all-category');
    return res.data;
};

export const requestCreateCart = async (data) => {
    const res = await request.post('/api/create-cart', data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await request.get('/api/get-cart');
    return res.data;
};

export const requestDeleteProductCart = async (data) => {
    const res = await request.post('/api/delete-product-cart', data);
    return res.data;
};

export const requestUpdateProductCart = async (data) => {
    const res = await request.post('/api/update-product-cart', data);
    return res.data;
};

export const requestCreatePayment = async (data) => {
    const res = await request.post('/api/create-payment', data);
    return res.data;
};

export const requestUpdateInfoCart = async (data) => {
    const res = await request.post('/api/update-info-cart', data);
    return res.data;
};

export const requestGetPaymentSuccess = async (id) => {
    const res = await request.get('/api/get-payment-success', {
        params: { idPayment: id },
    });
    return res.data;
};

export const requestGetOrderUser = async () => {
    const res = await request.get('/api/get-order-user');
    return res.data;
};

export const requestUpdateUser = async (data) => {
    const res = await request.post('/api/update-user', data);
    return res.data;
};

export const requestCancelOrder = async (data) => {
    const res = await request.post('/api/cancel-order', data);
    return res.data;
};

export const requestCreateProduct = async (formData) => {
    const res = await request.post('/api/create-product', formData);
    return res.data;
};

export const requestUpdateProduct = async (data) => {
    const res = await request.post('/api/update-product', data);
    return res.data;
};

export const requestDeleteProduct = async (id) => {
    const res = await request.delete('/api/delete-product', { params: { id } });
    return res.data;
};

export const requestGetAllUser = async () => {
    const res = await request.get('/api/users');
    return res.data;
};

export const requestUpdateUserAdmin = async (data) => {
    const res = await request.post('/api/update-user-admin', data);
    return res.data;
};

export const requestGetOrderAdmin = async () => {
    const res = await request.get('/api/get-order-admin');
    return res.data;
};

export const requestUpdateOrderStatus = async (data) => {
    const res = await request.post('/api/update-order-status', data);
    return res.data;
};

export const requestGetProductManufactured = async () => {
    const res = await request.get('/api/get-product-manufactured');
    return res.data;
};

export const requestCreatePreviewProduct = async (data) => {
    const res = await request.post('/api/create-preview-product', data);
    return res.data;
};

export const requestGetPreviewProductHome = async () => {
    const res = await request.get('/api/get-preview-product-home');
    return res.data;
};

let isRefreshing = false;
let failedRequestsQueue = [];

request.interceptors.response.use(
    (response) => response, // Trả về nếu không có lỗi
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và request chưa từng thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gửi yêu cầu refresh token
                    const token = cookies.get('logged');
                    if (!token) {
                        return;
                    }
                    await requestRefreshToken();

                    // Xử lý lại tất cả các request bị lỗi 401 trước đó
                    failedRequestsQueue.forEach((req) => req.resolve());
                    failedRequestsQueue = [];
                } catch (refreshError) {
                    // Nếu refresh thất bại, đăng xuất
                    failedRequestsQueue.forEach((req) => req.reject(refreshError));
                    failedRequestsQueue = [];
                    localStorage.clear();
                    window.location.href = '/login'; // Chuyển về trang đăng nhập
                } finally {
                    isRefreshing = false;
                }
            }

            // Trả về một Promise để retry request sau khi token mới được cập nhật
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    resolve: () => {
                        resolve(request(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        return Promise.reject(error);
    },
);
