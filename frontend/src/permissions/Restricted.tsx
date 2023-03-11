import React from "react";
import usePermission from "./PermissionUse";

// Permissions Consumer - Surround any component with this to restrict access,
// if access is not provided, null will be returned

interface ConsumerProps {
  to: string;
  children: React.ReactNode;
}

export default function Restricted(props: ConsumerProps) {
  // We "connect" to the provider thanks to the PermissionContext
  //const allowed = usePermission(props.to);

  // If the user has that permission, render the children
  // if (allowed) {
  //   return <>{props.children}</>;
  // }

  return null;
}
