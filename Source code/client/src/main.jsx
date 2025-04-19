import React from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App";
import { StateContextProvider } from "./context";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./index.css";

const activeChain = "sepolia";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThirdwebProvider
      clientId={import.meta.env.VITE_CLIENT_ID}
      activeChain={activeChain}
    >
      <Router>
        <StateContextProvider>
          <App />
        </StateContextProvider>
      </Router>
    </ThirdwebProvider>
  </React.StrictMode>
);
