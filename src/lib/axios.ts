import axios from "axios";
import { toast } from "react-hot-toast";



const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers:{
        "Content-Type": "application/json",
    }
});

//Thêm token vào header của request

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

        }
        return config;
    }
    ,
    (error) => {
        return Promise.reject(error);
    }
);
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error.response) {
            const {status, data} = error.response;

            switch (status) {
                case 401:
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    if(typeof window !== "undefined"){
                        window.location.href = "/login";
                    }
                    break;
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
                        toast.error(data.message || "Đã xảy ra lỗi. Vui lòng thử lại.");

        }
    }
    else if(error.request) {
        toast.error("Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.");
    }else {
        toast.error("Đã xảy ra lỗi trong quá trình thiết lập yêu cầu.");
    }
return Promise.reject(error);   }


);
export default axiosInstance;