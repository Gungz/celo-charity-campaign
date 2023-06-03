import Web3 from "web3";

const getWeb3 = () => 
  new Promise(async (resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    //window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.celo) {
        try {
          await window.celo.enable();
          const web3 = new Web3(window.celo);
          resolve(web3);
        } catch (error) {
          console.error("Fail to inject web3 from wallet extension")
        }
      }
      else {
        alert("Celo Extension Wallet is not found, you need to install it to use this DApp..")
      }
    //});
  });
export default getWeb3;