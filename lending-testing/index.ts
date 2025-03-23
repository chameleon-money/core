import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";
import {
  type AztecAddress,
  type AztecNode,
  EthAddress,
  Fr,
  L1TokenManager,
  L1TokenPortalManager,
  type SendMethodOptions,
  createAztecNodeClient,
  createLogger,
  createPXEClient,
  generateClaimSecret,
  retryUntil,
  waitForPXE,
} from "@aztec/aztec.js";
import {
  createL1Clients,
  deployL1Contract,
  extractEvent,
  RollupContract,
} from "@aztec/ethereum";
import {
  InboxAbi,
  TestERC20Abi,
  TestERC20Bytecode,
  TokenPortalAbi,
  TokenPortalBytecode,
} from "@aztec/l1-artifacts";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { TokenBridgeContract } from "@aztec/noir-contracts.js/TokenBridge";
import { LendingProtocolArtifact } from "./artifacts/LendingProtocol.js";

import {
  type Account,
  type Client,
  getContract,
  type Chain,
  parseEther,
  toFunctionSelector,
  type Hex,
} from "viem";
import { LendingPortalArtifact } from "./artifacts/LendingPortal.js";
import { LendingContract } from "./noir-artifacts/Lending.js";
import { sha256ToField } from "@aztec/foundation/crypto";
import { CheatCodes } from "@aztec/aztec.js/testing";

const MNEMONIC = "test test test test test test test test test test test junk";
const { ETHEREUM_HOSTS = "http://localhost:8545" } = process.env;

const { walletClient, publicClient } = createL1Clients(
  ETHEREUM_HOSTS.split(","),
  MNEMONIC
);
const ownerEthAddress = walletClient.account.address;

(
  BigInt.prototype as typeof BigInt.prototype & { toJSON: () => string }
).toJSON = function () {
  return this.toString();
};

const setupSandbox = async () => {
  const { PXE_URL = "http://localhost:8080" } = process.env;
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const pxe = createPXEClient(PXE_URL);
  const aztecNode = createAztecNodeClient(PXE_URL);
  await waitForPXE(pxe);
  return { pxe, aztecNode };
};

async function deployTestERC20() {
  const constructorArgs = ["Test Token", "TEST", walletClient.account.address];

  return await deployL1Contract(
    walletClient,
    publicClient,
    TestERC20Abi,
    TestERC20Bytecode,
    constructorArgs
  ).then(({ address }) =>
    getContract({
      address: address.toString(),
      abi: TestERC20Abi,
      client: walletClient as Client,
    })
  );
}

async function deployTokenPortal() {
  return await deployL1Contract(
    walletClient,
    publicClient,
    TokenPortalAbi,
    TokenPortalBytecode,
    []
  ).then(({ address }) =>
    getContract({
      address: address.toString(),
      abi: TokenPortalAbi,
      client: walletClient as Client,
    })
  );
}

async function deployLendingProtocol() {
  return await deployL1Contract(
    walletClient,
    publicClient,
    LendingProtocolArtifact.abi,
    LendingProtocolArtifact.bytecode,
    []
  ).then(({ address }) =>
    getContract({
      address: address.toString(),
      abi: LendingProtocolArtifact.abi,
      client: walletClient as Client,
    })
  );
}

async function deployLendingPortal(lendingProtocolAddress: `0x${string}`) {
  return await deployL1Contract(
    walletClient,
    publicClient,
    LendingPortalArtifact.abi,
    LendingPortalArtifact.bytecode,
    [lendingProtocolAddress]
  ).then(({ address }) =>
    getContract({
      address: address.toString(),
      abi: LendingPortalArtifact.abi,
      client: walletClient as Client,
    })
  );
}

async function mintTokensPublicOnL2(
  tokenContract: TokenContract,
  address: AztecAddress,
  amount: bigint
) {
  await tokenContract.methods.mint_to_public(address, amount).send().wait();
}

