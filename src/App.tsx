import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Admin from "./pages/admin/Admin";
import Doctor from "./pages/doctor/Doctor";
import Receptionist from "./pages/receptionist/Receptionist";
import ReceptionistAppointments from "./pages/receptionist/appointment/Appointments";
import ProtectedRoute from "./components/ProtectedRoute";

// Doctor Prescription Pages
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BillingDashboard from "./pages/receptionist/billing/BillingDashboard";
import PaymentResult from "./pages/receptionist/billing/PaymentResult";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <Doctor />
            </ProtectedRoute>
          }
        />

        {/* Receptionist Routes */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute requiredRole="RECEPTIONIST">
              <Receptionist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/appointments"
          element={
            <ProtectedRoute requiredRole="RECEPTIONIST">
              <ReceptionistAppointments />
            </ProtectedRoute>
          }
        />

        {/* Receptionist Prescription Routes */}

        {/* Receptionist Billing Routes */}
        <Route
          path="/receptionist/billing"
          element={
            <ProtectedRoute requiredRole="RECEPTIONIST">
              <BillingDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist/billing/payment-result"
          element={
            <ProtectedRoute requiredRole="RECEPTIONIST">
              <PaymentResult />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
