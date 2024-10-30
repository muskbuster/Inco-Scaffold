import { createInstance, initFhevm } from "fhevmjs";

let fhevmInstance = null;

export const createFhevmInstance = async () => {
  if (!fhevmInstance) {
    await initFhevm();
    fhevmInstance = await createInstance({
      chainId: 21097,
      networkUrl: "https://validator.rivest.inco.org/",
      gatewayUrl: "https://gateway.rivest.inco.org/",
    });
  }
  return fhevmInstance;
};

export const getFhevmInstance = async () => {
  if (!fhevmInstance) {
    fhevmInstance = await createFhevmInstance();
  }
  return fhevmInstance;
};
