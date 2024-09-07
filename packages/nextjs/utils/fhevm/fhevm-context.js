import { createContext, useContext, useEffect, useState } from "react";
import { getFhevmInstance } from "./fhe-functions";

const FhevmContext = createContext();

export const FhevmProvider = ({ children }) => {
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstance = async () => {
      try {
        const fhevmInstance = await getFhevmInstance();
        setInstance(fhevmInstance);
        console.log("Instance created!!");
      } catch (error) {
        console.error("Failed to load FHEVM instance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstance();
  }, []);

  return <FhevmContext.Provider value={{ instance, loading }}>{children}</FhevmContext.Provider>;
};

export const useFhevm = () => useContext(FhevmContext);
