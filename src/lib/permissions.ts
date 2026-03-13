export type Permission = 
  | 'view_requests'
  | 'create_requests'
  | 'respond_requests'
  | 'access_pro_modules'
  | 'access_labs'
  | 'access_academy'
  | 'admin_panel'
  | 'manage_users';

export type UserRole = 'free' | 'pro' | 'strategic' | 'enterprise' | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  free: [
    'view_requests',
    'create_requests',
    'respond_requests'
  ],
  pro: [
    'view_requests',
    'create_requests',
    'respond_requests',
    'access_pro_modules',
    'access_academy'
  ],
  strategic: [
    'view_requests',
    'create_requests',
    'respond_requests',
    'access_pro_modules',
    'access_academy',
    'access_labs'
  ],
  enterprise: [
    'view_requests',
    'create_requests',
    'respond_requests',
    'access_pro_modules',
    'access_academy',
    'access_labs'
  ],
  admin: [
    'view_requests',
    'create_requests',
    'respond_requests',
    'access_pro_modules',
    'access_academy',
    'access_labs',
    'admin_panel',
    'manage_users'
  ]
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const getPermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};
