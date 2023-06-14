import { useState } from "react";
import server from "./server";
import { secp256k1, utils } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils.js";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);


  async function transfer(evt) {
    evt.preventDefault();


    if (!recipient || !sendAmount || !address) {
      alert("Please enter an a sender, a reciever, and an amount")
      return 
    }

    let prvKey = secp256k1.utils.randomPrivateKey(); 
    let pubKey = secp256k1.getPublicKey(prvKey); 
    const msgHash = keccak256(utf8ToBytes(sendAmount));
    console.log("msgHash", msgHash)
    console.log(typeof msgHash)
    const signature = secp256k1.sign(msgHash, prvKey)
    // Converting BigInt to string
    const signatureString = {
      r: signature.r.toString(),
      s: signature.s.toString(),
    };


    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
          sender: address,
          amount: parseInt(sendAmount),
          recipient,
          pubKey: toHex(pubKey),
          signature: signatureString,
          msgHash: toHex(msgHash)
        });
      setBalance(balance);
    } catch (ex) {
      console.log(ex)
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
    <h1>Send Transaction</h1>

    <label>
    Send Amount
    <input
    placeholder="1, 2, 3..."
    value={sendAmount}
    onChange={setValue(setSendAmount)}
    ></input>
    </label>

    <label>
    Recipient
    <input
    placeholder="Type an address, for example: 0x2"
    value={recipient}
    onChange={setValue(setRecipient)}
    ></input>
    </label>

    <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

/*
    <label>
    Generate Account
    <button
    onClick={generateAccount}
    >Generate Account</button>
    </label>

*/
