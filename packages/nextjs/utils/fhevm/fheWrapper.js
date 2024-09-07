"use client";

import { FhevmProvider } from "~~/utils/fhevm/fhevm-context";

export const FHEWrapper = ({ children }) => {
  return <FhevmProvider>{children}</FhevmProvider>;
};
