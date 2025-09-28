import axios from 'axios';
import Cookies from 'js-cookie';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

axios.interceptors.request.use(request => {
    const csrfToken = Cookies.get('XSRF-TOKEN');
    if (csrfToken) {
        request.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return request;
});