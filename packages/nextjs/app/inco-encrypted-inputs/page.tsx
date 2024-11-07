"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { BellAlertIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { toHexString } from "~~/components/scaffold-eth";
import { useFhevm } from "~~/utils/fhevm/fhevm-context";

interface Group {
  controlId: string;
  inputLabel: string;
  outputLabel: string;
  maxValue: number | string;
  inputType: string;
}

const groups: Group[] = [
  { controlId: "uint4", inputLabel: "Uint 4", outputLabel: "ciphertext", maxValue: 15, inputType: "number" },
  { controlId: "uint8", inputLabel: "Uint 8", outputLabel: "ciphertext", maxValue: 255, inputType: "number" },
  { controlId: "uint16", inputLabel: "Uint 16", outputLabel: "ciphertext", maxValue: 65535, inputType: "number" },
  { controlId: "uint32", inputLabel: "Uint 32", outputLabel: "ciphertext", maxValue: 4294967295, inputType: "number" },
  {
    controlId: "uint64",
    inputLabel: "Uint 64",
    outputLabel: "ciphertext",
    maxValue: "18446744073709551615",
    inputType: "number",
  },
  {
    controlId: "uint128",
    inputLabel: "Uint 128",
    outputLabel: "ciphertext",
    maxValue: "340282366920938463463374607431768211455",
    inputType: "number",
  },
  { controlId: "address", inputLabel: "Address", outputLabel: "ciphertext", maxValue: "", inputType: "text" },
];

interface GroupInputProps {
  group: Group;
  fhEVM: any;
}

const GroupInput: React.FC<GroupInputProps> = ({ group, fhEVM }) => {
  const { controlId, inputLabel, maxValue, inputType } = group;
  const [value, setValue] = useState<string>("");
  const [encryptedValue, setEncryptedValue] = useState<string>("");
  const [inputProof, setInputProof] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedProof, setCopiedProof] = useState<boolean>(false);
  const { address } = useAccount();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setError("");

    if (controlId !== "address") {
      const numValue = Number(newValue);
      if (numValue < 0 || numValue > Number(maxValue)) {
        setError(`Value must be between 0 and ${maxValue}`);
        setEncryptedValue("");
        setInputProof("");
        return;
      }
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(newValue)) {
      setError("Invalid Ethereum address");
      setEncryptedValue("");
      return;
    }

    try {
      const inputInstance = fhEVM.createEncryptedInput(
        "0xa5e1defb98EFe38EBb2D958CEe052410247F4c80", // contract address
        address, // user address
      );

      let encrypted;
      switch (controlId) {
        case "uint4":
          encrypted = inputInstance.add4(Number(newValue)).encrypt();
          break;
        case "uint8":
          encrypted = inputInstance.add8(Number(newValue)).encrypt();
          break;
        case "uint16":
          encrypted = inputInstance.add16(Number(newValue)).encrypt();
          break;
        case "uint32":
          encrypted = inputInstance.add32(Number(newValue)).encrypt();
          break;
        case "uint64":
          encrypted = inputInstance.add64(BigInt(newValue)).encrypt();
          break;
        case "uint128":
          encrypted = inputInstance.add128(BigInt(newValue)).encrypt();
          break;
        case "address":
          encrypted = inputInstance.addAddress(newValue).encrypt();
          break;
        default:
          throw new Error("Unsupported type");
      }
      setEncryptedValue("0x" + toHexString(encrypted.handles[0]));
      setInputProof("0x" + toHexString(encrypted.inputProof));
    } catch (err) {
      console.error(err);
      setError("An error occurred during encryption");
      setEncryptedValue("");
      setInputProof("");
    }
  };

  const handleCopy = (value: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(value);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-blue-300">{inputLabel} Encryption</h3>
      <div className="mb-4">
        <label htmlFor={`${controlId}-input`} className="block mb-2 text-sm font-medium text-gray-300">
          Input Value
        </label>
        <input
          id={`${controlId}-input`}
          placeholder={controlId === "address" ? "Enter Ethereum address" : `Enter a value (0-${maxValue})`}
          type={inputType}
          value={value}
          onChange={handleInputChange}
          className={`w-full bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-600"
          }`}
        />
        {error && (
          <div className="mt-2 flex items-center text-red-500">
            <BellAlertIcon className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor={`${controlId}-output`} className="block mb-2 text-sm font-medium text-gray-300">
          Encrypted Output
        </label>
        <div className="flex items-center">
          <input
            id={`${controlId}-output`}
            type="text"
            value={encryptedValue}
            readOnly
            className="flex-grow bg-gray-700 text-white rounded-l-md p-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleCopy(encryptedValue, setCopied)}
            className={`p-2 rounded-r-md transition-colors ${
              copied ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ClipboardIcon className="h-5 w-5 text-white" />
          </button>
        </div>
        {copied && <p className="mt-1 text-sm text-green-400">Copied to clipboard!</p>}
      </div>

      <div className="mb-4">
        <label htmlFor={`${controlId}-input-proof`} className="block mb-2 text-sm font-medium text-gray-300">
          Input Proof
        </label>
        <div className="flex items-center">
          <input
            id={`${controlId}-input-proof`}
            type="text"
            value={inputProof}
            readOnly
            className="flex-grow bg-gray-700 text-white rounded-l-md p-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleCopy(inputProof, setCopiedProof)}
            className={`p-2 rounded-r-md transition-colors ${
              copiedProof ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ClipboardIcon className="h-5 w-5 text-white" />
          </button>
        </div>
        {copiedProof && <p className="mt-1 text-sm text-green-400">Input Proof copied to clipboard!</p>}
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { instance } = useFhevm();

  return (
    <main className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Comprehensive FHEVM Encryption Demo</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {instance && groups.map(group => <GroupInput key={group.controlId} group={group} fhEVM={instance} />)}
        </div>
      </div>
    </main>
  );
};

export default Home;
