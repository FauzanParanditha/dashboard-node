import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@ant-design/icons-svg",
    "rc-util",
    "rc-pagination",
    "rc-picker",
    "rc-input",
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.js$/,
      include: [
        /node_modules[\\/]rc-util/,
        /node_modules[\\/]@ant-design[\\/]icons-svg/,
        /node_modules[\\/]rc-pagination/,
        /node_modules[\\/]rc-picker/,
        /node_modules[\\/]rc-input/,
      ],
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    });
    return config;
  },
};

export default nextConfig;
