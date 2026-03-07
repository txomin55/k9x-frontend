import { get, writable } from "svelte/store";
import axios from "$lib/utils/axios";
import { locale } from "$lib/stores/i18n";

const api = writable(null);
let initialized = false;

const initApi = async () => {
  if (initialized) return;
  initialized = true;

  await axios.initAxiosClient(get(locale));
  const client = await axios.getOASClient();

  const enhancedApi = client.api
    .getOperations()
    .map((op) => op.operationId)
    .reduce((acc, curr) => {
      acc[curr] = client[curr];
      return acc;
    }, {});

  api.set(enhancedApi);

  locale.subscribe((nextLocale) => {
    if (get(api)) {
      axios.setLocale(nextLocale);
    }
  });
};

export { api, initApi };
