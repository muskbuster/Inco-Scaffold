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
## Creating and using FHEVMJS

## Creating Encrypted inputs