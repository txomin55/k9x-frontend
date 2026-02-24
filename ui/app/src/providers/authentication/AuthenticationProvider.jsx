import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApi } from "@/providers/api/ApiProvider";
import { ROUTES } from "@/routes";
import fetchUserData from "@/services/fetch_user_data/fetchUserData";
import verifySession from "@/providers/authentication/services/verify_session/verifySession";
import { create } from "zustand";

const UserContext = createContext();

export const AuthenticationProvider = ({ children }) => {
  const api = create((set) => ({
    user: null,
    setUser: (newUser) => set({ user: newUser }),
  }));

  const user = api((state) => state.user);
  const setUser = api((state) => state.setUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getApi = useApi();
  const { verify, getUserData } = getApi();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== ROUTES.LANDING) {
      verifySession(verify)
        .then((verificationResult) => {
          if (verificationResult && !user) {
            fetchUserData(getUserData, (d) => {
              setUser(d);

              if (location.pathname === ROUTES.LANDING) {
                navigate(ROUTES.HOME);
              }
            });
          }
          setLoading(false);
        })
        .catch((e) => {
          setError(e);
          if (location.pathname !== ROUTES.LANDING) {
            navigate(ROUTES.LANDING, { replace: true });
          }
        });
    } else {
      setLoading(false);
    }
  }, [getApi, verify, getUserData, location, navigate]);

  return (
    <UserContext.Provider value={api()}>
      {loading ? <p>..Verifying</p> : !error && children}
    </UserContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(UserContext);
};
