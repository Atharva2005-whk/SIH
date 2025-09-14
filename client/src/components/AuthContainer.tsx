import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

interface AuthContainerProps {
  onLogin: (credentials: any) => Promise<void>;
  initialView?: 'login' | 'register';
}

export function AuthContainer({ onLogin, initialView = 'login' }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register'>(initialView);

  const handleLogin = async (loginCredentials: any) => {
    // Transform login credentials to match existing interface
    const transformedCredentials = {
      userType: loginCredentials.email.includes('indian') ? 'indian' : 'foreign',
      fullName: loginCredentials.email.includes('indian') ? 'Indian Tourist' : 'Foreign Tourist',
      phoneNumber: '+91-9876543210',
      emergencyContactName: 'Emergency Contact',
      emergencyContactNumber: '+91-9876543211'
    };
    
    await onLogin(transformedCredentials);
  };

  const handleRegister = async (registerCredentials: any) => {
    // Transform register credentials to match existing interface
    const transformedCredentials = {
      userType: registerCredentials.userType,
      fullName: registerCredentials.fullName,
      phoneNumber: registerCredentials.phoneNumber,
      emergencyContactName: registerCredentials.emergencyContactName,
      emergencyContactNumber: registerCredentials.emergencyContactNumber
    };
    
    await onLogin(transformedCredentials);
  };

  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={switchToRegister}
      />
    );
  }

  return (
    <Register 
      onRegister={handleRegister} 
      onSwitchToLogin={switchToLogin}
    />
  );
}
