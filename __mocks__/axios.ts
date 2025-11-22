// Minimal axios mock that works with jest.mock("axios") and axios.create()
const mockAxios: any = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
        request: {use: jest.fn(), eject: jest.fn()},
        response: {use: jest.fn(), eject: jest.fn()},
    },
    isAxiosError: jest.fn(() => false),
};

mockAxios.create = jest.fn((config?: {baseURL?: string}) => {
    const instance: any = {
        interceptors: {
            request: {use: jest.fn(), eject: jest.fn()},
            response: {use: jest.fn(), eject: jest.fn()},
        },
    };

    instance.get = jest.fn((url: string, ...args: any[]) =>
        mockAxios.get(config?.baseURL ? `${config.baseURL}${url}` : url, ...args),
    );
    instance.post = jest.fn((url: string, ...args: any[]) =>
        mockAxios.post(config?.baseURL ? `${config.baseURL}${url}` : url, ...args),
    );
    instance.put = jest.fn((url: string, ...args: any[]) =>
        mockAxios.put(config?.baseURL ? `${config.baseURL}${url}` : url, ...args),
    );
    instance.delete = jest.fn((url: string, ...args: any[]) =>
        mockAxios.delete(config?.baseURL ? `${config.baseURL}${url}` : url, ...args),
    );
    instance.patch = jest.fn((url: string, ...args: any[]) =>
        mockAxios.patch(config?.baseURL ? `${config.baseURL}${url}` : url, ...args),
    );

    return instance;
});

export default mockAxios;
