# Demo dApps for Polymer by yurakas97

This project uses ERC20, and ERC721 token standards, oppenZeppelin lib. and custom solydity smart-contracts.

**The key idea** is to mint the original NFT based on randomly gotten jokes on the Optimism network, and write that joke as metadata of the NFT. Then user could bridge the NFT to the BASE network through IBC channel. The process of bridging means sending a packet with the user's wallet address, and joke as a string (from saved mapping in a smart contract by token ID)  to the BASE and automatically minting(after the packet receiving) a new NFT with the same metadata, while the original one is burnt. 


**Proof of ineraction**:

EVM wallet address: ```0x633DCc2b348D0343B8071ced530E3c32171Ce2B9```. 

Optimism Smart-contract: ```0xeAe53b9b8d181b87DA0B4F6393D87a9DE62c2177```.

BASE Smark-contract: ```0xa5C4D0F9697f5f36dc04928B254ac81A932C5daE```

tx of channel creating: https://optimism-sepolia.blockscout.com/tx/0x22092580a5e741a58f00fd8d77865256810c81f574bffeb7238257926b9f47aa

tx of packet sending: https://optimism-sepolia.blockscout.com/tx/0xe1222259990140361b1e29c08920b35ed529912081d3e786e8e7e2116c486a19?tab=index

tx of minting NFT on BASE: https://base-sepolia.blockscout.com/tx/0x0153400ab47fc4faa5bf1bd41a72b23e87a751f46ca3ab485fd753cc9f3c3e7e

IBC channel: ```38028(Op)``` and ```38029(BASE)```

Video: https://youtu.be/x7wLKytRFLc?si=eiMy3pq7zmrzPHDM


## How to interact?

**The site:** https://yurakas97.github.io/site/


**You can test it and enjoy it!!!**

Check that IBC transfer and new NFT mint(on BASE) were successful you can by your address in BASE explorer) 

The only thing to do. Due to my local server not having an HTTPS certificate yet, users need to allow their browser to send requests to "unsecured" sources to initialize the bridging process. They need to paste this in the browser ```chrome://flags/#unsafely-treat-insecure-origin-as-secure``` and add server address ```http://213.111.123.79:3000``` then turn it to "Enabled". That's it, now browser isn't going to block the user's requests to the server. And it should work as intended. 

## 📚 Documentation

This repository is forked from [the IBC app template repo](https://open-ibc/ibc-app-solidity-template) so check it out if you haven't or find its docs [here](ibc-app-template.md).

There's some basic information here in the README but all of the dApps found here are documented more extensively in [the official Polymer documentation](https://docs.polymerlabs.org/docs/quickstart/start).

## 📋 Prerequisites

The demo dapps repository has been based on the project structure found in the [IBC app template for Solidity](https://github.com/open-ibc/ibc-app-solidity-template) so it has the same requirements:

- Have [git](https://git-scm.com/downloads) installed
- Have [node](https://nodejs.org) installed (v18+)
- Have [Foundry](https://book.getfoundry.sh/getting-started/installation) installed (Hardhat will be installed when running `npm install`)
- Have [just](https://just.systems/man/en/chapter_1.html) installed (recommended but not strictly necessary)

Some basic knowledge of all of these tools is also required, although the details are abstracted away for basic usage.

## 🧱 Repository Structure

This repository has a project structure that set it up to be compatible with the Hardhat and Foundry EVM development environments, as in the [IBC app template for Solidity repo](https://github.com/open-ibc/ibc-app-solidity-template). 

The main logic specific to the dApps can be found in the `/contracts` directory:

# Example tree structure with only one custom dApp, joke-nft
```
contracts
├── base
│   ├── CustomChanIbcApp.sol
│   ├── GeneralMiddleware.sol
│   └── UniversalChanIbcApp.sol
├── jokes
│   ├── BaseContract.sol
│   └── OptContract.sol
└── arguments.js
``` 

## 🦮 Dependency management

This repo depends on Polymer's [vibc-core-smart-contracts](https://github.com/open-ibc/vibc-core-smart-contracts) which are tracked as git submodules. 

There are two ways to install these dependencies.

### Using IBC app template just recipe

If you have Node and Foundry installed, simply run:
```bash
just install
```

To install the required dependencies.

### Using git submodules directly

If you prefer not to use Foundry / Forge, you can use git submodules directly.

After cloning the repo, run this command additionally:
```bash
git submodule update --init --recursive
```

Find more documentation on using git submodules from the [official docs](https://git-scm.com/book/en/v2/Git-Tools-Submodules) or [in this tutorial](https://www.atlassian.com/git/tutorials/git-submodule).

Also run `npm install` additionally.

## 💻 Interacting with demos

To interact with any of the demos, there's a couple of things to do. (Assuming the dependencies have been installed).

1. Convert the `.env.example` file into an `.env` file. This will ignore the file for future git commits as well as expose the environment variables. Add your private keys and update the other values if you want to customize (advanced usage feature).

2. Check out the configuration file; `config.json` or the alternate configs in the `/config` directory. Depending on which application you'll want to interact with, update the contract type in the `deploy` field to the desired contract (use the `just set-contracts` recipe for that).

3. Once the configuration file is updated and saved, you can look at the `just` commands with `just --list`.

## 💻 How to run

1. Place this repo on the local server with the required dependencies installed. And run the next commands in the CLI.
2. ```cp .env.example .env``` set up private keys and APIs, then
3. ```CONFIG_PATH='config/jokes-config.json' ```  
4. ```nvm use 20```
5. ```just set-contracts optimism OptContract``` and
6. ```just set-contracts base BaseContract false```
7. ```just deploy optimism base``` to deploy
8. ```just create-channel``` to create a custom IBC channel
9. run the live server of the ```interface/index.html``` to start the UI/UX interface
10. ```node app.js``` runs a local server that listens to requests from the web page and sends packets through IBC. 

