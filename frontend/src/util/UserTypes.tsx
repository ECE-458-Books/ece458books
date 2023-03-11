export interface AccessType {
  userType: string;
  permissions: string[];
}

export const noRights: AccessType = {
  userType: "No Rights",
  permissions: [],
};

export const user: AccessType = {
  userType: "User",
  permissions: [],
};

//list is not used by any component as a restriction.
//Placed for restricing of list components
export const administrator: AccessType = {
  userType: "Administrator",
  permissions: ["list", "add", "delete", "modify"],
};
