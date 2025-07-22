import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Tools from './components/Tools';
import AdminPanel from './components/AdminPanel';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/chat" element={user ? <Layout><Chat /></Layout> : <Navigate to="/login" />} />
      <Route path="/tools" element={user ? <Layout><Tools /></Layout> : <Navigate to="/login" />} />
      <Route 
        path="/admin" 
        element={
          user && user.isAdmin ? 
          <Layout><AdminPanel /></Layout> : 
          <Navigate to="/" />
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-neon-darker via-neon-dark to-neon-gray">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;