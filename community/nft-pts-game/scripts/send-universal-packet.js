// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const { getConfigPath } = require('./private/_helpers');
const { getIbcApp } = require('./private/_vibc-helpers.js');

async function main() {
    const accounts = await hre.ethers.getSigners();
    const config = require(getConfigPath());
    const sendConfig = config.sendUniversalPacket;

    const networkName = hre.network.name;
    // Get the contract type from the config and get the contract
    const ibcApp = await getIbcApp(networkName);

    // If the network we are sending on is optimism, we need to use the base port address and vice versa
    const destPortAddr = networkName === "optimism" ?
      config["sendUniversalPacket"]["base"]["portAddr"] :
      config["sendUniversalPacket"]["optimism"]["portAddr"];
    const channelId = sendConfig[`${networkName}`]["channelId"];
    const channelIdBytes = hre.ethers.encodeBytes32String(channelId);
    const timeoutSeconds = sendConfig[`${networkName}`]["timeout"];

    
    // Send the packet
    await ibcApp.connect(accounts[0]).crossChainMint( destPortAddr, channelIdBytes, timeoutSeconds, 3); // 3 is token type 0 to 3, random for 4

    //await ibcApp.connect(accounts[0]).crossChainBurn( destPortAddr, channelIdBytes, timeoutSeconds, 1); // 1 is tokenId
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});