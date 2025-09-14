import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedLogin } from './UnifiedLogin';
import { apiClient } from '../services/api';

interface UnifiedLoginIntegrationProps {
  onAuthentication: (user: any) => void;
}

export function UnifiedLoginIntegration({ onAuthentication }: UnifiedLoginIntegrationProps) {
  const navigate = useNavigate();

  const handleTouristLogin = async (credentials: any) => {
    try {
      console.log('🚀 Tourist login attempt:', credentials);
      
      let response;
      
      // Check if it's registration or login
      if (credentials.fullName && !credentials.userType) {
        // Registration flow - create new tourist
        const registrationData = {
          name: credentials.fullName,
          email: credentials.identifier,
          phoneNumber: credentials.phoneNumber,
          nationality: credentials.nationality,
          passportNumber: credentials.passportNumber,
          emergencyContact: credentials.emergencyContact,
          password: credentials.password
        };
        
        console.log('📝 Registration data:', registrationData);
        
        // First register the tourist
        const registerResponse = await apiClient.registerTourist(registrationData, []);
        
        if (!registerResponse.success) {
          throw new Error(registerResponse.error || 'Registration failed');
        }
        
        console.log('✅ Registration successful, now logging in...');
        
        // Then login with the credentials
        const loginData = {
          identifier: credentials.identifier,
          password: credentials.password,
          nationality: credentials.nationality
        };
        
        response = await apiClient.touristLogin(loginData);
      } else {
        // Login flow
        const loginData = {
          identifier: credentials.identifier,
          password: credentials.password,
          nationality: credentials.nationality
        };
        
        console.log('📝 Login data:', loginData);
        response = await apiClient.touristLogin(loginData);
      }
      
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Authentication successful');
        
        // Set session
        apiClient.setSessionId(response.data.session.id);
        
        // Update parent component state
        onAuthentication(response.data.user);
        
        // Navigate to user dashboard
        navigate('/user-dashboard');
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Tourist authentication error:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAuthorityLogin = async (credentials: any) => {
    try {
      console.log('🚀 Authority login attempt:', credentials);
      
      let response;
      
      // Check if it's registration or login
      if (credentials.fullName && !credentials.userType) {
        // Registration flow would need to be implemented on backend
        alert('Authority registration is not yet implemented. Please use existing credentials or contact system administrator.');
        return;
      } else {
        // Login flow
        const loginData = {
          email: credentials.email,
          password: credentials.password,
          department: credentials.department,
          badge: credentials.badge
        };
        
        console.log('📝 Authority login data:', loginData);
        response = await apiClient.authorityLogin(loginData);
      }
      
      console.log('📡 Authority API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Authority authentication successful');
        
        // Set session
        apiClient.setSessionId(response.data.session.id);
        
        // Update parent component state
        onAuthentication(response.data.user);
        
        // Navigate to admin dashboard
        navigate('/admin-dashboard');
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Authority authentication error:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <UnifiedLogin
      onTouristLogin={handleTouristLogin}
      onAuthorityLogin={handleAuthorityLogin}
    />
  );
}
