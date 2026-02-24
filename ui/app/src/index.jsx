import React from "react";
import ReactDOM from "react-dom/client";
import { ApiProvider } from "@/providers/api/ApiProvider";
import { I18nProvider } from "@/providers/i18n/I18nProvider";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import App from "@/App";
import routes from "@/routes/index.js";
import ReloadPrompt from "@/components/reload_prompt/ReloadPrompt.jsx";
import { NotificationsProvider } from "@/providers/notifications/NotificationsProvider.jsx";
import "@/index.css";
import { AuthenticationProvider } from "@/providers/authentication/AuthenticationProvider.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <NotificationsProvider>
    <I18nProvider>
      <ApiProvider>
        <Router basename="/">
          <AuthenticationProvider>
            <App>
              <ReloadPrompt />

              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<route.element />}
                  />
                ))}
              </Routes>
            </App>
          </AuthenticationProvider>
        </Router>
      </ApiProvider>
    </I18nProvider>
  </NotificationsProvider>,
);
