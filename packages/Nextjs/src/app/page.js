"use client";
import Loader from "@/components/loader";
import Login from "@/components/login";
import { Input } from "@/components/ui/input";
import { getInstance } from "@/utils/fhEVM";
import { toHexString } from "@/utils/utils";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const groups = [
  {
    controlId: "uint8",
    inputLabel: "Uint 8",
    outputLabel: "ciphertext",
    encryptFn: (instance) => instance.encrypt8,
  },
  {
    controlId: "uint16",
    inputLabel: "Uint 16",
    outputLabel: "ciphertext",
    encryptFn: (instance) => instance.encrypt16,
  },
  {
    controlId: "uint32",
    inputLabel: "Uint 32",
    outputLabel: "ciphertext",
    encryptFn: (instance) => instance.encrypt32,
  },
];

const GroupInput = ({ group, fhEVM }) => {
  const { controlId, inputLabel, outputLabel, encryptFn } = group;
  const [value, setValue] = useState(0);
  const [encryptedValue, setEncryptedValue] = useState("");

  useEffect(() => {
    if (fhEVM) {
      setEncryptedValue("0x" + toHexString(encryptFn(fhEVM)(Number(value))));
    }
  }, [value, fhEVM, encryptFn]);

  return (
    <div className="flex flex-col mb-4">
      <div className="mb-5 grid gap-3">
        <label
          htmlFor={`${controlId}-input`}
          className="block mb-2 text-sm font-bold"
        >
          {inputLabel}
        </label>
        <Input
          id={`${controlId}-input`}
          placeholder={`${inputLabel}`}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-2xl"
        />
      </div>
      <div className="mb-4 grid gap-3">
        <label
          htmlFor={`${controlId}-output`}
          className="block mb-2 text-sm font-bold"
        >
          Cipher Text
        </label>
        <div className="flex items-center gap-2">
          <Input
            id={`${controlId}-output`}
            type="text"
            value={encryptedValue}
            readOnly
            className="rounded-2xl"
          />
          <div
            className="bg-[#3673F5] rounded-lg"
            onClick={() => {
              try {
                navigator.clipboard.writeText(encryptedValue);
                toast.success("Copied to clipboard");
              } catch (error) {
                console.log(error);
                toast.error("Error copying to clipboard");
              }
            }}
          >
            <Image
              width={40}
              height={40}
              src="/copy.svg"
              className="p-3 cursor-pointer text-white rounded-lg"
              alt="copy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const [fhEVM, setFhEVM] = useState(null);

  useEffect(() => {
    const getFHEVMInstance = async () => {
      const fhevmInstance = await getInstance();
      setFhEVM(fhevmInstance);
    };
    getFHEVMInstance();
  }, []);
  if (!ready) {
    return (
      <div className="mt-32 w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <main className="">
      {authenticated ? (
        <div className="py-6 grid place-items-center p-4 md:p-0">
          <div className="max-w-6xl w-full grid gap-x-20 md:grid-cols-2 mt-6 md:mt-12">
            {groups.map((group, index) => (
              <div className={`${index === 2 ? "col-span-2" : ""}`} key={index}>
                <GroupInput key={group.controlId} group={group} fhEVM={fhEVM} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Login />
      )}
    </main>
  );
}
