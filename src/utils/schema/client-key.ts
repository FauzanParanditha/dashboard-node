import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

export const createClientKeySchema = yup.object().shape({
  clientId: yup.string().required("client key is required"),
  publicKey: yup.string().required("public key is required"),
  active: yup.boolean().required("status is required"),
});

export const updateClientKeySchema = yup.object({
  clientId: yup.string().required("client key  is required"),
  publicKey: yup.string().required("public key is required"),
  active: yup.boolean().required("status is required"),
});
