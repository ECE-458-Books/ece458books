import React from "react";
import PermissionContext from "./PermissionContext";

// Provide this context to the top level of the app (currently in index.tsx, will need
// to figure out how to do this properly)

type ProviderProps = {
  permissions: string[];
  children: React.ReactNode;
};

export default function PermissionProvider(props: ProviderProps) {
  const isAllowedTo = (permission: string): boolean => {
    return props.permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider value={{ isAllowedTo }}>
      {props.children}
    </PermissionContext.Provider>
  );
}
