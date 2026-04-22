import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  // Ambil 'user' (bukan profile) dari useAuth
  const { user } = useAuth();

  // Gunakan email yang kamu daftarkan tadi
  const isAdmin = user?.email === "zikrirausyan@gmail.com"; 

  // Jika user belum login atau bukan admin, tendang ke luar
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}