import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Loader2 } from "lucide-react";
import App from "@/App";
import LoginPage from "@/pages/login";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { RbacProvider } from "@/lib/rbac";
import { ConnectedRbacProvider } from "@/lib/rbac-connected";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function AppRoot() {
  const { mode, status } = useAuth();

  // Demo mode (no backend configured): persona-switcher RBAC, local data.
  if (mode === "demo") {
    return (
      <RbacProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </RbacProvider>
    );
  }

  // Connected mode (VITE_API_URL set): real auth + backend-driven RBAC.
  if (status === "loading") return <Splash />;
  if (status !== "authenticated") return <LoginPage />;
  return (
    <ConnectedRbacProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ConnectedRbacProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoot />
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
