import { jwtConfig } from "./var";

export async function checkAuth(context: any) {
  const { req } = context;

  // Example: Fetch auth token from cookies
  const authToken = req.cookies[jwtConfig.user.accessTokenName];

  // If no token, redirect to login
  if (!authToken) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { authToken }, // Return any props required for the page
  };
}

export async function checkAuthAdmin(context: any) {
  const { req } = context;

  // Example: Fetch auth token from cookies
  const authToken = req.cookies[jwtConfig.admin.accessTokenName];

  // If no token, redirect to login
  if (!authToken) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { authToken }, // Return any props required for the page
  };
}
