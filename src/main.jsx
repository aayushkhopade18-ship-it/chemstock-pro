import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { ChemicalProvider } from "./context/ChemicalContext";
import { IssueProvider } from "./context/IssueContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChemicalProvider>
        <IssueProvider>
          <App />
        </IssueProvider>
      </ChemicalProvider>
    </BrowserRouter>
  </StrictMode>
);