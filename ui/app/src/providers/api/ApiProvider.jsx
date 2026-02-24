import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "src/utils/axios";
import { useI18n } from "@/providers/i18n/I18nProvider.jsx";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const { locale } = useI18n();
  const [queryApi, setQueryApi] = useState(null);
  const [actualLocale, setActualLocale] = useState(locale);

  useEffect(() => {
    axios.initAxiosClient(locale).then(() => {
      axios.getOASClient().then((client) => {
        const enhancedApi = client.api
          .getOperations()
          .map((op) => op.operationId)
          .reduce((acc, curr) => {
            acc[curr] = client[curr];
            return acc;
          }, {});

        if (!queryApi) {
          setQueryApi(enhancedApi);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (queryApi && locale !== actualLocale) {
      setActualLocale(locale);
      axios.setLocale(locale);
    }
  }, [queryApi, locale]);

  return (
    <ApiContext.Provider value={() => queryApi}>
      {queryApi ? children : <div>Loading api....</div>}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  return useContext(ApiContext);
};
