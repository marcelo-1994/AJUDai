import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Contract } from '../pages/Contract';

export const ContractGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  
  if (profile && !profile.contract_accepted) {
    return <Contract />;
  }

  return <>{children}</>;
};
