import type axios from 'axios';

declare global {
    interface Window {
        axios: typeof axios;
    }
}

declare module "*.svg" {
    const content: string;
    export default content;
}
