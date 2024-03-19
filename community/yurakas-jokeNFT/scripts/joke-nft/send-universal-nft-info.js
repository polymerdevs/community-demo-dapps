// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const { getConfigPath } = require('../private/_helpers.js');
const { getIbcApp } = require('../private/_vibc-helpers.js');

async function main() {
  const accounts = await hre.ethers.getSigners();
  const config = require(getConfigPath());
  const sendConfig = config.sendUniversalPacket;

  const networkName = hre.network.name;
  // Get the contract type from the config and get the contract
  const ibcApp = await getIbcApp(networkName);

  // Change if your want to send a vote from a different address
  const voteAccount = accounts[2];

  // console.log(`Casting a vote from address: ${voterAddress}`);
  await ibcApp.connect(voteAccount).vote(1);
  // console.log("Vote cast");

  // Do logic to prepare the packet
  const destPortAddr = sendConfig[`${networkName}`]["portAddr"];
  const channelId = sendConfig[`${networkName}`]["channelId"];
  const channelIdBytes = hre.ethers.encodeBytes32String(channelId);
  const timeoutSeconds = sendConfig[`${networkName}`]["timeout"];
  const voterAddress = voteAccount.address;
  const recipient = voterAddress;

  // Send the packet
  // console.log(`Sending a packet via IBC to mint an NFT for ${recipient} related to vote from ${voterAddress}`);
  await ibcApp.connect(accounts[0]).sendUniversalPacket(
    destPortAddr,
    channelIdBytes,
    timeoutSeconds,
    voterAddress,
    recipient
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});