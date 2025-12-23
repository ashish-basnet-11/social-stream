import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import OAuthSuccess from './pages/OAuthSuccess';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/success" element={<OAuthSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;