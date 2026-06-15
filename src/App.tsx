import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChooseScenarioPage from './pages/ChooseScenarioPage';
import DashboardPage from './pages/DashboardPage';
import WatchGamePage from './pages/WatchGamePage';

const NAVBAR_HIDDEN_PATHS = new Set(['/dashboard']);

function Layout() {
  const location = useLocation();
  const hideNavbar =
    NAVBAR_HIDDEN_PATHS.has(location.pathname) ||
    location.pathname.startsWith('/watch/');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/choose-scenario" element={<ChooseScenarioPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/watch/:gameId" element={<WatchGamePage />} />
        <Route path="/account" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
