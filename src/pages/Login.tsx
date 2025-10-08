import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-glass-primary mb-8">DriveOps-IQ</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Hero Section with Branding */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl font-bold text-glass-primary mb-4">DriveOps-IQ</h1>
        <p className="text-xl text-glass-secondary mb-2">Intelligent Operations for the Modern Field</p>
        <p className="text-glass-secondary">Streamline your automotive calibration workflow</p>
      </div>

      {/* Auth Forms */}
      <div className="w-full max-w-md z-10">
        {view === 'login' && (
          <LoginForm
            onToggleForm={() => setView('register')}
            onForgotPassword={() => setView('forgot')}
          />
        )}
        {view === 'register' && (
          <RegisterForm onToggleForm={() => setView('login')} />
        )}
        {view === 'forgot' && (
          <ForgotPasswordForm onBack={() => setView('login')} />
        )}
      </div>
    </div>
  );
}
