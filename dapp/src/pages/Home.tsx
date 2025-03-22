import { useState, useEffect } from "react";
import {
  generateAztecWallet,
  fetchEthereumBalances,
  fetchAztecTokenBalance,
} from "../lib/aztecUtils";

interface WalletData {
  wallet: any;
  address: string;
  privateKey: string;
  signingPrivateKey: string;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
}

const Home = () => {
  const [evmAcc, setEvmAcc] = useState<string>(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  const [account, setAccount] = useState<WalletData | null>(null);
  const [ethBalances, setEthBalances] = useState<TokenBalance[]>([]);
  const [aztecBalances, setAztecBalances] = useState<TokenBalance[]>([
    { symbol: "USDC", balance: "10.0", decimals: 6 },
    { symbol: "DAI", balance: "2.0", decimals: 18 },
  ]);

  useEffect(() => {
    try {
      initializeWallet();
    } catch (err) {
      console.error("Error initializing wallet:", err);
    }
  }, []);

  useEffect(() => {
    const executeAsync = async () => {
      const balances = await fetchEthereumBalances(evmAcc);
      setEthBalances(balances);
    };
    executeAsync();
  }, [account]);

  const initializeWallet = async () => {
    try {
      const wallet = await generateAztecWallet();
      console.log("Generated wallet:", wallet);
      setAccount(wallet);
      const aztecBalance = await fetchAztecTokenBalance(wallet.wallet);
      console.log(aztecBalance);
    } catch (error) {
      console.error("Error generating wallet:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <div className="m-8">
          <div className="my-2 font-bold text-xl">EVM Account</div>
          <div className="my-2">Address: {evmAcc ? evmAcc : "Loading..."}</div>
        </div>

        <div className="m-8">
          <div className="my-2 font-bold text-xl">Aztec Account</div>
          <div className="my-2">
            Address: {account ? account.address : "Loading..."}
          </div>
          <div className="my-2">
            Private Key:{" "}
            {account
              ? `${account.privateKey.substring(
                  0,
                  6
                )}...${account.privateKey.substring(
                  account.privateKey.length - 4
                )}`
              : "Loading..."}
          </div>
          <div className="my-2">
            Signing Key:{" "}
            {account
              ? `${account.signingPrivateKey.substring(
                  0,
                  6
                )}...${account.signingPrivateKey.substring(
                  account.signingPrivateKey.length - 4
                )}`
              : "Loading..."}
          </div>
        </div>

        <div className="m-8">
          <div className="my-2 font-bold text-xl">Aztec Balances</div>
          <div className="flex flex-col">
            {aztecBalances.map((token) => (
              <div key={`aztec-${token.symbol}`} className="flex flex-row">
                <div className="m-2 bg-black p-2 text-white rounded">
                  {token.symbol}
                </div>
                <div className="m-2 bg-black p-2 text-white rounded">
                  {token.balance}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="m-8">
          <div className="my-2 font-bold text-xl">Ethereum Balances</div>
          <div className="flex flex-col">
            {ethBalances.length > 0 ? (
              ethBalances.map((token) => (
                <div key={`eth-${token.symbol}`} className="flex flex-row">
                  <div className="m-2 bg-black p-2 text-white rounded">
                    {token.symbol}
                  </div>
                  <div className="m-2 bg-black p-2 text-white rounded">
                    {token.balance}
                  </div>
                </div>
              ))
            ) : (
              <div className="m-2">Loading balances...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
