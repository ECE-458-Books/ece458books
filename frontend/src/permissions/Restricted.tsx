import React, { useContext } from "react";
import PermissionContext from "./PermissionContext";

// Permissions Consumer - Surround any component with this to restrict access,
// if access is not provided, null will be returned

interface ConsumerProps {
  to: string;
  children: React.ReactNode;
}

export default function Restricted(props: ConsumerProps) {
  const { isAllowedTo } = useContext(PermissionContext);

  if (isAllowedTo(props.to)) {
    return <>{props.children}</>;
  }

  return null;
}
