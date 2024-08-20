import { ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { initFhevm, createInstance } from "fhevmjs";
export const init = async () => {
  await initFhevm();
};

// TFHE.sol contract address
// From https://github.com/zama-ai/fhevmjs/blob/c4b8a80a8783ef965973283362221e365a193b76/bin/fhevm.js#L9
const FHE_LIB_ADDRESS = "0x000000000000000000000000000000000000005d";

export const provider = new ethers.providers.JsonRpcProvider(
  "https://testnet.inco.org",
  {
    chainId: 9090,
    name: "Inco Gentry Testnet",
  }
);

export const createFhevmInstance = async () => {
  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString();
  // Get blockchain public key
  const ret = await provider.call({
    to: FHE_LIB_ADDRESS,
    // first four bytes of keccak256('fhePubKey(bytes1)') + 1 byte for library
    data: "0xd9d47bb001",
  });
  const decoded = defaultAbiCoder.decode(["bytes"], ret);
  const publicKey = decoded[0];
  // console.log(publicKey)
  const instance = await createInstance({ chainId, publicKey });
  console.log("created instance");
  return instance;
};

export const getInstance = async () => {
  await init();
  const instance = await createFhevmInstance();
  return instance;
};

export const getTokenSignature = async (contractAddress, signer) => {
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
  const instance = await getInstance();

  const reencryption = instance.generatePublicKey(eip712Domain);

  const signature = await signer._signTypedData(
    reencryption.eip712.domain,
    { Reencrypt: reencryption.eip712.types.Reencrypt },
    reencryption.eip712.message
  );
  instance.setSignature(contractAddress, signature);

  const publicKey = instance.getPublicKey(contractAddress).publicKey;
  return { signature, publicKey };
};

export const getSignature = async (contractAddress, userAddress, instance) => {
  // const instance = await getInstance();
  if (instance.hasKeypair(contractAddress)) {
    return instance.getPublicKey(contractAddress);
  } else {
    const { publicKey, eip712 } = instance.generatePublicKey({
      chainId: 9090,
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
