import { useContext, useState } from "react";
import PermissionContext from "./PermissionContext";

const usePermission = (permission: string) => {
  const [allowed, setAllowed] = useState<boolean>();

  const { isAllowedTo } = useContext<any>(PermissionContext);

  isAllowedTo(permission).then((allowed: any) => {
    setAllowed(allowed);
  });
  return allowed;
};

export default usePermission;
