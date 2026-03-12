import * as yup from "yup";

export const createRoleSchema = yup.object({
  name: yup.string().trim().required("Role name is required"),
  description: yup.string().trim().optional().default(""),
  permissions: yup
    .array()
    .of(yup.string().required())
    .min(1, "Select at least one permission")
    .required("Permissions are required"),
});
