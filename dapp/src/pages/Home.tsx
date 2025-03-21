import { useState, useEffect } from "react";
import { generateAztecWallet } from "../lib/aztecUtils";

interface WalletData {
  wallet: any;
  address: string;
  privateKey: string;
  signingPrivateKey: string;
}

const Home = () => {
  const [account, setAccount] = useState<WalletData | null>(null);

  useEffect(() => {
    try {
      test();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const test = async () => {
    try {
      const wallet = await generateAztecWallet();
      console.log(wallet);
      console.log(wallet.address);
      console.log(wallet.privateKey);
      setAccount(wallet);
    } catch (error) {
      console.error("Error generating wallet:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <div className="m-8">
          <div className="my-2">Aztec Account</div>
          <div className="my-2">address: {account ? account.address : ""}</div>
          <div className="my-2">
            privateKey: {account ? account.privateKey : ""}
          </div>
          <div className="my-2">
            signing key: {account ? account.signingPrivateKey : ""}
          </div>
        </div>
        <div className="m-8">
          <div className="my-2">Aztec Balances</div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="m-2 bg-black p-2">USDC</div>
              <div className="m-2 bg-black p-2">10.0</div>
            </div>
            <div className="flex flex-row">
              <div className="m-2 bg-black p-2">DAI</div>
              <div className="m-2 bg-black p-2">2.0</div>
            </div>
          </div>
        </div>
        <div className="m-8">
          <div className="my-2">Ethereum Balances</div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="m-2 bg-black p-2">USDC</div>
              <div className="m-2 bg-black p-2">10.0</div>
            </div>
            <div className="flex flex-row">
              <div className="m-2 bg-black p-2">DAI</div>
              <div className="m-2 bg-black p-2">2.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
