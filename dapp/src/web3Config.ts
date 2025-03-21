const web3Config = {
  PXE_URL: "http://localhost:8080",
  ETHEREUM_HOSTS: "http://localhost:8545",
  contracts: {
    ethereum: {
      L1_Portal: "",
      L1_Token: "",
      L1_Uniswap_Portal: "",
    },
    aztec: {
      L2_Bridge: "",
      L2_Token: "",
    },
  },
  tokens: {
    ethereum: {
      DAI: "0x",
      USDC: "0x",
    },
    aztec: {
      DAI: "0x",
      USDC: "0x",
    },
  },
  wallet: {
    aztec: {
      createDefaultBurner: true,
    },
  },
};

export default web3Config;
