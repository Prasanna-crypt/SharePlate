import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import DonateFood from './pages/DonateFood';
import FindFood from './pages/FindFood';
import ListingDetails from './pages/ListingDetails';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import VolunteerTasks from './pages/VolunteerTasks';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/donate"
              element={
                <ProtectedRoute roles={['donor', 'admin']}>
                  <DonateFood />
                </ProtectedRoute>
              }
            />
            <Route path="/find" element={<FindFood />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route
              path="/dashboard/donor"
              element={
                <ProtectedRoute roles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/receiver"
              element={
                <ProtectedRoute roles={['receiver']}>
                  <ReceiverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/volunteer"
              element={
                <ProtectedRoute roles={['donor', 'receiver', 'admin']}>
                  <VolunteerTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
