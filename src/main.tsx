import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { ThemeProvider } from "@/lib/theme";
import { RbacProvider } from "@/lib/rbac";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RbacProvider>
        <StoreProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
        </StoreProvider>
      </RbacProvider>
    </ThemeProvider>
  </StrictMode>,
);