async function makeMessageConsumable(
  aztecNode: AztecNode,
  msgHash: Fr | Hex,
  tokenContract: TokenContract,
  address: AztecAddress
) {
  const frMsgHash =
    typeof msgHash === "string" ? Fr.fromHexString(msgHash) : msgHash;
  // We poll isL1ToL2MessageSynced endpoint until the message is available
  await retryUntil(
    async () => {
      const isSynced = await aztecNode.isL1ToL2MessageSynced(frMsgHash);
      console.log("isSynced", isSynced);
      return isSynced;
    },
    "message sync",
    10
  );

  await mintTokensPublicOnL2(tokenContract, address, 0n);
  await mintTokensPublicOnL2(tokenContract, address, 0n);
  await mintTokensPublicOnL2(tokenContract, address, 0n);
}

async function wait(hash: `0x${string}`) {
  return publicClient.waitForTransactionReceipt({ hash });
}

/**
 * Plan:
 * 1. Deploy 2 token contracts, USDC and sUSDC (the share token) on both L1 and L2 ✅
 * 2. Deploy the token portal on L1 for both tokens ✅
 * 3. Deploy the token bridge on L2 for both tokens ✅
 * 4. Initialize the token portal for USDC token on L1 ✅
 * 5. Deploy the lending protocol on L1 ✅
 * 6. Add the USDC token to the lending protocol ✅
 * 7. Get the sUSDC token address from the lending protocol ✅
 * 8. Initialize the token portal for sUSDC token on L1 ✅
 * 9. Deploy the lending portal on L1 ✅
 * 10. Deploy the lending bridge on L2 ✅
 * 11. Initialize the lending portal on L1 ✅
 * 12. Mint USDC on l1 ✅
 * 13. Transfer USDC to L2 ✅
 * 14. Claim USDC on L2 ✅
 * 15. Lend the crypto on L2 ✅
 * 16. Call the lendPrivate function on L1 ✅
 * 17. Comsume the message for the share tokens on L2 ✅
 * 18. Claim the share tokens on L2 ✅
 *
 * Next Steps Borrowing (TBD)
 *
 */

