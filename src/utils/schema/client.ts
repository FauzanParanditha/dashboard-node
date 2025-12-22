import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

export const createClientSchema = yup.object().shape({
  name: yup.string().required("name is required"),
  notifyUrl: yup.string().url().optional(),
  userId: yup.string().required("userId is required"),
});

export const updateClientSchema = yup.object({
  name: yup.string().required("name is required"),
  notifyUrl: yup.string().url().optional(),
  userId: yup.string().required("userId is required"),
  active: yup.boolean().required("status is required"),
});
