const web3Config = {
  PXE_URL: "http://localhost:8080",
  ETHEREUM_HOSTS: "http://localhost:8545",
  contracts: {
    ethereum: {
      L1_Portal: "0x3aade2dcd2df6a8cac689ee797591b2913658659",
      L1_Token: "",
      L1_Uniswap_Portal: "",
    },
    aztec: {
      L2_Bridge:
        "0x24bb35b7241dd7cd0cd782d9c8b40c69a9f5a9e1c56937bccec532374fff85ea",
      L2_Token:
        "0x0572ebc00529cc9f693d4fcb371e22536351dc8b99756b02c5a87080e4e99ac6",
    },
  },
  tokens: {
    ethereum: {
      DAI: "0x",
      USDC: "0x",
    },
    aztec: {
      DAI: "0x0572ebc00529cc9f693d4fcb371e22536351dc8b99756b02c5a87080e4e99ac6",
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
