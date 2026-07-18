import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    headers:{
        'Content-Type':'application/json'
    }
})
API.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/refresh`, {
                    refreshToken: localStorage.getItem('refreshToken')
                })
                const newAccessToken = res.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshToken);
            }
        }
        return Promise.reject(error);
    },
)


export const fileApi = {
  getWorkbookInfo: (fileId) => 
    API.get(`/file/${fileId}/workbook`),

  getWorkbookStatus: (fileId) => 
    API.get(`/file/${fileId}/workbook/status`),

  getWorksheetData: (fileId, worksheetId, page, pageSize) => 
    API.get(`/file/${fileId}/sheets/${worksheetId}`, {
      params: { page, pageSize }
    }),

  downloadFile: (fileId) => 
    API.get(`/file/${fileId}/download`, {
      responseType: 'blob'
    })
};

export default API;