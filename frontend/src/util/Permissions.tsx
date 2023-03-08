// The permissions context, which provides global state for permissions

import { createContext } from "react";
import React, { useContext } from "react";

interface PermissionContextType {
  isAllowedTo: (permission: string) => boolean;
}

const defaultBehavior: PermissionContextType = {
  isAllowedTo: () => false,
};

export const PermissionContext =
  createContext<PermissionContextType>(defaultBehavior);

// Provide this context to the top level of the app (currently in index.tsx, will need
// to figure out how to do this properly)

type ProviderProps = {
  permissions: string[];
  children: React.ReactNode;
};

export function PermissionsProvider(props: ProviderProps) {
  const isAllowedTo = (permission: string) =>
    props.permissions.includes(permission);

  return (
    <PermissionContext.Provider value={{ isAllowedTo }}>
      {props.children}
    </PermissionContext.Provider>
  );
}

// Permissions Consumer - Surround any component with this to restrict access,
// if access is not provided, null will be returned

interface ConsumerProps {
  to: string;
  children: React.ReactNode;
}

function Restricted(props: ConsumerProps) {
  const { isAllowedTo } = useContext(PermissionContext);

  if (isAllowedTo(props.to)) {
    return <>{props.children}</>;
  }
  return null;
}

export default Restricted;
