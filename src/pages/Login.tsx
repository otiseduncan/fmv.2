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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
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
  );
}
