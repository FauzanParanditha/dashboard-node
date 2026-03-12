// export const tokenName = "dsbTkn";

export const jwtConfig = {
  user: {
    accessTokenExpiresIn: "7h",
    refreshTokenExpiresIn: "7d",
    accessTokenName: "_dsbTkn",
    refreshTokenName: "_rDsbTkn",
    roleName: "_dsbRole",
    roleIdName: "_dsbRoleId",
    permissionsName: "_dsbPerms",
    userIdName: "_dsbUserId",
  },
  admin: {
    accessTokenExpiresIn: "7h",
    refreshTokenExpiresIn: "7d",
    accessTokenName: "_aDsbTkn",
    refreshTokenName: "_arDsbTkn",
    roleName: "_aDsbRole",
    roleIdName: "_aDsbRoleId",
    permissionsName: "_aDsbPerms",
    adminIdName: "_aDsbAdminId",
    userIdName: "_aDsbUserId",
  },
};
