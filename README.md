# PIT Phase 1 repo project: Cross-chain give GIFTs
- This repository is created to enter the PIT phase 1 challenge # 19
- Live demo: https://gift.tuananh.xyz

## Team Members

@Gpaul26 - Team Leader

@pctsvn - Developer

@chienmaidinh - Developer

@TuanAnh1196 -  Developer

@hunteran - Developer

## Description

XGift is a decentralized application (dApp) that provides a new way to send and receive gifts in the form of gifs and ETH. Designed with application-specific chaining and scrolling properties, XGift allows users to create gift links on the Base Sepolia network, which can then be claimed on the OP Sepolia network, receiving ETH gifts as part of the claims process.

This DApp uses Polymer x IBC as the cross-chain format to seamlessly connect the two networks, ensuring a smooth and intuitive user experience. Whether you're new to the Base network or a seasoned OP user, XGift provides an engaging and rewarding way to explore the possibilities of both chains.


Features:

- Use Polymer x IBC as the cross-chain format.
- Committing to the ethos of application-specific chains/rollups, where gif creation functionality can be specialized on one chain, and gif claiming on another chain.

## Resources used

The repo uses the [ibc-app-solidity-template](https://github.com/open-ibc/ibc-app-solidity-template) as starting point and adds custom contracts XGiftVault and XGift that implement the custom logic.

It changes the send-packet.js script slightly to adjust to the custom logic.

The expected behaviour from the template should still work but nevertheless we quickly review the steps for the user to test the application...
Run `just --list` for a full overview of the just commands.

Additional resources used:
- Hardhat
- Blockscout
- Tenderly

## Steps to reproduce

After cloning the repo, install dependencies:

```sh
just install
```

And add your private key to the .env file (rename it from .env.example).

Then make sure that the config has the right contracts:
```sh
just set-contracts optimism XGift false && just set-contracts base XGiftVault false
```

> Note: The order matters here! Make sure to have the exact configuration

Check if the contracts compile:
```sh
just compile
```
### Deployment and creating channels (optional)

Then you can deploy the contract if you want to have a custom version, but you can use the provided contract addresses that are prefilled in the config. If using the default, you can skip to the step to send packets.

If you want to deploy your own, run:
```sh
just deploy optimism base
```
and create a channel:
```sh
just create-channel
```

### Create a gift

```bash
just create-gift-link base
```

### Check list gift by receiver address

```bash
just list-gift optimism
```

###  Claim gift

> Please pick gift id in list gifts and edit receiver address in file ``scripts/gift/claim-gif.js``

```bash
just claim-gift optimism
```


## Proof of testnet interaction

After following the steps above you should have interacted with the testnet. You can check this at the [IBC Explorer](https://sepolia.polymer.zone/packets).

Here's the data of our application:

- XGiftValue (Base Sepolia) : 0x6101c78e408B1e63ac7a9519054c6564Da758467
- XGift (OP Sepolia): 0xdC828bf7a839Abef63A9bd4a436E8E432DEadea2
- Channel (OP Sepolia): channel-39944
- Channel (Base Sepolia): channel-39945

- Proof of Create Gift:
    - [SendTx](https://base-sepolia.blockscout.com/tx/0xaefc6889a7fa948b9ee6d613b7273cef97f30e57d65d8777f70df861d5e70579)
    - [RecvTx](https://optimism-sepolia.blockscout.com/tx/0x6b8914d75a2ecf6a7180c7bd9e767117cdfc59a111573dcbcbefaa9b057894a7)
    - [Ack](https://base-sepolia.blockscout.com/tx/0xffa582fc1b1b474a11f23846b490f43e47eed7913d77b862270e9bd12c1091a0)

- Proof of Claim Gift:
    - [SendTx](https://optimism-sepolia.blockscout.com/tx/0x97c637d215d06efc43ce207595ff554c0561f818985da369eca4673480865910)
    - [RecvTx](https://optimism-sepolia.blockscout.com/tx/0x6b8914d75a2ecf6a7180c7bd9e767117cdfc59a111573dcbcbefaa9b057894a7)
    - [Ack](https://base-sepolia.blockscout.com/tx/0xffa582fc1b1b474a11f23846b490f43e47eed7913d77b862270e9bd12c1091a0)

## Challenges Faced

- Debugging used to be tricky when the sendPacket on the contract was successfully submitted but there was an error further down the packet lifecycle.
What helped was to verify the contracts and use Tenderly for step-by-step debugging to see what the relayers submitted to the dispatcher etc.

## What we learned

How to make the first dApp using Polymer.

## Future improvements

Basic functionality was implemented, but the following things can be improved:

- More tests
- More input validation
- Add event listeners related to important IBC lifecycle steps

## Licence

[Apache 2.0](LICENSE)
