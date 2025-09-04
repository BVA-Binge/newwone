import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { LandingPage } from './components/Landing/LandingPage';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectForm } from './components/Projects/ProjectForm';
import { CarbonCalculator } from './components/Calculator/CarbonCalculator';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { ImpactVisualization } from './components/Impact/ImpactVisualization';
import { VerificationDashboard } from './components/Verification/VerificationDashboard';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <Layout>
                <LandingPage />
              </Layout>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <Layout>
                <AuthForm />
              </Layout>
            } 
          />
          
          {/* Public Calculator and Map */}
          <Route 
            path="/calculator" 
            element={
              <Layout>
                <CarbonCalculator />
              </Layout>
            } 
          />
          <Route 
            path="/map" 
            element={
              <Layout>
                <InteractiveMap />
              </Layout>
            } 
          />
          <Route 
            path="/impact" 
            element={
              <Layout>
                <ImpactVisualization />
              </Layout>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            } 
          />
          <Route 
            path="/projects/new" 
            element={
              <Layout>
                <ProtectedRoute>
                  <ProjectForm />
                </ProtectedRoute>
              </Layout>
            } 
          />
          <Route 
            path="/verify" 
            element={
              <Layout>
                <ProtectedRoute>
                  <VerificationDashboard />
                </ProtectedRoute>
              </Layout>
            } 
          />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;