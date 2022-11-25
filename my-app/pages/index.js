import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import {REGISTER_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // joinRegister to keep track of wallet that have joined the register 
  const [joinedRegister, setJoinedRegister] = useState(false);

  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  // numberOfWalletRegistered tracks the number of wallet's that have registered
  const [numberOfWalletRegistered, setNumberOfWalletRegistered] = useState(0);

  // this is a reference to the Web3 Modal (used for connecting to Metamask) 
  const web3ModalRef = useRef();

  //@param {*} needSigner - True if you need the signer, default is set to false if not needed
  const getProviderOrSigner = async (needSigner = false) => {

    // Connecting to Metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // alert user to connect to the Goerli network.
    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 5) {
      window.alert("Your are not on the Goerli network");
      throw new Error("Switch your network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
 
  // joinWalletToReg: Adds the current connected wallet address to the register list

  const joinWalletToReg = async () => {
    try {

      // Signer is set to "true" since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);

      // a new instance of the Contract with a Signer, for updating methods is created here
      const registerContract = new Contract(
        REGISTER_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // this is the call instance of joinWalletToReg from the SC
      const tx = await registerContract.joinWalletToReg();
      setLoading(true);
      
      await tx.wait();
      setLoading(false);

      // getting the updated number of wallet in the register

      await getNumberOfWalletRegistered();
      setJoinedRegister(true);
    } catch (err) {
      console.error(err);
    }
  };
 
  //getNumberOfWalletRegistered: gets the number of wallet that have registered

  const getNumberOfWalletRegistered = async () => {
    try {

      // the provider is needed here to read data only from the blockchain
    
      const provider = await getProviderOrSigner();

      const registerContract = new Contract(
       REGISTER_CONTRACT_ADDRESS,
        abi,
        provider
      );

      // this is the call instance of numWalletInReg from the SC
      const _numWalletInReg =
        await registerContract.numWalletInReg();
        setNumberOfWalletRegistered(_numWalletInReg);
    } catch (err) {
      console.error(err);
    }
  };

 
  //readIfWalletInRegister: Checks if wallet is in the registered list
  
  const readIfWalletInRegister = async () => {
    try {

      // We will need the signer here also since we want to get the user's wallet address

      const signer = await getProviderOrSigner(true);
      const registerContract = new Contract(
        REGISTER_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // getting the wallet addrs connected to MetaMask or any other wallet currently in use
      const address = await signer.getAddress();

      // this is the call instance of walletInReg from the SC
      const _joinedRegister = await registerContract.walletInReg(
        address
      );
      setJoinedRegister(_joinedRegister);
    } catch (err) {
      console.error(err);
    }
  };
  
  //connectWallet: Connects the MetaMask wallet or any other wallet in use

  const connectWallet = async () => {
    try {
      
      await getProviderOrSigner();
      setWalletConnected(true);

      readIfWalletInRegister();
      getNumberOfWalletRegistered();
    } catch (err) {
      console.error(err);
    }
  };

  //renderButton: Returns a button based on the state of the dapp

  const renderButton = () => {
    if (walletConnected) {
      if (joinedRegister) {
        return (
          <div className={styles.description}>
            You are now in the register list!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={ joinWalletToReg } className={styles.button}>
            Click here to Register!
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffects are used to react according to the changes in state of the website

  useEffect(() => {

    // if wallet is not connected yet, this is to create a new instance of Web3Modal and connect the wallet
    if (!walletConnected) {

      // the Web3Modal class is assigned here by setting it's `current` value
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (

    <div>
      <Head> 
        <title>Registration Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />       
      </Head>
      
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome To NFT NYC!</h1>
          <div className={styles.description}>
           You can register to join in the list!
          </div>
          <div className={styles.description}>
           This {numberOfWalletRegistered} person's registered are surely going to NFT NYC!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./vintage-1781619_960_720.png" />
        </div>
      </div>
      
      <footer className={styles.footer}>
        Made by NFT NYC Inc &#10084;
      </footer>
    </div>
  );
}
