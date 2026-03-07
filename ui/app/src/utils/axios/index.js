import OpenAPIClientAxios from "openapi-client-axios";

export default {
  async initAxiosClient(locale) {
    this.locale = locale;
    return new Promise((resolve) => {
      this.index = new OpenAPIClientAxios({
        definition: import.meta.env.VITE_APP_OAS,
      });

      this.index.init().then((client) => {
        client.interceptors.request.use((request) => {
          request.headers["Accept-language"] = this.locale;

          if (request.url.includes("/api/")) {
            const token = globalThis.localStorage.getItem("k9x_access_token");
            request.headers["Authorization"] = `Bearer ${token}`;
          }

          return request;
        });

        client.interceptors.response.use(
          (response) => {
            return response.data;
          },
          (error) => {
            return Promise.reject(error);
          },
        );

        resolve();
      });
    });
  },
  async getOASClient() {
    const client = await this.index.getClient();
    client.defaults.baseURL = import.meta.env.VITE_APP_API_ADDRESS;
    return client;
  },
  setLocale(locale) {
    this.locale = locale;
  },
};
