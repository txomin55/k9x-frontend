import OpenAPIClientAxios from "openapi-client-axios";

export default {
  async initAxiosClient(locale) {
    this.locale = locale;
    return new Promise((resolve) => {
      this.index = new OpenAPIClientAxios({
        definition:
          "https://cdn.jsdelivr.net/gh/txomin55/k9x-oas-definition@main/openapi.yaml",
      });

      this.index.init().then((client) => {
        client.interceptors.request.use((request) => {
          request.headers["Accept-language"] = this.locale;

          if (request.url.includes("/api/"))
            request.headers["Authorization"] = "Bearer FAKE_BEARER";

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
    client.defaults.baseURL = process.env.VITE_APP_API_ADDRESS;
    return client;
  },
  setLocale(locale) {
    this.locale = locale;
  },
};
