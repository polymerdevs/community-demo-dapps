const hre = require('hardhat');
const { getIbcApp } = require('./private/_vibc-helpers.js');

async function main() {
    const accounts = await hre.ethers.getSigners();
 
    const networkName = hre.network.name;

    const ibcApp = await getIbcApp(networkName);

    const contractOwner = "";  // change to your own
    const SpinWheelGame = "0x3DACA6eB95A079e6678Fb45dF53F3c64BF246fE3";
    await ibcApp.connect(accounts[0]).mint(contractOwner, 1000);
    await ibcApp.connect(accounts[0]).mint(SpinWheelGame, 1000000);
    const bal1 = await ibcApp.connect(accounts[0]).balanceOf(contractOwner);
    const bal2 = await ibcApp.connect(accounts[0]).balanceOf(SpinWheelGame);
    console.log("contractOwner has ", bal1, "points");
    console.log("SpinWheelGame has ", bal2, "points");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});