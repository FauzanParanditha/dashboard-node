import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

export const loginValidator = yup.object().shape({
  email: yup.string().required().email("email is not valid"),
  password: yup.string().required(),
});

export const logoutValidator = yup.object().shape({
  email: yup.string().required().email("email is not valid"),
});

export const createAdminSchema = yup.object().shape({
  email: yup.string().required().email("email is not valid"),
  fullName: yup.string().required("fullName is required"),
  password: yup
    .string()
    .min(8, "min 8 character")
    .minLowercase(1, "password must contain at least 1 lower case letter")
    .minUppercase(1, "password must contain at least 1 upper case letter")
    .minNumbers(1, "password must contain at least 1 number")
    .minSymbols(1, "password must contain at least 1 special character")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "password not same"),
});

export const updateAdminSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Format is not valid")
    .required("Email is required"),
  verified: yup
    .boolean()
    .required("Status is required")
    .oneOf([true, false], "Field must be checked"),
});

export const updatePasswordSchema = yup.object({
  email: yup.string().required("email is required"),
  old_password: yup.string().required("Old password is required!"),
  new_password: yup
    .string()
    .min(8, "min 8 character")
    .minLowercase(1, "password must contain at least 1 lower case letter")
    .minUppercase(1, "password must contain at least 1 upper case letter")
    .minNumbers(1, "password must contain at least 1 number")
    .minSymbols(1, "password must contain at least 1 special character")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("new_password")], "password not same"),
  userId: yup.string().optional(),
});
