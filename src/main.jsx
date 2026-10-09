import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { ChemicalProvider } from "./context/ChemicalContext";
import { IssueProvider } from "./context/IssueContext";
import { InstrumentProvider } from "./context/InstrumentContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <ChemicalProvider>
        <IssueProvider>
          <InstrumentProvider>
            <App />
          </InstrumentProvider>
        </IssueProvider>
      </ChemicalProvider>
    </AuthProvider>
  </React.StrictMode>
);