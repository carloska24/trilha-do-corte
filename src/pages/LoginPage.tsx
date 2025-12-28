import React from 'react';
import { AuthScreen } from '../components/AuthScreen';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = (searchParams.get('type') as 'client' | 'barber') || 'client';

  const handleLoginSuccess = (userData: any) => {
    // Map userData to ClientProfile or BarberProfile
    // For now passing userData directly as it matches partially
    //Ideally we should fetch the full profile here or ensure AuthScreen returns it

    // Construct a profile object (simplified for now to match types)
    const profile = {
      id: userData.id || 'temp-id',
      name: userData.name,
      email: userData.emailOrPhone.includes('@') ? userData.emailOrPhone : undefined,
      phone: !userData.emailOrPhone.includes('@') ? userData.emailOrPhone : undefined,
      photoUrl: userData.photoUrl,
      // Add defaults for missing required fields
      loyaltyPoints: userData.loyaltyPoints || 0,
      history: userData.history || [],
      savedStyles: userData.savedStyles || [],
      // Barber specific
      bio: userData.bio,
      specialties: userData.specialties,
      instagram: userData.instagram,
    };

    // @ts-ignore - Dynamic mapping for now
    login(type, profile);

    if (type === 'barber') {
      navigate('/dashboard');
    } else {
      navigate('/client');
    }
  };

  return (
    <AuthScreen type={type} onLoginSuccess={handleLoginSuccess} onGoBack={() => navigate('/')} />
  );
};