async function main() {
  const logger = createLogger("aztec:lending-testing");
  const { pxe, aztecNode } = await setupSandbox();
  const wallets = await getInitialTestAccountsWallets(pxe);
  const ownerWallet = wallets[0];
  const ownerAztecAddress = wallets[0].getAddress();
  const l1ContractAddresses = (await pxe.getNodeInfo()).l1ContractAddresses;
  logger.info("L1 Contract Addresses:");
  logger.info(`Registry Address: ${l1ContractAddresses.registryAddress}`);
  logger.info(`Inbox Address: ${l1ContractAddresses.inboxAddress}`);
  logger.info(`Outbox Address: ${l1ContractAddresses.outboxAddress}`);
  logger.info(`Rollup Address: ${l1ContractAddresses.rollupAddress}`);

  const l2USDCContract = await TokenContract.deploy(
    ownerWallet,
    ownerAztecAddress,
    "L2 USDC Token",
    "L2 USDC",
    18
  )
    .send()
    .deployed();

  logger.info(`L2 USDC token contract deployed at ${l2USDCContract.address}`);

  const l1USDCContract = await deployTestERC20();
  logger.info(`usdc contract deployed ${l1USDCContract.address}`);

  const l2sUSDCContract = await TokenContract.deploy(
    ownerWallet,
    ownerAztecAddress,
    "L2 sUSDC Token",
    "L2 sUSDC",
    18
  )
    .send()
    .deployed();

  logger.info(`L2 sUSDC token contract deployed at ${l2sUSDCContract.address}`);

  const l1USDCPortal = await deployTokenPortal();
  logger.info(`L1 USDC portal contract deployed ${l1USDCPortal.address}`);

  const l1sUSDCPortal = await deployTokenPortal();
  logger.info(`L1 sUSDC portal contract deployed ${l1sUSDCPortal.address}`);

  const l2USDCBridgeContract = await TokenBridgeContract.deploy(
    ownerWallet,
    l2USDCContract.address,
    EthAddress.fromString(l1USDCPortal.address)
  )
    .send()
    .deployed();

  logger.info(
    `L2 USDC token bridge contract deployed at ${l2USDCBridgeContract.address}`
  );

  await l2USDCContract.methods
    .set_minter(l2USDCBridgeContract.address, true)
    .send()
    .wait();

  const l2sUSDCBridgeContract = await TokenBridgeContract.deploy(
    ownerWallet,
    l2sUSDCContract.address,
    EthAddress.fromString(l1sUSDCPortal.address)
  )
    .send()
    .deployed();

  await l2sUSDCContract.methods
    .set_minter(l2sUSDCBridgeContract.address, true)
    .send()
    .wait();

  await l1USDCPortal.write
    .initialize(
      [
        l1ContractAddresses.registryAddress.toString(),
        l1USDCContract.address,
        l2USDCBridgeContract.address.toString(),
      ],
      {
        account: walletClient.account as Account,
        chain: walletClient.chain as Chain,
      }
    )
    .then(wait);
  logger.info("L1 USDC portal contract initialized");

  const lendingProtocol = await deployLendingProtocol();
  logger.info(`Lending protocol deployed ${lendingProtocol.address}`);

  await lendingProtocol.write
    .addAsset([l1USDCContract.address, "sUSDC", "sUSDC"], {
      account: walletClient.account as Account,
      chain: walletClient.chain as Chain,
    })
    .then(wait);

  logger.info("Lending protocol asset added");

  const l1sUSDCContract = getContract({
    address: (await lendingProtocol.read.assets([l1USDCContract.address]))[1],
    abi: TestERC20Abi,
    client: walletClient as Client,
  });
  logger.info(
    `L1 sUSDC contract address ${l1sUSDCContract.address.toString()}`
  );

  await l1sUSDCPortal.write
    .initialize(
      [
        l1ContractAddresses.registryAddress.toString(),
        l1sUSDCContract.address,
        l2sUSDCBridgeContract.address.toString(),
      ],
      {
        account: walletClient.account as Account,
        chain: walletClient.chain as Chain,
      }
    )
    .then(wait);

  logger.info("L1 sUSDC portal contract initialized");

  const l1LendingPortal = await deployLendingPortal(lendingProtocol.address);
  logger.info(`L1 lending portal contract deployed ${l1LendingPortal.address}`);

  const l2LendingBridge = await LendingContract.deploy(
    ownerWallet,
    EthAddress.fromString(l1LendingPortal.address)
  )
    .send()
    .deployed();

  logger.info(`L2 lending bridge contract deployed ${l2LendingBridge.address}`);

  await l1LendingPortal.write
    .initialize(
      [
        l1ContractAddresses.registryAddress.toString(),
        l2LendingBridge.address.toString(),
      ],
      {
        account: walletClient.account as Account,
        chain: walletClient.chain as Chain,
      }
    )
    .then(wait);

  await l1LendingPortal.write
    .addPortal([l1USDCContract.address, l1USDCPortal.address], {
      account: walletClient.account as Account,
      chain: walletClient.chain as Chain,
    })
    .then(wait);

  await l1LendingPortal.write
    .addPortal([l1sUSDCContract.address, l1sUSDCPortal.address], {
      account: walletClient.account as Account,
      chain: walletClient.chain as Chain,
    })
    .then(wait);

  logger.info("L1 lending portal contract initialized");

  await l1USDCContract.write
    .mint([ownerEthAddress, parseEther("100")], {
      account: walletClient.account as Account,
      chain: walletClient.chain as Chain,
    })
    .then(wait);

  const bridgeAmount = parseEther("50");

  await l1USDCContract.write
    .approve([l1USDCPortal.address, bridgeAmount], {
      account: walletClient.account as Account,
      chain: walletClient.chain as Chain,
    })
    .then(wait);

  const [secret, secretHash] = await generateClaimSecret(logger);
  logger.info(`Secret: ${secret}`);
  logger.info(`Secret Hash: ${secretHash}`);

  const receipt = await l1USDCPortal.write
    .depositToAztecPublic(
      [ownerAztecAddress.toString(), bridgeAmount, secretHash.toString()],
      {
        account: walletClient.account as Account,
        chain: walletClient.chain as Chain,
      }
    )
    .then(wait);

  logger.info("L1 USDC contract deposit to Aztec public");

  const log = extractEvent(
    receipt.logs,
    l1USDCPortal.address,
    l1USDCPortal.abi,
    "DepositToAztecPublic",
    (log) =>
      log.args.secretHash === secretHash.toString() &&
      log.args.amount === bridgeAmount &&
      log.args.to === ownerAztecAddress.toString(),
    logger
  );

  logger.info(`Deposit to Aztec public event logged: ${JSON.stringify(log)}`);

  // 2 unrelated transactions
  await l2USDCContract.methods
    .mint_to_public(ownerAztecAddress, 0n)
    .send()
    .wait();
  await l2USDCContract.methods
    .mint_to_public(ownerAztecAddress, 0n)
    .send()
    .wait();

  logger.info("L2 USDC contract mint to public");

  await l2USDCBridgeContract.methods
    .claim_public(ownerAztecAddress, bridgeAmount, secret, log.args.index)
    .send()
    .wait();

  logger.info("L2 USDC contract claim public");

  const balance = await l2USDCContract.methods
    .balance_of_public(ownerAztecAddress)
    .simulate();
  logger.info(`L2 USDC balance of ${ownerAztecAddress} is ${balance}`);

  await l2USDCContract.methods
    .transfer_to_private(ownerAztecAddress, bridgeAmount)
    .send()
    .wait();

  const [secret2, secretHash2] = await generateClaimSecret(logger);

  const nonceForUSDCTransferToPublicApproval = new Fr(1n);
  const transferToPublicAuhtwit = await ownerWallet.createAuthWit({
    caller: l2LendingBridge.address,
    action: l2USDCContract.methods.transfer_to_public(
      ownerAztecAddress,
      l2LendingBridge.address,
      bridgeAmount,
      nonceForUSDCTransferToPublicApproval
    ),
  });

  const transactionReceipt = await l2LendingBridge.methods
    .lend_private(
      l2USDCContract,
      l2USDCBridgeContract,
      bridgeAmount,
      nonceForUSDCTransferToPublicApproval,
      secretHash2,
      EthAddress.fromString(ownerEthAddress)
    )
    .send({
      authWitnesses: [transferToPublicAuhtwit],
    } as unknown as SendMethodOptions)
    .wait();

  logger.info("L2 lending bridge lend public");

  logger.info(
    `Lending bridge lend public event logged: ${JSON.stringify(
      transactionReceipt
    )}`
  );

  const lendPrivateFunction = "lend_private(address,uint256,bytes32,address)";
  const lendPrivateContent = sha256ToField([
    Buffer.from(toFunctionSelector(lendPrivateFunction).substring(2), "hex"),
    EthAddress.fromString(l1USDCPortal.address).toBuffer32(),
    new Fr(bridgeAmount),
    secretHash2,
    EthAddress.fromString(ownerEthAddress).toBuffer32(),
  ]);

  const lendPrivateLeaf = sha256ToField([
    l2LendingBridge.address,
    new Fr(1), // aztec version
    EthAddress.fromString(l1LendingPortal.address).toBuffer32(),
    new Fr(publicClient.chain.id), // chain id
    lendPrivateContent,
  ]);

  const withdrawContent = sha256ToField([
    Buffer.from(
      toFunctionSelector("withdraw(address,uint256,address)").substring(2),
      "hex"
    ),
    EthAddress.fromString(l1LendingPortal.address).toBuffer32(),
    new Fr(bridgeAmount),
    EthAddress.fromString(l1LendingPortal.address).toBuffer32(),
  ]);

  const withdrawLeaf = sha256ToField([
    l2USDCBridgeContract.address,
    new Fr(1), // aztec version
    EthAddress.fromString(l1USDCPortal.address).toBuffer32(),
    new Fr(publicClient.chain.id), // chain id
    withdrawContent,
  ]);

  const cheatCodes = await CheatCodes.create(["http://localhost:8545"], pxe);

  const rollup = new RollupContract(
    publicClient,
    l1ContractAddresses.rollupAddress
  );

  await cheatCodes.rollup.markAsProven(await rollup.getBlockNumber());

  logger.info("Execute withdraw and lend on the lendingPortal!");
  logger.info("Info: ", {
    blockNumber: transactionReceipt.blockNumber,
    lendPrivateLeaf: lendPrivateLeaf.toString(),
  });
  const [lendPrivateL2MessageIndex, lendPrivateSiblingPath] =
    await aztecNode.getL2ToL1MessageMembershipWitness(
      transactionReceipt.blockNumber ?? 0,
      lendPrivateLeaf
    );
  const [withdrawL2MessageIndex, withdrawSiblingPath] =
    await aztecNode.getL2ToL1MessageMembershipWitness(
      transactionReceipt.blockNumber ?? 0,
      withdrawLeaf
    );

  const withdrawMessageMetadata = {
    _l2BlockNumber: BigInt(transactionReceipt.blockNumber ?? 0),
    _leafIndex: BigInt(withdrawL2MessageIndex),
    _path: withdrawSiblingPath
      .toBufferArray()
      .map(
        (buf: Buffer) => `0x${buf.toString("hex")}`
      ) as readonly `0x${string}`[],
  };

  const lendPrivateMessageMetadata = {
    _l2BlockNumber: BigInt(transactionReceipt.blockNumber ?? 0),
    _leafIndex: BigInt(lendPrivateL2MessageIndex),
    _path: lendPrivateSiblingPath
      .toBufferArray()
      .map(
        (buf: Buffer) => `0x${buf.toString("hex")}`
      ) as readonly `0x${string}`[],
  };

  const initialBalance = await l1sUSDCContract.read.balanceOf([
    l1sUSDCPortal.address,
  ]);

  const receipt2 = await l1LendingPortal.write
    .lendPrivate(
      [
        l1USDCPortal.address,
        bridgeAmount,
        secretHash2.toString(),
        true,
        [withdrawMessageMetadata, lendPrivateMessageMetadata],
      ],
      {
        account: walletClient.account as Account,
        chain: walletClient.chain as Chain,
      }
    )
    .then(wait);

  logger.info("L1 lending portal lend private");

  const inboxAddress = l1ContractAddresses.inboxAddress.toString();
  const txLog = extractEvent(
    receipt2.logs,
    inboxAddress,
    InboxAbi,
    "MessageSent"
  );
  const tokenOutMsgHash = Fr.fromHexString(txLog.args.hash);
  const tokenOutMsgIndex = txLog.args.index;

  const finalBalance = await l1sUSDCContract.read.balanceOf([
    l1sUSDCPortal.address,
  ]);

  await makeMessageConsumable(
    aztecNode,
    tokenOutMsgHash,
    l2sUSDCContract,
    ownerAztecAddress
  );

  await l2sUSDCBridgeContract.methods
    .claim_private(
      ownerAztecAddress,
      finalBalance - initialBalance,
      secret2,
      tokenOutMsgIndex
    )
    .send()
    .wait();

  logger.info("L2 sUSDC contract claim private");

  const balance2 = await l2sUSDCContract.methods
    .balance_of_private(ownerAztecAddress)
    .simulate();
  logger.info(`L2 sUSDC balance of ${ownerAztecAddress} is ${balance2}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
