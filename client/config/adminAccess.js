export const ADMIN_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
};

export const ADMIN_DEFAULT_PATHS = {
  [ADMIN_ROLES.ADMIN]: "/admin/dashboard",
  [ADMIN_ROLES.MODERATOR]: "/admin/reviews",
};

const ADMIN_ROUTE_ACCESS = [
  { path: "/admin/dashboard", roles: [ADMIN_ROLES.ADMIN] },
  { path: "/admin/products", roles: [ADMIN_ROLES.ADMIN] },
  { path: "/admin/categories", roles: [ADMIN_ROLES.ADMIN] },
  { path: "/admin/orders", roles: [ADMIN_ROLES.ADMIN] },
  {
    path: "/admin/reviews",
    roles: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR],
  },
  {
    path: "/admin/customers",
    roles: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR],
  },
];

const parseStoredJson = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64Payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalizedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "=",
    );
    const decodedPayload = atob(normalizedPayload);

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

export const getStoredAdminUser = () => {
  const storedUser = parseStoredJson(localStorage.getItem("adminUser"));

  if (storedUser?.role) {
    return storedUser;
  }

  return decodeJwtPayload(localStorage.getItem("adminToken"));
};

export const getStoredAdminRole = () => getStoredAdminUser()?.role || "";

export const isKnownAdminRole = (role) =>
  role === ADMIN_ROLES.ADMIN || role === ADMIN_ROLES.MODERATOR;

export const getDefaultAdminPath = (role) =>
  ADMIN_DEFAULT_PATHS[role] || "/admin/login";

export const isAdminPathAllowed = (pathname, role) => {
  if (!isKnownAdminRole(role)) return false;
  if (pathname === "/admin") return true;

  const routeAccess = ADMIN_ROUTE_ACCESS.find(({ path }) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  return Boolean(routeAccess?.roles.includes(role));
};

export const getAdminNavigationItems = (role) =>
  ADMIN_ROUTE_ACCESS.filter(({ roles }) => roles.includes(role));

export const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};
