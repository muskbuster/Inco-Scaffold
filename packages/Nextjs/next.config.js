/** @type {import('next').NextConfig} */
module.exports = {
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "tfhe_bg.wasm": require.resolve("tfhe/tfhe_bg.wasm"),
      };
      return config;
    },
  };