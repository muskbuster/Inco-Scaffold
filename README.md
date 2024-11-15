# Inco Scaffold 
Inco Scaffold is a fork of SE-2 modified to be compatible with INCO's FHE based stack.
### Prerequisites
Install yarn . To get started, create a `.env` file and set a BIP-39 compatible mnemonic as an environment variable.
```sh
cd packages/Hardhat
cp .env.example .env
```
Install the dependencies by running 
```sh
yarn install
```

### Development on Rivest Testnet

Run the pre-launch script to set up the environment:

```sh
sh pre-launch.sh
```

This generates necessary precompile ABI files. 

Compile contracts with Hardhat:

```sh
yarn compile
```

Deploy contracts on the Rivest network:

```sh
yarn deploy:contracts --network rivest
```

Run tests on the Rivest network:

```sh
yarn test:rivest
```
## Using nextJs template 

The nextJS template supports all functionalities offered by SE-2. [See Documentation](https://docs.scaffoldeth.io/).
The necessary details of contracts are directly written to the next template and can be invoked easily.

To start development server after initial setup, run command
```sh
yarn start
```
## Creating and Using FHEVMJS

### 1. Initial Setup

First, install the FHEVMJS package:
```bash
yarn add fhevmjs
```

### 2. FHEVM Instance Setup

Create a utility file for FHEVM instance management:

```typescript
// utils/fhevm/fhe-functions.js

import { createInstance, initFhevm } from "fhevmjs";

let fhevmInstance = null;

export const createFhevmInstance = async () => {
  if (!fhevmInstance) {
    // Initialize FHEVM
    await initFhevm();
    
    // Create instance with Rivest network configuration
    fhevmInstance = await createInstance({
      chainId: 21097,
      networkUrl: "https://validator.rivest.inco.org/",
      gatewayUrl: "https://gateway.rivest.inco.org/"
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
```

### 3. Context Provider Setup

Create a context provider to make FHEVM instance available throughout your application:

```typescript
// utils/fhevm/fhevm-context.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { getFhevmInstance } from "./fhe-functions";

const FhevmContext = createContext();

export const FhevmProvider = ({ children }) => {
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    const initializeFhevm = async () => {
      const fhevmInstance = await getFhevmInstance();
      setInstance(fhevmInstance);
    };
    
    initializeFhevm();
  }, []);

  return (
    <FhevmContext.Provider value={{ instance }}>
      {children}
    </FhevmContext.Provider>
  );
};

export const useFhevm = () => useContext(FhevmContext);
```

### 4. Application Wrapper

Wrap your application with the FHEVM provider:

```typescript
// utils/fhevm/fheWrapper.js

import { FhevmProvider } from "./fhevm-context";

export const FHEWrapper = ({ children }) => {
  return <FhevmProvider>{children}</FhevmProvider>;
};
```

### 5. Integration in Next.js

Add the wrapper to your app layout:

```typescript
// app/layout.tsx

import { FHEWrapper } from "~~/utils/fhevm/fheWrapper";

const ScaffoldEthApp = ({ children }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <FHEWrapper>
            {children}
          </FHEWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
```

## Creating Encrypted Inputs

### 1. Basic Encryption Structure

The encryption process involves creating an input instance and using type-specific encryption methods:

```typescript
const createEncryptedValue = async (value, type, contractAddress, userAddress) => {
  const instance = await getFhevmInstance();
  const inputInstance = instance.createEncryptedInput(contractAddress, userAddress);
  
  let encrypted;
  switch(type) {
    case 'uint4':
      encrypted = inputInstance.add4(Number(value)).encrypt();
      break;
    case 'uint8':
      encrypted = inputInstance.add8(Number(value)).encrypt();
      break;
    // ... other types
  }
  
  return {
    encryptedValue: "0x" + toHexString(encrypted.handles[0]),
    proof: "0x" + toHexString(encrypted.inputProof)
  };
};
```

### 2. Supported Data Types and Ranges

```typescript
const SUPPORTED_TYPES = {
  uint4: { max: 15, min: 0 },
  uint8: { max: 255, min: 0 },
  uint16: { max: 65535, min: 0 },
  uint32: { max: 4294967295, min: 0 },
  uint64: { max: BigInt("18446744073709551615"), min: 0 },
  uint128: { max: BigInt("340282366920938463463374607431768211455"), min: 0 },
  address: { pattern: /^0x[a-fA-F0-9]{40}$/ }
};
```

### 3. Creating a Reusable Encryption Component

```typescript
interface EncryptionProps {
  type: string;
  contractAddress: string;
  userAddress: string;
  onEncrypted: (result: { encrypted: string, proof: string }) => void;
}

const EncryptionInput: React.FC<EncryptionProps> = ({
  type,
  contractAddress,
  userAddress,
  onEncrypted
}) => {
  const { instance } = useFhevm();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleEncryption = async () => {
    try {
      const inputInstance = instance.createEncryptedInput(
        contractAddress,
        userAddress
      );

      let encrypted;
      if (type === "address") {
        if (!SUPPORTED_TYPES.address.pattern.test(value)) {
          throw new Error("Invalid Ethereum address");
        }
        encrypted = inputInstance.addAddress(value).encrypt();
      } else {
        const numValue = type.includes("uint") ? BigInt(value) : Number(value);
        const { min, max } = SUPPORTED_TYPES[type];
        
        if (numValue < min || numValue > max) {
          throw new Error(`Value must be between ${min} and ${max}`);
        }

        encrypted = inputInstance[`add${type.slice(4)}`](numValue).encrypt();
      }

      onEncrypted({
        encrypted: "0x" + toHexString(encrypted.handles[0]),
        proof: "0x" + toHexString(encrypted.inputProof)
      });
      
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <input
        type={type === "address" ? "text" : "number"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Enter ${type} value`}
      />
      <button onClick={handleEncryption}>Encrypt</button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};
```

### 4. Usage Example

```typescript
const MyComponent = () => {
  const handleEncrypted = ({ encrypted, proof }) => {
    console.log("Encrypted value:", encrypted);
    console.log("Proof:", proof);
    // Handle the encrypted value and proof
  };

  return (
    <EncryptionInput
      type="uint8"
      contractAddress="0xa5e1defb98EFe38EBb2D958CEe052410247F4c80" // this can varry according to your deployed contract
      userAddress="{/* Some User Address */}"
      onEncrypted={handleEncrypted}
    />
  );
};
```
