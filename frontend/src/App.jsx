import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SymptomChatbot from './components/Chatbot/SymptomChatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import DoctorDashboard from './pages/DoctorDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route 
              path="/doctor-dashboard" 
              element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} 
            />
          </Routes>
          <SymptomChatbot />
          <Footer />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
