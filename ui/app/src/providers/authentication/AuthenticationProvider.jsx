import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApi } from "@/providers/api/ApiProvider";
import { ROUTES } from "@/routes";
import fetchUserData from "@/services/fetch_user_data/fetchUserData";
import { create } from "zustand";

const UserContext = createContext();

export const AuthenticationProvider = ({ children }) => {
  const api = create((set) => ({
    user: null,
    setUser: (newUser) => set({ user: newUser }),
  }));

  const setUser = api((state) => state.setUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getApi = useApi();
  const { getUserData } = getApi();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== ROUTES.LANDING) {
      fetchUserData(getUserData, (d) => {
        setUser(d);

        if (location.pathname === ROUTES.LANDING) {
          navigate(ROUTES.HOME, { replace: true });
        }
      })
        .catch((e) => {
          setError(e);
          if (location.pathname !== ROUTES.LANDING) {
            navigate(ROUTES.LANDING, { replace: true });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [getApi, getUserData, location, navigate]);

  return (
    <UserContext.Provider value={api()}>
      {loading ? <p>..Verifying</p> : !error && children}
    </UserContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(UserContext);
};
