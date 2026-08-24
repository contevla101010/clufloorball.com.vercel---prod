import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { CustomCursor } from "@/components/site/CustomCursor";
import Home from "@/pages/Home";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";

const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.1 });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  return null;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink text-brand-off">
        <span className="font-anton uppercase tracking-widest">Caricamento…</span>
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <div className="noise-overlay" />
      <AuthProvider>
        <ContentProvider>
          <BrowserRouter>
            <SmoothScroll />
            <CustomCursor />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="bottom-right" theme="dark" richColors />
          </BrowserRouter>
        </ContentProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
