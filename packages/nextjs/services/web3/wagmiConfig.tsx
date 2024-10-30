import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, defineChain, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export const incoNetwork = /*#__PURE__*/ defineChain({
  id: 21097,
  name: "Rivest Testnet",
  network: "Rivest",
  nativeCurrency: {
    name: "INCO",
    symbol: "INCO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://validator.rivest.inco.org"],
    },
    public: {
      http: ["https://testnet.inco.org/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.rivest.inco.org",
    },
  },
});

const { targetNetworks } = scaffoldConfig;

// Create a mutable array first
const mutableEnabledChains: Chain[] = [
  incoNetwork,
  ...targetNetworks.filter((network: Chain) => network.id !== incoNetwork.id),
];

// Ensure mainnet is included if it's not already in the list
if (!mutableEnabledChains.some((network: Chain) => network.id === 1)) {
  mutableEnabledChains.push(mainnet);
}

// Convert to readonly array and enforce at least one element with tuple typing
export const enabledChains = mutableEnabledChains as [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(chain.id === incoNetwork.id ? incoNetwork.rpcUrls.default.http[0] : getAlchemyHttpUrl(chain.id)),
      ...(chain.id !== (hardhat as Chain).id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});
