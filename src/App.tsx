import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Additional routes (login, register, dashboard…) go here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
