import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../lib/permissions';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
  hideFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  fallback,
  hideFallback = false
}) => {
  const { profile } = useAuth();

  const hasPermission = profile?.permissions.includes(permission);

  if (!hasPermission) {
    if (hideFallback) return null;
    
    return fallback || (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <p>Você não tem permissão para acessar esta funcionalidade.</p>
      </div>
    );
  }

  return <>{children}</>;
};
