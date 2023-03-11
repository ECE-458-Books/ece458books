import React from "react";
import PermissionContext from "./PermissionContext";

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
