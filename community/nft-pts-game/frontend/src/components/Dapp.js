import React from "react";
import { Card, Button, ButtonGroup, CardGroup } from "react-bootstrap";
import { ethers } from "ethers";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

// copy from config.json in root folder
const config = {
  "optimism": {
    "portAddr": "0x5a2e1C779158B8500557920bdc81E4cc53DEe54E",
    "channelId": "channel-10",
    "timeout": 36000
  },
  "base": {
    "portAddr": "0x3DACA6eB95A079e6678Fb45dF53F3c64BF246fE3",
    "channelId": "channel-11",
    "timeout": 36000
  },
  "SpinWheelGameAddr": "0x3DACA6eB95A079e6678Fb45dF53F3c64BF246fE3"
}

const contractABI_PTS = require('../abi/contractPTS-abi.json');
const contractAddress_PTS = config["optimism"]["portAddr"];
const contractABI_NFT = require('../abi/contractNFT-abi.json');
const contractAddress_NFT = config["base"]["portAddr"];
const contractABI_SWG = require('../abi/contractSWG-abi.json');
const contractAddress_SWG = config["SpinWheelGameAddr"];

const BASE_NETWORK_ID = 84532;
const OP_NETWORK_ID = 11155420;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      nftData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      nfts: undefined,
      lastSpinTime: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };
    this._provider_op = new ethers.providers.WebSocketProvider(process.env.REACT_APP_ALCHEMY_KEY_WS_OP);
    this._provider_base = new ethers.providers.WebSocketProvider(process.env.REACT_APP_ALCHEMY_KEY_WS_BASE);
    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.tokenData || !this.state.balance || !this.state.nfts || !this.state.nftData) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              CrossChain NFT-PTS Game Powered by Polymer 
              <div>
                <Button variant="text" onClick={()=>{this._spinTheWheel()}}>
                  Spin Wheel to get 1~10 PTS
                </Button>
                { ()=>{
                    var date = new Date(this.state.lastSpinTime*1000);
                    var hours = date.getHours();
                    var minutes = "0" + date.getMinutes();
                    var seconds = "0" + date.getSeconds();
                    var t = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    return ("Please wait 5 min (last spin time: "+t+")")
                  }
                }
              </div>
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>
                {this.state.balance.toString()} {this.state.tokenData.symbol}
              </b>
              <p>
                <ButtonGroup variant="contained" aria-label="Basic button group">
                  { [0,1,2,3].map(
                      (n) => {
                        return (
                          <Button onClick={()=>{this._crossChainMint(n)}}>
                            Mint Type {n+1} for {this.state.nftData.values[n].toNumber()} points
                          </Button>
                        );
                  })}
                  <Button color="#ff5c5c" onClick={()=>{this._crossChainMint(4)}}>Randomly Mint for 20 points</Button>
                </ButtonGroup>
              </p>
              <hr class="hr" />
              <p>You can only have max 4 NFTs.</p>
              <p>
                <CardGroup>
                  {this.state.nfts.map(
                      (e) => {
                        let tokenId = e["tokenId"].toNumber();
                        let ptype = e["ptype"];
                        return ( <Card>
                          <Card.Img 
                            variant="top" 
                            src={this.state.nftData.urls[ptype]} 
                            style={{ height: 110, width: 160 }}
                          />
                          <Card.Body>
                            <Card.Title>tokenId: {tokenId}</Card.Title>
                            <Card.Text>
                              <p>{this.state.nftData.name}</p>
                              <p>burn to get {this.state.nftData.values[ptype].toNumber()*0.2} points</p>
                            </Card.Text>
                            <Button variant="primary" onClick={()=>{this._crossChainBurn(tokenId)}}>BURN</Button>
                          </Card.Body>
                        </Card> )
                      }
                    )
                  }
                </CardGroup>
              </p>
            </p>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    this._checkNetwork();

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({ selectedAddress: userAddress });
    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    this._initializeNFT();
    this._getTokenData();
    this._getNFTData();
    this._startPollingData();
  }

  async _initializeEthers() {
    this._token = new ethers.Contract(
      contractAddress_PTS,
      contractABI_PTS,
      this._provider_op
    );

    console.log(this._token);
  }

  async _initializeNFT() {
    this._nft = new ethers.Contract(
      contractAddress_NFT,
      contractABI_NFT,
      this._provider_base
    );

    console.log(this._nft);
  }


  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);
    this._pollDataInterval = setInterval(() => this._updateNFT(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
    this._updateNFT();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();
    this.setState({ tokenData: { name, symbol } });
  }

  async _getNFTData() {
    const name = await this._nft.name();
    const symbol = await this._nft.symbol();
    const urls = [];
    for (let i=0; i<4; i++) {
      await this._nft
      .tokenURIs(i)
      .then((url)=>{
          urls[i] = url;
      });
    }
    const values = [];
    for (let i=0; i<4; i++) {
      await this._nft
      .tokenValues(i)
      .then((v)=>{
          values[i] = v;
      });
    }
    this.setState({ nftData: { name, symbol, urls, values }});
  }

  async _updateBalance() {
    if (typeof this.state.selectedAddress === 'undefined'){ return 0 };
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance: balance });
  }

  async _updateNFT() {
    if (typeof this.state.selectedAddress === 'undefined'){ return 0 };
    const bal = await this._nft.balanceOf(this.state.selectedAddress);
    let nfts = [];
    for (let i=0; i<bal; i++) {
      const tokenId = await this._nft.tokenOfOwnerByIndex(this.state.selectedAddress, i);
      const ptype = await this._nft.tokenTypeMap(tokenId);
      nfts[i] = {tokenId, ptype};
    }
    this.setState({ nfts: nfts });
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    const chainIdHex = `0x${OP_NETWORK_ID.toString(16)}`
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.net_version !== OP_NETWORK_ID || window.ethereum.net_version !== BASE_NETWORK_ID) {
      this._switchChain();
    }
  }

  async _spinTheWheel() {
    if (window.ethereum.net_version !== OP_NETWORK_ID) {
      const chainIdHex = `0x${OP_NETWORK_ID.toString(16)}`
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const _signer = provider.getSigner();
    const _wheel = new ethers.Contract(
      contractAddress_SWG,
      contractABI_SWG,
      _signer
    );

    console.log("click spin...");

    try {
      this._dismissTransactionError();
      const tx = await _wheel.spinTheWheel();
      this.setState({ txBeingSent: tx.hash });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      await this._updateBalance();
      const timestamp = await _wheel.lastSpinTime(this.state.selectedAddress);
      this.setState({ lastSpinTime: timestamp });
    } catch (error) {
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _crossChainMint(ptype) {
    if (window.ethereum.net_version !== BASE_NETWORK_ID) {
      const chainIdHex = `0x${BASE_NETWORK_ID.toString(16)}`
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const _signer = provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress_NFT,
      contractABI_NFT,
      _signer
    );

    console.log("click mint...");

    try {
      this._dismissTransactionError();
      const tx = await contract.crossChainMint(36000, ptype);
      this.setState({ txBeingSent: tx.hash });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      await this._updateBalance();
    } catch (error) {
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _crossChainBurn(tokenid) {
    if (window.ethereum.net_version !== BASE_NETWORK_ID) {
      const chainIdHex = `0x${BASE_NETWORK_ID.toString(16)}`
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const _signer = provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress_NFT,
      contractABI_NFT,
      _signer
    );

    console.log("click burn...");

    try {
      this._dismissTransactionError();
      const tx = await contract.crossChainBurn(36000, tokenid);
      this.setState({ txBeingSent: tx.hash });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      await this._updateBalance();
    } catch (error) {
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }
}
