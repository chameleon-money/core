import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import { getDeployedTestAccountsWallets } from "@aztec/accounts/testing";
import { Fr, GrumpkinScalar, createPXEClient } from "@aztec/aztec.js";

import web3Config from "../web3Config";

export const setCookie = (
  name: string,
  value: any,
  days = 30,
  permanent = false
): boolean => {
  try {
    let cookieString = `${name}=${encodeURIComponent(
      typeof value === "object" ? JSON.stringify(value) : value
    )};path=/;SameSite=Strict`;

    if (permanent) {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10);
      cookieString += `;expires=${farFuture.toUTCString()}`;
    } else if (days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `;expires=${expires.toUTCString()}`;
    }

    document.cookie = cookieString;
    return true;
  } catch (error) {
    console.error("Error setting cookie:", error);
    return false;
  }
};

export const getCookie = (name: string): any => {
  try {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }

      if (cookie.indexOf(nameEQ) === 0) {
        const cookieValue = decodeURIComponent(
          cookie.substring(nameEQ.length, cookie.length)
        );

        try {
          if (cookieValue.startsWith("{") || cookieValue.startsWith("[")) {
            return JSON.parse(cookieValue);
          }
        } catch (e) {}

        return cookieValue;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting cookie:", error);
    return null;
  }
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

interface WalletData {
  address: string;
  privateKey: string;
  signingPrivateKey: string;
}

export const generateAztecWallet = async () => {
  const WALLET_COOKIE_NAME = "aztec_wallet_data";

  const existingWalletData = getCookie(WALLET_COOKIE_NAME) as WalletData | null;

  if (
    existingWalletData &&
    existingWalletData.address &&
    existingWalletData.privateKey
  ) {
    console.log("Using existing wallet from cookie");

    const privateKeyHex = existingWalletData.privateKey.startsWith("0x")
      ? existingWalletData.privateKey.slice(2)
      : existingWalletData.privateKey;

    const signingKeyHex = existingWalletData.signingPrivateKey.startsWith("0x")
      ? existingWalletData.signingPrivateKey.slice(2)
      : existingWalletData.signingPrivateKey;

    const secretKey = Fr.fromBuffer(Buffer.from(privateKeyHex, "hex"));
    const signingPrivateKey = GrumpkinScalar.fromBuffer(
      Buffer.from(signingKeyHex, "hex")
    );

    const PXE_URL = web3Config.PXE_URL;
    const pxe = createPXEClient(PXE_URL);

    const newAccount = await getSchnorrAccount(
      pxe,
      secretKey,
      signingPrivateKey
    );
    const newWallet = await newAccount.getWallet();

    return {
      wallet: newWallet,
      ...existingWalletData,
    };
  }

  console.log("Generating new wallet");
  const PXE_URL = web3Config.PXE_URL;
  const pxe = createPXEClient(PXE_URL);
  const secretKey = Fr.random();
  const signingPrivateKey = GrumpkinScalar.random();

  const wallet = (await getDeployedTestAccountsWallets(pxe))[0];
  const newAccount = await getSchnorrAccount(pxe, secretKey, signingPrivateKey);
  await newAccount.deploy({ deployWallet: wallet }).wait();
  const newWallet = await newAccount.getWallet();

  // Get wallet information using the appropriate methods
  // We need to extract the address information from the wallet
  const addressString = newWallet.getAddress().toString();
  const address = addressString.startsWith("0x")
    ? addressString.slice(2)
    : addressString;

  // Extract the secretKey using the proper getter method if available
  const pKey = secretKey.toString();

  // For signingKey, use the private key we already have
  const sigKey = signingPrivateKey.toString();

  const walletData: WalletData = {
    address: `0x${address}`,
    privateKey: `0x${pKey}`,
    signingPrivateKey: `0x${sigKey}`,
  };

  setCookie(WALLET_COOKIE_NAME, walletData, 0, true);

  return {
    wallet: newWallet,
    ...walletData,
  };
};

export const clearWalletData = (): void => {
  deleteCookie("aztec_wallet_data");
};
