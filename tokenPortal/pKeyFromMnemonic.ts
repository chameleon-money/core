import { Wallet } from "ethers";

function getPrivateKeyFromMnemonicWithEthers(mnemonic: string) {
  try {
    const wallet = Wallet.fromPhrase(mnemonic);

    const privateKey = wallet.privateKey;

    console.log("Derived address:", wallet.address);
    console.log("Private key:", privateKey);

    return {
      privateKey,
      address: wallet.address,
    };
  } catch (error) {
    console.error("Error deriving private key from mnemonic:", error.message);
    throw error;
  }
}

const MNEMONIC = "test test test test test test test test test test test junk";

console.log(getPrivateKeyFromMnemonicWithEthers(MNEMONIC));
