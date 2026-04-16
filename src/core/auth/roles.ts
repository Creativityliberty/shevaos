export type UserRole = 
  | 'ceo' 
  | 'manager' 
  | 'sav_agent' 
  | 'sav_manager' 
  | 'dispatcher' 
  | 'ops_manager' 
  | 'driver' 
  | 'hub'
  | 'hub_manager'
  | 'finance' 
  | 'ads_manager'
  | 'achats'
  | 'stock_manager'
  | 'super_admin';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 110,
  ceo: 100,
  manager: 90,
  ops_manager: 80,
  sav_manager: 80,
  finance: 70,
  dispatcher: 60,
  hub_manager: 55,
  hub: 50,
  ads_manager: 40,
  achats: 40,
  stock_manager: 40,
  sav_agent: 30,
  driver: 20,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  ceo: 'CEO',
  manager: 'Manager',
  sav_agent: 'Agent SAV',
  sav_manager: 'Responsable SAV',
  dispatcher: 'Dispatcher',
  ops_manager: 'Responsable OPS',
  driver: 'Livreur',
  hub: 'Agent Hub',
  hub_manager: 'Responsable Hub',
  finance: 'Finance',
  ads_manager: 'Gestionnaire Ads',
  achats: 'Responsable Achats',
  stock_manager: 'Responsable Stock',
};

export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  super_admin: '/dashboard',
  ceo: '/dashboard',
  manager: '/dashboard',
  ops_manager: '/dashboard',
  sav_manager: '/orders',
  finance: '/finance/deposits',
  dispatcher: '/dispatch',
  hub: '/hub/deposits',
  hub_manager: '/hub/deposits',
  ads_manager: '/ads',
  achats: '/stock/products',
  stock_manager: '/stock/products',
  sav_agent: '/orders',
  driver: '/driver/deliveries',
};

// Rôles autorisés à gérer les commandes
export const CAN_MANAGE_ORDERS: UserRole[] = [
  'ceo', 'manager', 'sav_agent', 'sav_manager', 'super_admin'
];

// Rôles autorisés à dispatcher
export const CAN_DISPATCH: UserRole[] = [
  'ceo', 'manager', 'dispatcher', 'ops_manager', 'super_admin'
];

// Rôles Finance uniquement
export const FINANCE_ROLES: UserRole[] = [
  'ceo', 'finance', 'super_admin'
];

// Rôles manager+
export const MANAGER_ROLES: UserRole[] = [
  'ceo', 'manager', 'ops_manager', 'sav_manager', 'hub_manager',
  'finance', 'super_admin'
];

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isManagerOrAbove(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= 80;
}
