import { Routes, Route, Navigate } from "react-router-dom";
import { Signin } from "./components/sigin.jsx";
import { Signup } from "./components/createaccount.jsx";
import { Dashboard } from "./components/dashboard.jsx";
import { ProtectedRoute } from "./Protectedroute.jsx";


function App() {
  return (
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* default route */}
      <Route path="*" element={<Navigate to="/signin" />} />
    </Routes>
  );
}

export default App;
