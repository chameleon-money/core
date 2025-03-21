import type { UniswapSetupContext } from "./shared/uniswap_l1_l2.js";

import { foundry } from "viem/chains";
import { createL1Clients } from "@aztec/ethereum";
import { setupWithRemoteEnvironment } from "./utils-steps/setupWithRemoteEnvironment";
import { privateKeyToAccount } from "viem/accounts";
import { createLogger } from "@aztec/aztec.js";
import { uniswapL1L2TestSuite } from "./shared/uniswap_l1_l2";
import { loadChainState } from "./utils-steps/loadChainState.js";

const l1RpcUrls = ["http://localhost:8545"];
const account = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const logger = createLogger("aztec-node");

// This tests works on forked mainnet. There is a dump of the data in `dumpedState` such that we
// don't need to burn through RPC requests.
const dumpedState = "src/fixtures/dumps/uniswap_state";
// When taking a dump use the block number of the fork to improve speed.
const EXPECTED_FORKED_BLOCK = 0; //17514288;

let teardown: () => Promise<void>;

// docs:start:uniswap_setup
const testSetup = async (): Promise<UniswapSetupContext> => {
  const { publicClient: p } = createL1Clients(l1RpcUrls, account, foundry);
  await loadChainState(p, dumpedState);

  const {
    aztecNode,
    teardown: teardown_,
    pxe,
    deployL1ContractsValues,
    wallets,
    cheatCodes,
  } = await setupWithRemoteEnvironment(account, logger, 2, l1RpcUrls);

  const walletClient = deployL1ContractsValues.walletClient;
  const publicClient = deployL1ContractsValues.publicClient;

  const ownerWallet = wallets[0];
  const sponsorWallet = wallets[1];

  teardown = teardown_;

  return {
    aztecNode,
    pxe,
    logger,
    publicClient,
    walletClient,
    ownerWallet,
    sponsorWallet,
    deployL1ContractsValues,
    cheatCodes,
  };
};
// docs:end:uniswap_setup

const testCleanup = async () => {
  await teardown();
};

uniswapL1L2TestSuite(testSetup, testCleanup, EXPECTED_FORKED_BLOCK);
