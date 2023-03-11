// The permissions context, which provides global state for permissions
import { createContext } from "react";

interface PermissionContextType {
  isAllowedTo: (permission: string) => boolean;
}

const defaultBehavior: PermissionContextType = {
  isAllowedTo: () => false,
};

export const PermissionContext =
  createContext<PermissionContextType>(defaultBehavior);

export default PermissionContext;
