import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import sitToken from "./artifacts/contracts/SIT.sol/SIT.json";

const tokenAddress = "YOUR-CONTRACT-ADDRESS";

/*
 * App
 */
function App() {
  const [userAccount, setUserAccount] = useState();
  const [amount, setAmount] = useState();
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [address, setAddress] = useState();
  const [transfers, setTransfers] = useState();

  useEffect(() => {
    async function init() {
      const Iprovider = new ethers.providers.Web3Provider(window.ethereum);
      const Isigner = Iprovider.getSigner();
      const Icontract = new ethers.Contract(
        tokenAddress,
        sitToken.abi,
        Isigner
      );
      setProvider(Iprovider);
      setSigner(Isigner);
      setContract(Icontract);
      setAddress(await Isigner.getAddress());
    }
    init();
  }, []);

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  /*
   * CONTRACT INTERACTIONS
   */
  const getBalance = async () => {
    if (!provider) console.error("No web3 provider found.");
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    // The balance is displayed with 18 decimals, can you fix it to show the correct token balance?
    const balance = await contract.balanceOf(account);
    alert(`Balance: ${balance.toString()}`);
  };

  const transfer = async () => {
    if (!provider) console.error("No web3 provider found.");
    await requestAccount();
    const transation = await contract.transfer(
      userAccount,
      ethers.utils.parseEther(amount).toString()
    );
    await transation.wait();
    alert(`${amount} SIT tokens successfully sent to ${userAccount}`);
  };

  const mint = async () => {
    if (!provider) console.error("No web3 provider found.");
    await requestAccount();
    try {
      const transaction = await contract.mint(
        userAccount,
        ethers.utils.parseEther(amount).toString()
      );
      await transaction.wait();
      alert(`${amount} SIT tokens successfully minted to ${userAccount}`);
    } catch (e) {
      console.error(e.data.message);
      alert(e.data.message);
    }
  };

  /*
   * UI
   */
  return (
    <div className="App">
      <header className="App-header">
        <p>Active address: {address}</p>
        <input
          onChange={(e) => setUserAccount(e.target.value)}
          placeholder="Address"
        />
        <input
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <br />
        <span>
          <button onClick={getBalance}>Get Balance</button>
          <button onClick={transfer}>Send Tokens</button>
          <button onClick={mint}>Mint Tokens</button>
        </span>
      </header>
    </div>
  );
}

export default App;
