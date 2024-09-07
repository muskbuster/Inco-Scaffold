import { createInstance, initFhevm } from "fhevmjs";

let fhevmInstance = null;

export const createFhevmInstance = async () => {
  if (!fhevmInstance) {
    await initFhevm();
    fhevmInstance = await createInstance({
      chainId: 8009,
      networkUrl: "https://devnet.zama.ai/",
      gatewayUrl: "https://gateway.zama.ai/",
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
