import {
  createAztecNodeClient,
  createPXEClient,
  FeeJuicePaymentMethod,
  makeFetch,
  ProtocolContractAddress,
  SignerlessWallet,
  waitForPXE,
  type Logger,
  type PXE,
} from "@aztec/aztec.js";
import { CheatCodes } from "@aztec/aztec.js/testing";
import {
  createL1Clients,
  type DeployL1ContractsReturnType,
} from "@aztec/ethereum";
import type { HDAccount, PrivateKeyAccount } from "viem";
import { foundry } from "viem/chains";
import {
  getDeployedTestAccounts,
  getDeployedTestAccountsWallets,
} from "@aztec/accounts/testing";
import { FEE_JUICE_INITIAL_MINT } from "@aztec/constants";
import { Gas } from "@aztec/stdlib/gas";
import { inspect } from "util";
import { FeeJuiceContract } from "@aztec/noir-contracts.js/FeeJuice";

const { PXE_URL = "http://localhost:8080" } = process.env;
const getAztecUrl = () => PXE_URL;

export async function setupCanonicalFeeJuice(logger: Logger, pxe: PXE) {
  // "deploy" the Fee Juice as it contains public functions
  const feeJuicePortalAddress = (await pxe.getNodeInfo()).l1ContractAddresses
    .feeJuicePortalAddress;
  const wallet = new SignerlessWallet(pxe);
  const feeJuice = await FeeJuiceContract.at(
    ProtocolContractAddress.FeeJuice,
    wallet
  );

  try {
    const paymentMethod = new FeeJuicePaymentMethod(
      ProtocolContractAddress.FeeJuice
    );
    await feeJuice.methods
      .initialize(feeJuicePortalAddress, FEE_JUICE_INITIAL_MINT)
      .send({
        fee: { paymentMethod, gasSettings: { teardownGasLimits: Gas.empty() } },
      })
      .wait();
    logger.info(
      `Fee Juice successfully setup. Portal address: ${feeJuicePortalAddress}`
    );
  } catch (error) {
    logger.warn(
      `Fee Juice might have already been setup. Got error: ${inspect(error)}.`
    );
  }
}

export async function setupWithRemoteEnvironment(
  account: HDAccount | PrivateKeyAccount,
  logger: Logger,
  numberOfAccounts: number,
  l1RpcUrls: string[]
) {
  // we are setting up against a remote environment, l1 contracts are already deployed
  const aztecNodeUrl = getAztecUrl();
  logger.verbose(`Creating Aztec Node client to remote host ${aztecNodeUrl}`);
  const aztecNode = createAztecNodeClient(aztecNodeUrl);
  logger.verbose(`Creating PXE client to remote host ${PXE_URL}`);
  const pxeClient = createPXEClient(PXE_URL, {}, makeFetch([1, 2, 3], true));
  await waitForPXE(pxeClient, logger);
  logger.verbose("JSON RPC client connected to PXE");
  logger.verbose(`Retrieving contract addresses from ${PXE_URL}`);
  const l1Contracts = (await pxeClient.getNodeInfo()).l1ContractAddresses;

  const { walletClient, publicClient } = createL1Clients(
    l1RpcUrls,
    account,
    foundry
  );

  const deployL1ContractsValues: DeployL1ContractsReturnType = {
    l1ContractAddresses: l1Contracts,
    walletClient,
    publicClient,
  };
  const cheatCodes = await CheatCodes.create(l1RpcUrls, pxeClient!);
  const teardown = () => Promise.resolve();

  await setupCanonicalFeeJuice(logger, pxeClient);

  logger.verbose(
    "Constructing available wallets from already registered accounts..."
  );
  const initialFundedAccounts = await getDeployedTestAccounts(pxeClient);
  const wallets = await getDeployedTestAccountsWallets(pxeClient);

  if (wallets.length < numberOfAccounts) {
    throw new Error(
      `Required ${numberOfAccounts} accounts. Found ${wallets.length}.`
    );
    // Deploy new accounts if there's a test that requires more funded accounts in the remote environment.
  }

  return {
    aztecNode,
    sequencer: undefined,
    proverNode: undefined,
    pxe: pxeClient,
    deployL1ContractsValues,
    accounts: await pxeClient!.getRegisteredAccounts(),
    initialFundedAccounts,
    wallet: wallets[0],
    wallets: wallets.slice(0, numberOfAccounts),
    logger,
    cheatCodes,
    watcher: undefined,
    dateProvider: undefined,
    blobSink: undefined,
    telemetryClient: undefined,
    teardown,
  };
}
