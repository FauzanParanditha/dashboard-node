import * as yup from "yup";

// Define a custom regex for IPv4 validation
const ipv4Regex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export const ipValidator = yup.object().shape({
  ipAddress: yup
    .string()
    .matches(ipv4Regex, "Invalid IPv4 address")
    .required("IP address is required"),
});
