const { exec } = require("child_process");
const { getConfigPath, getWhitelistedNetworks } = require('./_helpers.js');
const { setupIbcPacketEventListener } = require('./_events.js');
const { setupXBallotNFTEventListener } = require('../joke-nft/_app-events.js');
const { setupUcXBallotNFTEventListener } = require('../joke-nft/_app-events-UC.js');
const fs = require('fs');



//let jokeLine = "";

// for (let i = 2; i < process.argv.length; i++) {
//     jokeLine += process.argv[i] + "_";
// }
// Дані для запису у файл конфігурації
// const configData = {
//     content: jokeLine
// };
// Шлях до файлу конфігурації
//const configPath = 'jokes-config.json';
// Запис даних у файл конфігурації
//fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
//console.log('Дані успішно записано у файл конфігурації.');


function runSendPacketCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
            } else {
                console.log(stdout);
                resolve(true);
            }
        });
    });
}

async function runSendPacket(config) {
    const source = config.createChannel.srcChain;

    // Check if the source chain from user input is whitelisted
    const allowedNetworks = getWhitelistedNetworks();
    if (!allowedNetworks.includes(source)) {
        console.error("❌ Please provide a valid source chain");
        process.exit(1);
    }

    const script = config.isUniversal ? 'send-universal-nft-info.js' : 'send-nft-info.js';
    const command = `npx hardhat run scripts/joke-nft/${script} --network ${source}`;

    try {
        await setupIbcPacketEventListener();
        // if (config.isUniversal === true) {
        //     await setupUcXBallotNFTEventListener();
        // } else if (config.isUniversal === false) {
        //     await setupXBallotNFTEventListener();
        // } else {
        //     console.error("❌ Invalid config value for isUniversal. Please check your config file.");
        //     process.exit(1);
        // }
        await runSendPacketCommand(command);
    } catch (error) {
        console.error("❌ Error sending packet: ", error);
        process.exit(1);
    }
}

async function main() {
    const configPath = getConfigPath();
    const config = require(configPath);

    await runSendPacket(config);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
