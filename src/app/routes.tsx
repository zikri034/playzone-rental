import { createBrowserRouter, useRouteError, Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Reserve from "./pages/Reserve";
import MyRentals from "./pages/MyRentals";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoutes"; // 🔥 1. Tambahkan import ini

// 🎮 Komponen Halaman 404 bergaya Gaming
function ErrorBoundary() {
  const error: any = useRouteError();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-700 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gamepad2 size={40} className="animate-bounce" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Game Over!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          {error?.status === 404 
            ? "Area ini belum terbuka. Sepertinya kamu salah memasukkan URL." 
            : "Terjadi glitch pada sistem. Coba lagi nanti."}
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-block w-full shadow-md hover:shadow-lg"
        >
          Respawn (Kembali ke Dashboard)
        </Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />, 
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "reserve",
        element: <Reserve />,
      },
      {
        path: "my-rentals",
        element: <MyRentals />,
      },
      {
        path: "admin",
        // 🔥 2. Bungkus Admin dengan AdminRoute di sini
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        ),
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);