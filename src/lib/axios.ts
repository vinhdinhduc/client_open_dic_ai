import axios from "axios";
import { toast } from "react-hot-toast";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    }
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - Add token to header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and auto-refresh token
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                // Refresh token itself failed, logout user
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                    { refreshToken }
                );

                if (response.data.success && response.data.data.accessToken) {
                    const newAccessToken = response.data.data.accessToken;
                    localStorage.setItem("accessToken", newAccessToken);

                    if (response.data.data.user) {
                        localStorage.setItem("user", JSON.stringify(response.data.data.user));
                    }

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);

                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 403:
                    toast.error("Bạn không có quyền truy cập tài nguyên này.");
                    break;
                case 404:
                    toast.error("Tài nguyên không tồn tại.");
                    break;
                case 500:
                    toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
                    break;
                default:
                    if (!originalRequest._retry) {
                        toast.error(data.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
                    }
            }
        } else if (error.request) {
            toast.error("Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.");
        } else {
            toast.error("Đã xảy ra lỗi trong quá trình thiết lập yêu cầu.");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;