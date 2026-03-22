import type { Role } from "@prisma/client";

import { ROLE_ORDER } from "@/lib/constants";

export function hasRole(userRole: Role, requiredRole: Role) {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(requiredRole);
}

export function canManage(role: Role) {
  return hasRole(role, "MANAGER");
}

export function canAdmin(role: Role) {
  return hasRole(role, "ADMIN");
}

export function canAccessPath(pathname: string, role: Role) {
  const managerPaths = [
    "/sales/customers/new",
    "/sales/deals/new",
    "/projects/new",
    "/finance/approvals",
    "/finance/summary",
    "/hr/departments"
  ];

  if (managerPaths.some((path) => pathname.startsWith(path))) {
    return canManage(role);
  }

  if (
    pathname.match(/^\/sales\/customers\/[^/]+\/edit$/) ||
    pathname.match(/^\/sales\/deals\/[^/]+\/edit$/) ||
    pathname.match(/^\/projects\/[^/]+\/edit$/) ||
    pathname.match(/^\/hr\/employees\/[^/]+$/)
  ) {
    return canManage(role);
  }

  if (
    pathname === "/hr/employees/new" ||
    pathname.match(/^\/hr\/employees\/[^/]+\/edit$/)
  ) {
    return canAdmin(role);
  }

  return true;
}
