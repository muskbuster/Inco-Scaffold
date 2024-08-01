
## FEATURES

### Contract Section
Built using Hardhat-Ts
| Feature | Available |
| :---: | :---: |
| Build Contract |  ✅|
| Format Contract |  |
| Run custom scripts | ✅ |
| Deploy Contract | ✅ |
| Devnet spin up |  |
| Burner wallets for debugging |  |
| gentry faucet |  |
| TFHE wiki |  |
| Slither SA|  |
| Subgraph setup| |

### UI Section
Built using Nextjs , ethersjs ,fhevmjs and typescript

| Feature | Available |
| :---: | :---: |
| Connect button & Custom Wallet Modal | ✅ |
|fhEVM instance |✅ |
| Encryption and Reencryption flow | ✅ |
| Address bar  |  |
| modal to copy/disconnect/view account |  |
| Display account balance |  |
| Switch/display network |  |
| App Light/Dark mode |  |
| Burner wallet UI|  |
| Read Contract Hook | |
|Write contract Hook| |


### Template Smart Contracts 
| Feature | Available |
| :---: | :---: |
| Confidential Governance | |
| Confidential ERC20 |✅ |
| Blind Vault | |
| FHE-Casino Contracts | ✅ |
| RNG contract | |

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`
- Edit your smart contract test in: `packages/hardhat/test`. To run test use `yarn hardhat:test`

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
