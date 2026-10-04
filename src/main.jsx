import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "./lib/context";
import App from "./App";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Provider>
      <App />
    </Provider>
  </HashRouter>,
);
