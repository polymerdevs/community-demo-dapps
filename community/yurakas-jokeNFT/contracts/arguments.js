module.exports = {
    "XCounter": [],
    "XCounterUC": [],
    // Add your contract types here, along with the list of custom constructor arguments
    // DO NOT ADD THE DISPATCHER OR UNIVERSAL CHANNEL HANDLER ADDRESSES HERE!!!
    // These will be added in the deploy script at $ROOT/scripts/deploy.js
    "OptContract": [
        [
            '0x506f6c796d657220697320612062726964676500000000000000000000000000',   // "Polymer is a bridge"
            '0x506f6c796d6572206973206e6f74206120627269646765000000000000000000'    // "Polymer is not a bridge"
        ]
    ],
    "BaseContract": [
        ''
    ],
    "XBallotUC": [
        [
            '0x506f6c796d657220697320612062726964676500000000000000000000000000',   // "Polymer is a bridge"
            '0x506f6c796d6572206973206e6f74206120627269646765000000000000000000'    // "Polymer is not a bridge"
        ]
    ],
    "XProofOfVoteNFTUC": [
        'https://picsum.photos/id/'
    ]
};