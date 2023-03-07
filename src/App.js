import React, { useState, useEffect } from "react";
import "./App.css";
import { useCelo } from "@celo/react-celo";
import bankabi from "./contracts/bank.abi.json";
import BigNumber from "bignumber.js";
const bankContractAddress = "0xb62632cd205304abF772F4d044889bD5BBe1B56b"

function App() {
  const { connect, address, performActions, getConnectedKit} = useCelo();
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [bankContract, setBankContract] = useState("");
  const [accountDetails, setAccountDetails] = useState()
  const [username, setUsername] = useState("")

  const [withdrawAmount, setWithdrawAmount] = useState(0) 
  const [depositAmount, setDepositAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0)
  const [receiverAdd, setReceiverAdd] = useState("")

  async function connectWallet() {
    await connect();
    const kit = await getConnectedKit()
    const bal = await kit.connection.getBalance(address)
    const balance = new BigNumber(bal).shiftedBy(-18).toFixed(2)
    setAccount(address)
    setBalance(balance)
  }

  async function getContract () {
    const kit = await getConnectedKit();
    const contract = new kit.connection.web3.eth.Contract(bankabi, bankContractAddress)
    setBankContract(contract);
  }

  async function getAccount() {
    try {
      const details = await bankContract.methods.accountDetails().call();
      const data = {
        id: details[0],
        username: details[1],
        balance: details[2],
        lastDeposit: details[3],
        lastTransfer: details[4]
      }
      setAccountDetails(data)
      console.log(data)
    } catch (e) {
      console.log(e)
    }
  }


  useEffect(() => {
    getContract();
  }, [])

  useEffect(() => {
    if (bankContract && account) {
      getAccount()
    }
  }, [bankContract, account])

    async function signUp() {
      await performActions (async (kit) => {
      try {
        await bankContract.methods.createAccount(username).send({from: kit.connection.defaultAccount})
        alert("Successful! Reload page to see changes")
      } catch (e) {
        console.log(e)
      }
      })
    }

    async function deposit() {
      await performActions (async (kit) => {
        try {
          await bankContract.methods.deposit().send({from: kit.connection.defaultAccount, value: new BigNumber(depositAmount).shiftedBy(18)})
          alert("Success! Refresh page to see changes")
        } catch (e) {
          console.log(e)
        }
      })
    }

    async function withdraw() {
      await performActions (async (kit) => {
        try {
          await bankContract.methods.withdraw(new BigNumber(withdrawAmount).shiftedBy(18)).send({from: kit.connection.defaultAccount})
          alert("Success! Refresh page to see changes")
        } catch (e) {
          console.log(e)
        }
      })
    }

     async function transfer() {
      await performActions (async (kit) => {
        try {
          await bankContract.methods.transfer(receiverAdd, new BigNumber(transferAmount).shiftedBy(18)).send({from: kit.connection.defaultAccount})
          alert("Success! Refresh page to see changes")
        } catch (e) {
          console.log(e)
        }
      })
    }

  return (
    <div className="App">
      {!account ? (
        <div className="connect" onClick={() => connectWallet()}>
          Connect
        </div>
      ) : (
        <>
          <div className="address">Address: {account}</div>
        <div className="address">Bal: {balance} CELO</div>
        </>
      
      )}

      {accountDetails?.id == 0? <div><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username"/><div onClick={() => signUp()} className="connect">Sign up </div></div>:
        <div className="m">
        <div className="left-nav">
              <div>
            <div className="input">
              <span>Receiver:</span><input value={receiverAdd} onChange={(e) => setReceiverAdd(e.target.value)} placeholder="0x12345" type="text"/>
                 <span>Amount:</span><input value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="1 CELO" type="number"/>
            </div>
         <p>*Before you transfer, please ensure the receiver is registered on the app</p>
                    <div onClick={() => transfer()} className="button button-transfer">Transfer</div>
          </div>
          <div className="input">
              <span>Amount:</span><input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="amount to withdraw" type="number"/>
         </div>
          <div onClick={() => withdraw()} className="button button-withdraw">Withdraw</div>
 </div>
        <div className="main">
          <p>Welcome, {accountDetails?.username}</p>
      <div className="main-dashboard">
            <div className="main-info">
              <div>
                Last deposit: {new Date(accountDetails?.lastDeposit * 1000).toLocaleString()}
              </div>
                                <div>
                Last transfer: {new Date(accountDetails?.lastTransfer * 1000).toLocaleString()}
              </div>
            </div>
            <div className="main-bal">
              <p>Bal:</p>
              <div>${Number(new BigNumber(accountDetails?.balance).shiftedBy(-18).toFixed(2))}</div>
            </div>
          </div>
        </div>
        <div className="right-nav">
        <div className="input">
              <span>Amount:</span><input value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="deposit amount. e.g 1 CELO" type="number"/>
            </div>
          <div onClick={() => deposit()} className="button button-deposit">Deposit</div>
          <div className="button">...</div>
        </div>
      </div>
      }
    
</div>
  );
}

export default App;
