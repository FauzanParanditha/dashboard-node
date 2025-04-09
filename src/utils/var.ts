// export const tokenName = "dsbTkn";

export const jwtConfig = {
  user: {
    accessTokenExpiresIn: "7h",
    refreshTokenExpiresIn: "7d",
    accessTokenName: "_dsbTkn",
    refreshTokenName: "_rDsbTkn",
  },
  admin: {
    accessTokenExpiresIn: "7h",
    refreshTokenExpiresIn: "7d",
    accessTokenName: "_aDsbTkn",
    refreshTokenName: "_arDsbTkn",
  },
};
