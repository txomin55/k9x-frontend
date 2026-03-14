import { createSignal } from "solid-js";
import axios from "@/utils/axios";
import { locale } from "@/stores/i18n";

const [api, setApi] = createSignal(null);
let initialized = false;

const initApi = async () => {
  if (initialized) return;
  initialized = true;

  await axios.initAxiosClient(locale());
  const client = await axios.getOASClient();

  const enhancedApi = client.api
    .getOperations()
    .map((op) => op.operationId)
    .reduce((acc, curr) => {
      acc[curr] = client[curr];
      return acc;
    }, {});

  setApi(() => enhancedApi);
};

export { api, initApi };
