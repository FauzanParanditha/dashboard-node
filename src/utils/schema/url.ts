import * as yup from "yup";

// Define a Yup schema for validation
export const nextUrlSchema = yup
  .string()
  .trim() // Removes unnecessary whitespace
  .matches(/^\/[a-zA-Z0-9/_-]*$/, "Invalid path") // Allow only internal paths
  .default("/"); // Fallback to homepage if `next` is not provided
