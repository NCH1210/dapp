import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import sitToken from "./artifacts/contracts/SIT.sol/SIT.json";

const tokenAddress = "YOUR-CONTRACT-ADDRESS";
const graphAPI = "YOUR-GRAPH-ENDPOINT";

/*
 * Fetch helpers
 */
const requestHeaders = (body) => ({
  method: "POST",
  body: JSON.stringify({
    query: body,
  }),
});

const makeRequest = async (query, endpoint) => {
  return await fetch(endpoint, { ...requestHeaders(query) })
    .then((response) => response.json())
    .then((data) => data)
    .catch(console.log);
};

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
    alert(`${amount} PPT tokens successfully sent to ${userAccount}`);
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
      alert(`${amount} PPT tokens successfully minted to ${userAccount}`);
    } catch (e) {
      console.error(e.data.message);
      alert(e.data.message);
    }
  };

  /*
   * The Graph API
   */
  const getAllTransfers = async () => {
    let result = await makeRequest(
      `{ transfers {id from to value}} `,
      graphAPI
    );

    console.log(result.data);

    let transfers = result.data.transfers.map((transfer) => {
      let txId = transfer.id.split("-")[0];
      return (
        <tr>
          <td>
            <a href={`https://rinkeby.etherscan.io/tx/${txId}`} target="_blank">
              {txId}
            </a>
          </td>
          <td>{transfer.from}</td>
          <td>{transfer.to}</td>
          <td>{transfer.value}</td>
        </tr>
      );
    });
    setTransfers(transfers);
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
          <button onClick={getAllTransfers}>Get Transfers</button>
        </span>
      </header>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {transfers && (
          <table>
            <thead>
              <tr>
                <th>TxID</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>{transfers}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
