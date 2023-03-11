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

export const administrator: AccessType = {
  userType: "Administrator",
  permissions: ["list", "add", "delete", "modify"],
};
