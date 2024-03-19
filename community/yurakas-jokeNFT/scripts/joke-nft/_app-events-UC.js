const hre = require("hardhat");
const { getConfigPath } = require("../private/_helpers.js");
const { getIbcApp } = require("../private/_vibc-helpers.js");

const explorerOpUrl = "https://optimism-sepolia.blockscout.com/";
const explorerBaseUrl = "https://base-sepolia.blockscout.com/";

function listenForBallotEvents(network, ballot) {
    const explorerUrl = network === "optimism" ? explorerOpUrl : explorerBaseUrl;
    console.log(`👂 Listening for Ballot events on ${network}...`);

    ballot.on("Voted", (voter, proposal, event) => {
        const txHash = event.log.transactionHash;
        const url = `${explorerUrl}tx/${txHash}`;
        console.log(`
          -------------------------------------------
          🗳️  Voted on Ballot !!!   🗳️
          -------------------------------------------
          🔔 Event name: ${event.log.fragment.name}
          ☎️  Voter address: ${voter}
          📜 Proposal ID: ${proposal}
          -------------------------------------------
          🧾 TxHash: ${txHash}
          🔍 Explorer URL: ${url}
          -------------------------------------------\n`);
    });

    ballot.on("SendVoteInfo", (destPortAddr, voter, recipient, proposal, event ) => {
        const txHash = event.log.transactionHash;
        const url = `${explorerUrl}tx/${txHash}`;
        console.log(`
          -------------------------------------------
          📦🗳️  Vote Info Sent !!!   🗳️📦
          -------------------------------------------
          🔔 Event name: ${event.log.fragment.name}
          ☎️  Voter address: ${voter}
          ☎️  Recipient address: ${recipient}
          📜 Proposal ID: ${proposal}
          🔗 Counterparty application: ${destPortAddr}
          -------------------------------------------
          🧾 TxHash: ${txHash}
          🔍 Explorer URL: ${url}
          -------------------------------------------\n`);
    });

    ballot.on("AckNFTMint", (destPortAddr, voter, voteNFTid, event ) => {
        const txHash = event.log.transactionHash;
        const url = `${explorerUrl}tx/${txHash}`;
        console.log(`
          -------------------------------------------
          📦🖼️  NFT Minted Ack !!!   🖼️📦
          -------------------------------------------
          🔔 Event name: ${event.log.fragment.name}
          ☎️  Voter address: ${voter}
          🖼️  Proof-Of-Vote NFT ID: ${voteNFTid}
          🔗 Counterparty application: ${destPortAddr}
          -------------------------------------------
          🧾 TxHash: ${txHash}
          🔍 Explorer URL: ${url}
          -------------------------------------------\n`);

        ballot.removeAllListeners();
    });    
}

async function setupUcXBallotNFTEventListener() {
    console.log("🔊 Setting up Ballot and NFT event listeners...")
    const config = require(getConfigPath());

    const srcIbcApp = await getIbcApp("optimism"); // How to get source chain when using universal channels?
    listenForBallotEvents("optimism", srcIbcApp);
}

module.exports = { setupUcXBallotNFTEventListener };
