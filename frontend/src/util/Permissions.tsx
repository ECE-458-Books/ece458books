// PERMISSIONS CONTEXT

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

// PERMISSIONS PROVIDER

type ProviderProps = {
  permissions: string[];
  children: React.ReactNode;
};

export function PermissionsProvider(props: ProviderProps) {
  const isAllowedTo = (permission: string) => permission.includes(permission);

  return (
    <PermissionContext.Provider value={{ isAllowedTo }}>
      {props.children}
    </PermissionContext.Provider>
  );
}

// PERMISSIONS CONSUMER

interface ConsumerProps {
  to: string;
  children: React.ReactNode;
}

// This component is meant to be used everywhere a restriction based on user permission is needed
function Restricted(props: ConsumerProps) {
  // We "connect" to the provider thanks to the PermissionContext
  const { isAllowedTo } = useContext(PermissionContext);

  // If the user has that permission, render the children
  if (isAllowedTo(props.to)) {
    return <>{props.children}</>;
  }

  // Otherwise, do not render anything
  return null;
}

export default Restricted;
