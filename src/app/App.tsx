import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { RentalProvider } from "./context/RentalContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RentalProvider>
        <RouterProvider router={router} />
      </RentalProvider>
    </AuthProvider>
  );
}