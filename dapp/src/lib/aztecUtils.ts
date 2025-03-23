import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import { getDeployedTestAccountsWallets } from "@aztec/accounts/testing";
import {
  Fr,
  GrumpkinScalar,
  createPXEClient,
  Contract,
  AztecAddress,
} from "@aztec/aztec.js";
import {
  TokenContract,
  TokenContractArtifact,
} from "@aztec/noir-contracts.js/Token";

import { createPublicClient, http, formatUnits, Address, erc20Abi } from "viem";
import { anvil } from "viem/chains";

import web3Config from "../web3Config";

export const fetchAztecTokenBalance = async (wallet) => {
  const l2Token =
    // Buffer.from(
    "0x295142a86cddcf8d5942f46ae5a258105b036c4a6afe76aae899eecf6cc15efa";
  //   "hex"
  // );

  const PXE_URL = "http://localhost:8080";
  const pxe = createPXEClient(PXE_URL);
  // docs:end:define_account_vars

  // docs:start:create_wallet
  // Use a pre-funded wallet to pay for the fees for the deployments.
  const testwallet = (await getDeployedTestAccountsWallets(pxe))[0];

  console.log(wallet);
  console.log(testwallet.getAddress().toString("hex"));

  // const deployedContract = await TokenContract.deploy(
  //   testwallet, // wallet instance
  //   testwallet.getAddress(), // account
  //   "TokenName", // constructor arg1
  //   "TokenSymbol", // constructor arg2
  //   18
  // )
  //   .send()
  //   .deployed();

  // console.log(deployedContract);
  // console.log(deployedContract.address);

  const secretKey = Fr.random();
  const signingPrivateKey = GrumpkinScalar.random();
  const newAccount = await getSchnorrAccount(pxe, secretKey, signingPrivateKey);
  await newAccount.deploy({ deployWallet: wallet }).wait();
  const newWallet = await newAccount.getWallet();

  const contract = await Contract.at(
    // deployedContract.address,
    l2Token,
    TokenContractArtifact,
    testwallet
    // wallet
    // newWallet
  );

  const balance = await contract.methods
    .balance_of_public(
      // wallet
      // testwallet
      newWallet.getAddress()
    )
    .simulate();

  return balance;
};

/**
 * Browser Utils
 */

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

/**
 * Aztec Utils
 */

export const generateAztecWallet = async () => {
  const WALLET_COOKIE_NAME = "aztec_wallet_data";

  const existingWalletData = getCookie(WALLET_COOKIE_NAME) as WalletData | null;

  if (
    existingWalletData &&
    existingWalletData.address &&
    existingWalletData.privateKey
  ) {
    console.log("Using existing wallet from cookie");

    const addressHex = existingWalletData.address.startsWith("0x")
      ? existingWalletData.address.slice(2)
      : existingWalletData.address;

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

  const address =
    newWallet.account.address.address.xCoord.asBuffer.toString("hex");
  const pKey = newWallet.secretKey.asBuffer.toString("hex");
  const sigKey =
    newWallet.account.authWitnessProvider.signingPrivateKey.asBuffer.toString(
      "hex"
    );

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

/**
 * EVM Utils
 */

export const fetchEthereumBalances = async (address: string) => {
  const tokenAddresses = web3Config.tokens.ethereum;

  try {
    const publicClient = createPublicClient({
      chain: anvil,
      transport: http(),
    });

    const balancePromises = Object.entries(tokenAddresses).map(
      async ([symbol, tokenAddress]) => {
        const decimals = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        });

        const balance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as Address],
        });

        const formattedBalance = formatUnits(balance, decimals);

        return {
          symbol,
          balance: formattedBalance,
          decimals,
        };
      }
    );

    const balances = await Promise.all(balancePromises);
    return balances;
  } catch (error) {
    console.error("Error fetching Ethereum balances:", error);

    return Object.keys(tokenAddresses).map((symbol) => ({
      symbol,
      balance: "0",
      // decimals: symbol === "USDC" || symbol === "USDT" ? 6 : 18,
      decimals: 18,
    }));
  }
};
