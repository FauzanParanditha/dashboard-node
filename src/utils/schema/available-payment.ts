import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

export const createAvailablePaymentSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  image: yup
    .mixed<File>()
    .nullable()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true; // Allow null or undefined
      return (
        value instanceof File &&
        ["image/jpeg", "image/png"].includes(value.type)
      );
    }),
  category: yup.string().required("Category is required"),
  active: yup.boolean().required("Active status is required"),
});

export const updateAvailablePaymentSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  image: yup
    .mixed<File>()
    .nullable()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true; // Allow null or undefined
      return (
        value instanceof File &&
        ["image/jpeg", "image/png"].includes(value.type)
      );
    }),
  category: yup.string().required("Category is required"),
  adminId: yup.string().required("Admin ID is required"),
  active: yup.boolean().required("Active status is required"),
});
