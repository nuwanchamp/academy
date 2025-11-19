import axios from 'axios';
import Cookies from 'js-cookie';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const applyAuthToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rr_token') : null;
    if (token) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete window.axios.defaults.headers.common['Authorization'];
    }
};

applyAuthToken();

axios.interceptors.request.use(request => {
    const csrfToken = Cookies.get('XSRF-TOKEN');
    if (csrfToken) {
        request.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('rr_token') : null;
    if (token) {
        request.headers['Authorization'] = `Bearer ${token}`;
    }

    return request;
});
