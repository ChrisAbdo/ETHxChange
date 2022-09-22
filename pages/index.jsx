import Head from "next/head";
import Navbar from "../components/Navbar";
import TransactionsPage from "../components/TransactionsPage";
import Web3 from "web3";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Transactions from "../backend/build/contracts/Transactions.json";

const Home = () => {
  const ipfsClient = require("ipfs-http-client");
  const projectId = "2En92EhioxsHmk6wdrVZUt9LU64";
  const projectSecret = "2f644b293207672296d5cf641a9608af";
  const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
  const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buffer, setBuffer] = useState(null);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [updatedTransactions, setUpdatedTransactions] = useState([]);

  useEffect(() => {
    loadBlockchainData();
    loadWeb3();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, [account]);

  const loadBlockchainData = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
      const accounts = await web3.eth.getAccounts();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

      const networkId = await web3.eth.net.getId();
      const networkData = Transactions.networks[networkId];

      if (networkData) {
        const transaction = new web3.eth.Contract(
          Transactions.abi,
          networkData.address
        );
        setTransactions(transaction);
        // const transactionCount = await transaction.methods
        //   .transactionCount()
        //   .call();
        // setTransactionsCount(transactionsCount);

        const transactionCount = await transaction.methods
          .getTransactionCount()
          .call();
        setTransactionsCount(transactionCount);
        console.log(transactionCount);

        setLoading(false);
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }

      // Event listeners...
      window.ethereum.on("accountsChanged", function (accounts) {
        setAccount(accounts[0]);
      });

      window.ethereum.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    }
  };

  // Enable metamask connection
  const Web3Handler = async () => {
    if (web3) {
      const notification = toast.loading("Connecting...");
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        toast.success("Connected!", {
          id: notification,
        });
      } catch (error) {
        console.log(error);
        toast.error("Error connecting! Please try again.", {
          id: notification,
        });
      }
    }
  };

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const addToBlockchain = async () => {
    const recipient = document.getElementById("recipient").value;
    const amount1 = document.getElementById("amount").value;
    const amount = web3.utils.toWei(amount1, "ether");
    const message = document.getElementById("message").value;
    const notification = toast.loading("Sending transaction...");
    try {
      await transactions.methods
        .addToBlockchain(recipient, amount, message)
        .send({ from: account });
      toast.success("Transaction sent!", {
        id: notification,
      });
    } catch (error) {
      console.log(error);
      toast.error("Error sending transaction! Please try again.", {
        id: notification,
      });
    }
  };

  const getAllTransactions = async () => {
    try {
      const allTransactions = await transactions.methods
        .getAllTransactions()
        .call();
      const updatedTransactions = allTransactions.map((transaction) => {
        return {
          from: transaction[0],
          to: transaction[1],
          amount: web3.utils.fromWei(transaction[2], "ether"),
          message: transaction[3],
          timestamp: transaction[4],
        };
      });
      setUpdatedTransactions(updatedTransactions);
      console.log(updatedTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div data-theme="emerald" className="min-h-screen">
      <Head>
        <title>ETHxChange</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar Web3Handler={Web3Handler} account={account} />

      {/* if the loading is complete, show the commented code above, but if still loading, show h1 tag loading */}
      {loading ? (
        <h1 className="text-center text-4xl">Loading...</h1>
      ) : (
        <div>
          <div>
            <TransactionsPage
              getAllTransactions={getAllTransactions}
              addToBlockchain={addToBlockchain}
            />
          </div>

          {/* make a table that maps updatedTransactions */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Message</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {updatedTransactions.map((transaction, index) => {
                  return (
                    <tr className="cursor-pointer" key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {transaction.from.substring(0, 5) +
                          "..." +
                          transaction.from.substring(38, 42)}
                      </td>
                      <td>
                        {transaction.to.substring(0, 5) +
                          "..." +
                          transaction.to.substring(38, 42)}
                      </td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.message}</td>
                      <td>{transaction.timestamp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div id="hellothere"></div>
    </div>
  );
};

export default Home;
