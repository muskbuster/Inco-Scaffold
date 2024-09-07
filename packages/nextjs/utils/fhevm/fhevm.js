// Not used anywhere just for reference
// Not used anywhere just for reference
// Not used anywhere just for reference
// Not used anywhere just for reference
// Not used anywhere just for reference
// Not used anywhere just for reference

import { JsonRpcProvider } from "ethers";
import { AbiCoder, BrowserProvider } from "ethers";
import { createInstance, initFhevm } from "fhevmjs";

export const init = async () => {
  await initFhevm();
};

// export const provider = new JsonRpcProvider("http://localhost:8545", {
//   chainId: 9000,
//   name: "Inco Gentry Testnet",
// });
export const provider = new JsonRpcProvider("https://testnet.inco.org", {
  chainId: 9090,
  name: "Inco Gentry Testnet",
});

// const FHE_LIB_ADDRESS = "0x000000000000000000000000000000000000005d";
let instance;

export const createFhevmInstance = async () => {
  initFhevm().then(async () => {
    const instance = await createInstance({
      chainId: 8009,
      networkUrl: "https://devnet.zama.ai/",
      gatewayUrl: "https://gateway.zama.ai/",
    });

    console.log(instance);
  });
};

export const getInstance = async () => {
  await init();
  const inst = await createFhevmInstance();
  return inst;
};

export const getTokenSignature = async (contractAddress, userAddress, provider) => {
  const eip712Domain = {
    // This defines the network, in this case, Gentry Testnet.
    chainId: 9090,
    // Give a user-friendly name to the specific contract you're signing for.
    // MUST match the string in contract constructor (EIP712Modifier).
    name: "Authorization token",
    // // Add a verifying contract to make sure you're establishing contracts with the proper entity.
    verifyingContract: contractAddress,
    // This identifies the latest version.
    // MUST match the version in contract constructor (EIP712Modifier).
    version: "1",
  };

  const reencryption = instance.generatePublicKey(eip712Domain);

  const signature = await provider.signTypedData(
    reencryption.eip712.domain,
    { Reencrypt: reencryption.eip712.types.Reencrypt },
    reencryption.eip712.message,
  );
  instance.setSignature(contractAddress, signature);

  const publicKey = instance.getPublicKey(contractAddress).publicKey;
  return { signature, publicKey };
};

export const getSignature = async (contractAddress, userAddress, chainId) => {
  if (!instance) {
    await getInstance();
  }
  if (instance.hasKeypair(contractAddress)) {
    return instance.getPublicKey(contractAddress);
  } else {
    const { publicKey, eip712 } = instance.generatePublicKey({
      chainId: chainId,
      name: "Authorization token",
      version: "1",
      verifyingContract: contractAddress,
    });
    const params = [userAddress, JSON.stringify(eip712)];
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params,
    });
    instance.setSignature(contractAddress, signature);
    return { signature, publicKey };
  }
};
