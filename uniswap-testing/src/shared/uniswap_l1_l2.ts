import {
  type AccountWallet,
  AztecAddress,
  type AztecNode,
  BatchCall,
  EthAddress,
  Fr,
  type Logger,
  type PXE,
  type Wallet,
  computeAuthWitMessageHash,
  deployInstance,
  generateClaimSecret,
  getContractClassFromArtifact,
  registerContractClass,
} from "@aztec/aztec.js";
import type { CheatCodes } from "@aztec/aztec.js/testing";
import {
  type DeployL1ContractsReturnType,
  RollupContract,
  type ViemPublicClient,
  type ViemWalletClient,
  deployL1Contract,
  extractEvent,
} from "@aztec/ethereum";
import { sha256ToField } from "@aztec/foundation/crypto";
import {
  InboxAbi,
  UniswapPortalAbi,
  UniswapPortalBytecode,
} from "@aztec/l1-artifacts";
import { UniswapContract } from "@aztec/noir-contracts.js/Uniswap";

import {
  type GetContractReturnType,
  getContract,
  parseEther,
  toFunctionSelector,
} from "viem";

import { CrossChainTestHarness } from "./cross_chain_test_harness.js";
import { SchnorrAccountContractArtifact } from "@aztec/accounts/schnorr";
import { expect } from "bun:test";

export async function ensureAccountsPubliclyDeployed(
  sender: Wallet,
  accountsToDeploy: Wallet[]
) {
  // We have to check whether the accounts are already deployed. This can happen if the test runs against
  // the sandbox and the test accounts exist
  let accountsAndAddresses = await Promise.all(
    accountsToDeploy.map(async (account) => {
      let address = account.getAddress();
      return {
        address,
        deployed: (await sender.getContractMetadata(address))
          .isContractPubliclyDeployed,
      };
    })
  );
  let instances = (
    await Promise.all(
      accountsAndAddresses
        .filter(({ deployed }) => !deployed)
        .map(({ address }) => sender.getContractMetadata(address))
    )
  ).map((contractMetadata) => contractMetadata.contractInstance);
  let contractClass = await getContractClassFromArtifact(
    SchnorrAccountContractArtifact
  );
  if (
    !(await sender.getContractClassMetadata(contractClass.id, true))
      .isContractClassPubliclyRegistered
  ) {
    await (await registerContractClass(sender, SchnorrAccountContractArtifact))
      .send()
      .wait();
  }
  let requests = await Promise.all(
    instances.map(async (instance) => await deployInstance(sender, instance!))
  );
  let batch = new BatchCall(sender, requests);
  await batch.send().wait();
}

// PSA: This tests works on forked mainnet. There is a dump of the data in `dumpedState` such that we
// don't need to burn through RPC requests.
// To generate a new dump, use the `dumpChainState` cheatcode.
// To start an actual fork, use the command:
// anvil --fork-url https://mainnet.infura.io/v3/9928b52099854248b3a096be07a6b23c --fork-block-number 17514288 --chain-id 31337
// For CI, this is configured in `run_tests.sh` and `docker-compose-images.yml`

// docs:start:uniswap_l1_l2_test_setup_const
let TIMEOUT = 360_000;

/** Objects to be returned by the uniswap setup function */
export type UniswapSetupContext = {
  /** Aztec Node instance */
  aztecNode: AztecNode;
  /** The Private eXecution Environment (PXE). */
  pxe: PXE;
  /** Logger instance named as the current test. */
  logger: Logger;
  /** Viem Public client instance. */
  publicClient: ViemPublicClient;
  /** Viem Wallet Client instance. */
  walletClient: ViemWalletClient;
  /** The owner wallet. */
  ownerWallet: AccountWallet;
  /** The sponsor wallet. */
  sponsorWallet: AccountWallet;
  /**  */
  deployL1ContractsValues: DeployL1ContractsReturnType;
  /** Cheat codes instance. */
  cheatCodes: CheatCodes;
};
// docs:end:uniswap_l1_l2_test_setup_const

export let uniswapL1L2TestSuite = async (
  setup: () => Promise<UniswapSetupContext>,
  cleanup: () => Promise<void>,
  expectedForkBlockNumber = 17514288
) => {
  // docs:start:uniswap_l1_l2_test_beforeAll
  let WETH9_ADDRESS: EthAddress = EthAddress.fromString(
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  );
  let DAI_ADDRESS: EthAddress = EthAddress.fromString(
    "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  );

  let aztecNode: AztecNode;
  let pxe: PXE;
  let logger: Logger;

  let walletClient: ViemWalletClient;
  let publicClient: ViemPublicClient;

  let ownerWallet: AccountWallet;
  let ownerAddress: AztecAddress;
  let ownerEthAddress: EthAddress;
  // does transactions on behalf of owner on Aztec:
  let sponsorWallet: AccountWallet;
  // let sponsorAddress: AztecAddress;

  let daiCrossChainHarness: CrossChainTestHarness;
  let wethCrossChainHarness: CrossChainTestHarness;

  let deployL1ContractsValues: DeployL1ContractsReturnType;
  let rollup: RollupContract;
  let uniswapPortal: GetContractReturnType<
    typeof UniswapPortalAbi,
    ViemWalletClient
  >;
  let uniswapPortalAddress: EthAddress;
  let uniswapL2Contract: UniswapContract;

  let wethAmountToBridge = parseEther("1");
  let uniswapFeeTier = 3000n;
  let minimumOutputAmount = 0n;

  let cheatCodes: CheatCodes;

  ({
    aztecNode,
    pxe,
    logger,
    publicClient,
    walletClient,
    ownerWallet,
    sponsorWallet,
    deployL1ContractsValues,
    cheatCodes,
  } = await setup());

  if (Number(await publicClient.getBlockNumber()) < expectedForkBlockNumber) {
    throw new Error(
      "This test must be run on a fork of mainnet with the expected fork block"
    );
  }

  rollup = new RollupContract(
    deployL1ContractsValues.publicClient,
    deployL1ContractsValues.l1ContractAddresses.rollupAddress
  );

  ownerAddress = ownerWallet.getAddress();
  // sponsorAddress = sponsorWallet.getAddress();
  ownerEthAddress = EthAddress.fromString(
    (await walletClient.getAddresses())[0]
  );

  await ensureAccountsPubliclyDeployed(ownerWallet, [
    ownerWallet,
    sponsorWallet,
  ]);

  logger.info(
    "Deploying DAI Portal, initializing and deploying l2 contract..."
  );
  daiCrossChainHarness = await CrossChainTestHarness.new(
    aztecNode,
    pxe,
    publicClient,
    walletClient,
    ownerWallet,
    logger,
    DAI_ADDRESS
  );

  logger.info(
    "Deploying WETH Portal, initializing and deploying l2 contract..."
  );
  wethCrossChainHarness = await CrossChainTestHarness.new(
    aztecNode,
    pxe,
    publicClient,
    walletClient,
    ownerWallet,
    logger,
    WETH9_ADDRESS
  );

  logger.info("Deploy Uniswap portal on L1 and L2...");
  uniswapPortalAddress = await deployL1Contract(
    walletClient,
    publicClient,
    UniswapPortalAbi,
    UniswapPortalBytecode
  ).then(({ address }) => address);

  uniswapPortal = getContract({
    address: uniswapPortalAddress.toString(),
    abi: UniswapPortalAbi,
    client: walletClient,
  });
  // deploy l2 uniswap contract and attach to portal
  uniswapL2Contract = await UniswapContract.deploy(
    ownerWallet,
    uniswapPortalAddress
  )
    .send()
    .deployed();

  let registryAddress = (await pxe.getNodeInfo()).l1ContractAddresses
    .registryAddress;

  await uniswapPortal.write.initialize(
    [registryAddress.toString(), uniswapL2Contract.address.toString()],
    {} as any
  );

  // Give me some WETH so I can deposit to L2 and do the swap...
  logger.info("Getting some weth");
  let hash = await walletClient.sendTransaction({
    to: WETH9_ADDRESS.toString(),
    value: parseEther("1000"),
  });
  await publicClient.waitForTransactionReceipt({ hash });

  let wethBalance = await wethCrossChainHarness.getL1BalanceOf(ownerEthAddress);
  expect(wethBalance).toBe(parseEther("1000"));
  // docs:end:uniswap_l1_l2_test_beforeAll

  // docs:start:uniswap_private
  console.log(
    "should uniswap trade on L1 from L2 funds privately (swaps WETH -> DAI)"
  );
  let wethL1BeforeBalance = await wethCrossChainHarness.getL1BalanceOf(
    ownerEthAddress
  );

  // 1. Approve and deposit weth to the portal and move to L2
  let wethDepositClaim = await wethCrossChainHarness.sendTokensToPortalPrivate(
    wethAmountToBridge
  );

  // funds transferred from owner to token portal
  expect(await wethCrossChainHarness.getL1BalanceOf(ownerEthAddress)).toEqual(
    wethL1BeforeBalance - wethAmountToBridge
  );
  expect(
    await wethCrossChainHarness.getL1BalanceOf(
      wethCrossChainHarness.tokenPortalAddress
    )
  ).toEqual(wethAmountToBridge);

  await wethCrossChainHarness.makeMessageConsumable(
    Fr.fromHexString(wethDepositClaim.messageHash)
  );

  // 2. Claim WETH on L2
  logger.info("Minting weth on L2");
  await wethCrossChainHarness.consumeMessageOnAztecAndMintPrivately(
    wethDepositClaim
  );
  await wethCrossChainHarness.expectPrivateBalanceOnL2(
    ownerAddress,
    wethAmountToBridge
  );

  // Store balances
  let wethL2BalanceBeforeSwap =
    await wethCrossChainHarness.getL2PrivateBalanceOf(ownerAddress);
  let daiL2BalanceBeforeSwap = await daiCrossChainHarness.getL2PrivateBalanceOf(
    ownerAddress
  );

  // 3. Owner gives uniswap approval to transfer the funds to public to self on its behalf
  logger.info(
    "Approving uniswap to transfer funds to public to self on my behalf"
  );
  let nonceForWETHTransferToPublicApproval = new Fr(1n);
  let transferToPublicAuhtwit = await ownerWallet.createAuthWit({
    caller: uniswapL2Contract.address,
    action: wethCrossChainHarness.l2Token.methods.transfer_to_public(
      ownerAddress,
      uniswapL2Contract.address,
      wethAmountToBridge,
      nonceForWETHTransferToPublicApproval
    ),
  });

  // 4. Swap on L1 - sends L2 to L1 message to withdraw WETH to L1 and another message to swap assets.
  logger.info("Withdrawing weth to L1 and sending message to swap to dai");
  let [secretForDepositingSwappedDai, secretHashForDepositingSwappedDai] =
    await generateClaimSecret();

  let l2UniswapInteractionReceipt = await uniswapL2Contract.methods
    .swap_private(
      wethCrossChainHarness.l2Token.address,
      wethCrossChainHarness.l2Bridge.address,
      wethAmountToBridge,
      daiCrossChainHarness.l2Bridge.address,
      nonceForWETHTransferToPublicApproval,
      uniswapFeeTier,
      minimumOutputAmount,
      secretHashForDepositingSwappedDai,
      ownerEthAddress
    )
    .send({ authWitnesses: [transferToPublicAuhtwit] })
    .wait();

  let swapPrivateFunction =
    "swap_private(address,uint256,uint24,address,uint256,bytes32,address)";
  let swapPrivateContent = sha256ToField([
    Buffer.from(toFunctionSelector(swapPrivateFunction).substring(2), "hex"),
    wethCrossChainHarness.tokenPortalAddress.toBuffer32(),
    new Fr(wethAmountToBridge),
    new Fr(uniswapFeeTier),
    daiCrossChainHarness.tokenPortalAddress.toBuffer32(),
    new Fr(minimumOutputAmount),
    secretHashForDepositingSwappedDai,
    ownerEthAddress.toBuffer32(),
  ]);

  let swapPrivateLeaf = sha256ToField([
    uniswapL2Contract.address,
    new Fr(1), // aztec version
    EthAddress.fromString(uniswapPortal.address).toBuffer32(),
    new Fr(publicClient.chain.id), // chain id
    swapPrivateContent,
  ]);

  let withdrawContent = sha256ToField([
    Buffer.from(
      toFunctionSelector("withdraw(address,uint256,address)").substring(2),
      "hex"
    ),
    uniswapPortalAddress.toBuffer32(),
    new Fr(wethAmountToBridge),
    uniswapPortalAddress.toBuffer32(),
  ]);

  let withdrawLeaf = sha256ToField([
    wethCrossChainHarness.l2Bridge.address,
    new Fr(1), // aztec version
    wethCrossChainHarness.tokenPortalAddress.toBuffer32(),
    new Fr(publicClient.chain.id), // chain id
    withdrawContent,
  ]);

  // ensure that user's funds were burnt
  await wethCrossChainHarness.expectPrivateBalanceOnL2(
    ownerAddress,
    wethL2BalanceBeforeSwap - wethAmountToBridge
  );
  // ensure that uniswap contract didn't eat the funds.
  await wethCrossChainHarness.expectPublicBalanceOnL2(
    uniswapL2Contract.address,
    0n
  );

  // Since the outbox is only consumable when the block is proven, we need to set the block to be proven
  await cheatCodes.rollup.markAsProven(await rollup.getBlockNumber());

  // 5. Consume L2 to L1 message by calling uniswapPortal.swap_private()
  logger.info("Execute withdraw and swap on the uniswapPortal!");
  let daiL1BalanceOfPortalBeforeSwap =
    await daiCrossChainHarness.getL1BalanceOf(
      daiCrossChainHarness.tokenPortalAddress
    );

  let [swapPrivateL2MessageIndex, swapPrivateSiblingPath] =
    await aztecNode.getL2ToL1MessageMembershipWitness(
      l2UniswapInteractionReceipt.blockNumber!,
      swapPrivateLeaf
    );
  let [withdrawL2MessageIndex, withdrawSiblingPath] =
    await aztecNode.getL2ToL1MessageMembershipWitness(
      l2UniswapInteractionReceipt.blockNumber!,
      withdrawLeaf
    );

  let withdrawMessageMetadata = {
    _l2BlockNumber: BigInt(l2UniswapInteractionReceipt.blockNumber!),
    _leafIndex: BigInt(withdrawL2MessageIndex),
    _path: withdrawSiblingPath
      .toBufferArray()
      .map(
        (buf: Buffer) => `0x${buf.toString("hex")}`
      ) as readonly `0x${string}`[],
  };

  let swapPrivateMessageMetadata = {
    _l2BlockNumber: BigInt(l2UniswapInteractionReceipt.blockNumber!),
    _leafIndex: BigInt(swapPrivateL2MessageIndex),
    _path: swapPrivateSiblingPath
      .toBufferArray()
      .map(
        (buf: Buffer) => `0x${buf.toString("hex")}`
      ) as readonly `0x${string}`[],
  };

  let swapArgs = [
    wethCrossChainHarness.tokenPortalAddress.toString(),
    wethAmountToBridge,
    Number(uniswapFeeTier),
    daiCrossChainHarness.tokenPortalAddress.toString(),
    minimumOutputAmount,
    secretHashForDepositingSwappedDai.toString(),
    true,
    [withdrawMessageMetadata, swapPrivateMessageMetadata],
  ] as const;

  // this should also insert a message into the inbox.
  let txReceipt =
    await daiCrossChainHarness.publicClient.waitForTransactionReceipt({
      hash: await uniswapPortal.write.swapPrivate(swapArgs),
    });

  // We get the msg leaf from event so that we can later wait for it to be available for consumption
  let inboxAddress =
    daiCrossChainHarness.l1ContractAddresses.inboxAddress.toString();
  let txLog = extractEvent(
    txReceipt.logs,
    inboxAddress,
    InboxAbi,
    "MessageSent"
  );
  let tokenOutMsgHash = Fr.fromHexString(txLog.args.hash);
  let tokenOutMsgIndex = txLog.args.index;

  // weth was swapped to dai and send to portal
  let daiL1BalanceOfPortalAfter = await daiCrossChainHarness.getL1BalanceOf(
    daiCrossChainHarness.tokenPortalAddress
  );
  expect(daiL1BalanceOfPortalAfter).toBeGreaterThan(
    daiL1BalanceOfPortalBeforeSwap
  );
  let daiAmountToBridge = BigInt(
    daiL1BalanceOfPortalAfter - daiL1BalanceOfPortalBeforeSwap
  );

  // Wait for the message to be available for consumption
  await daiCrossChainHarness.makeMessageConsumable(tokenOutMsgHash);

  // 6. claim dai on L2
  logger.info("Consuming messages to mint dai on L2");
  await daiCrossChainHarness.consumeMessageOnAztecAndMintPrivately({
    claimAmount: daiAmountToBridge,
    claimSecret: secretForDepositingSwappedDai,
    messageLeafIndex: tokenOutMsgIndex,
    recipient: ownerAddress,
  });
  await daiCrossChainHarness.expectPrivateBalanceOnL2(
    ownerAddress,
    daiL2BalanceBeforeSwap + daiAmountToBridge
  );

  let wethL2BalanceAfterSwap =
    await wethCrossChainHarness.getL2PrivateBalanceOf(ownerAddress);
  let daiL2BalanceAfterSwap = await daiCrossChainHarness.getL2PrivateBalanceOf(
    ownerAddress
  );

  logger.info(
    "WETH balance before swap: " + wethL2BalanceBeforeSwap.toString()
  );
  logger.info(
    "DAI balance before swap  : " + daiL2BalanceBeforeSwap.toString()
  );
  logger.info("***** 🧚‍♀️ SWAP L2 assets on L1 Uniswap 🧚‍♀️ *****");
  logger.info("WETH balance after swap : ", wethL2BalanceAfterSwap.toString());
  logger.info("DAI balance after swap  : ", daiL2BalanceAfterSwap.toString());

  // docs:end:uniswap_private

  // TODO(#7463): reenable look into this failure https://github.com/AztecProtocol/aztec-packages/actions/runs/9912612912/job/27388320150?pr=7462
  // // docs:start:uniswap_public
  // it('should uniswap trade on L1 from L2 funds publicly (swaps WETH -> DAI)', async () => {
  //   let wethL1BeforeBalance = await wethCrossChainHarness.getL1BalanceOf(ownerEthAddress);

  //   // 1. Approve and deposit weth to the portal and move to L2
  //   let [secretForMintingWeth, secretHashForMintingWeth] = wethCrossChainHarness.generateClaimSecret();

  //   let wethDepositMsgHash = await wethCrossChainHarness.sendTokensToPortalPublic(
  //     wethAmountToBridge,
  //     secretHashForMintingWeth,
  //   );
  //   // funds transferred from owner to token portal
  //   expect(await wethCrossChainHarness.getL1BalanceOf(ownerEthAddress)).toBe(
  //     wethL1BeforeBalance - wethAmountToBridge,
  //   );
  //   expect(await wethCrossChainHarness.getL1BalanceOf(wethCrossChainHarness.tokenPortalAddress)).toBe(
  //     wethAmountToBridge,
  //   );

  //   // Wait for the message to be available for consumption
  //   await wethCrossChainHarness.makeMessageConsumable(wethDepositMsgHash);

  //   // Get message leaf index, needed for claiming in public
  //   let wethDepositMaybeIndexAndPath = await aztecNode.getL1ToL2MessageMembershipWitness(
  //     'latest',
  //     wethDepositMsgHash,
  //     0n,
  //   );
  //   assert(wethDepositMaybeIndexAndPath !== undefined, 'Message not found in tree');
  //   let wethDepositMessageLeafIndex = wethDepositMaybeIndexAndPath[0];

  //   // 2. Claim WETH on L2
  //   logger.info('Minting weth on L2');
  //   await wethCrossChainHarness.consumeMessageOnAztecAndMintPublicly(
  //     wethAmountToBridge,
  //     secretForMintingWeth,
  //     wethDepositMessageLeafIndex,
  //   );
  //   await wethCrossChainHarness.expectPublicBalanceOnL2(ownerAddress, wethAmountToBridge);

  //   // Store balances
  //   let wethL2BalanceBeforeSwap = await wethCrossChainHarness.getL2PublicBalanceOf(ownerAddress);
  //   let daiL2BalanceBeforeSwap = await daiCrossChainHarness.getL2PublicBalanceOf(ownerAddress);

  //   // 3. Owner gives uniswap approval to transfer funds on its behalf
  //   let nonceForWETHTransferApproval = new Fr(1n);

  //   await ownerWallet
  //     .setPublicAuthWit(
  //       {
  //         caller: uniswapL2Contract.address,
  //         action: wethCrossChainHarness.l2Token.methods
  //           .transfer_in_public(
  //             ownerAddress,
  //             uniswapL2Contract.address,
  //             wethAmountToBridge,
  //             nonceForWETHTransferApproval,
  //           )
  //           .request(),
  //       },
  //       true,
  //     )
  //     .send()
  //     .wait();

  //   // 4. Swap on L1 - sends L2 to L1 message to withdraw WETH to L1 and another message to swap assets.
  //   let [secretForDepositingSwappedDai, secretHashForDepositingSwappedDai] =
  //     daiCrossChainHarness.generateClaimSecret();

  //   // 4.1 Owner approves user to swap on their behalf:
  //   let nonceForSwap = new Fr(3n);
  //   let action = uniswapL2Contract
  //     .withWallet(sponsorWallet)
  //     .methods.swap_public(
  //       ownerAddress,
  //       wethCrossChainHarness.l2Bridge.address,
  //       wethAmountToBridge,
  //       daiCrossChainHarness.l2Bridge.address,
  //       nonceForWETHTransferApproval,
  //       uniswapFeeTier,
  //       minimumOutputAmount,
  //       ownerAddress,
  //       secretHashForDepositingSwappedDai,
  //       ownerEthAddress,
  //       nonceForSwap,
  //     );
  //   await ownerWallet.setPublicAuthWit({ caller: sponsorAddress, action }, true).send().wait();

  //   // 4.2 Call swap_public from user2 on behalf of owner
  //   let uniswapL2Interaction = await action.send().wait();

  //   let swapPublicContent = sha256ToField([
  //     Buffer.from(
  //       toFunctionSelector('swap_public(address,uint256,uint24,address,uint256,bytes32,bytes32,address)').substring(
  //         2,
  //       ),
  //       'hex',
  //     ),
  //     wethCrossChainHarness.tokenPortalAddress.toBuffer32(),
  //     new Fr(wethAmountToBridge),
  //     new Fr(uniswapFeeTier),
  //     daiCrossChainHarness.tokenPortalAddress.toBuffer32(),
  //     new Fr(minimumOutputAmount),
  //     ownerAddress,
  //     secretHashForDepositingSwappedDai,
  //     ownerEthAddress.toBuffer32(),
  //   ]);

  //   let swapPublicLeaf = sha256ToField([
  //     uniswapL2Contract.address,
  //     new Fr(1), // aztec version
  //     EthAddress.fromString(uniswapPortal.address).toBuffer32(),
  //     new Fr(publicClient.chain.id), // chain id
  //     swapPublicContent,
  //   ]);

  //   let withdrawContent = sha256ToField([
  //     Buffer.from(toFunctionSelector('withdraw(address,uint256,address)').substring(2), 'hex'),
  //     uniswapPortalAddress.toBuffer32(),
  //     new Fr(wethAmountToBridge),
  //     uniswapPortalAddress.toBuffer32(),
  //   ]);

  //   let withdrawLeaf = sha256ToField([
  //     wethCrossChainHarness.l2Bridge.address,
  //     new Fr(1), // aztec version
  //     wethCrossChainHarness.tokenPortalAddress.toBuffer32(),
  //     new Fr(publicClient.chain.id), // chain id
  //     withdrawContent,
  //   ]);

  //   // check weth balance of owner on L2 (we first bridged `wethAmountToBridge` into L2 and now withdrew it!)
  //   await wethCrossChainHarness.expectPublicBalanceOnL2(ownerAddress, wethL2BalanceBeforeSwap - wethAmountToBridge);

  //   // 5. Perform the swap on L1 with the `uniswapPortal.swap_private()` (consuming L2 to L1 messages)
  //   logger.info('Execute withdraw and swap on the uniswapPortal!');
  //   let daiL1BalanceOfPortalBeforeSwap = await daiCrossChainHarness.getL1BalanceOf(
  //     daiCrossChainHarness.tokenPortalAddress,
  //   );

  //   let [swapPrivateL2MessageIndex, swapPrivateSiblingPath] = await aztecNode.getL2ToL1MessageMembershipWitness(
  //     uniswapL2Interaction.blockNumber!,
  //     swapPublicLeaf,
  //   );
  //   let [withdrawL2MessageIndex, withdrawSiblingPath] = await aztecNode.getL2ToL1MessageMembershipWitness(
  //     uniswapL2Interaction.blockNumber!,
  //     withdrawLeaf,
  //   );

  //   let withdrawMessageMetadata = {
  //     _l2BlockNumber: BigInt(uniswapL2Interaction.blockNumber!),
  //     _leafIndex: BigInt(withdrawL2MessageIndex),
  //     _path: withdrawSiblingPath
  //       .toBufferArray()
  //       .map((buf: Buffer) => `0x${buf.toString('hex')}`) as readonly `0x${string}`[],
  //   };

  //   let swapPrivateMessageMetadata = {
  //     _l2BlockNumber: BigInt(uniswapL2Interaction.blockNumber!),
  //     _leafIndex: BigInt(swapPrivateL2MessageIndex),
  //     _path: swapPrivateSiblingPath
  //       .toBufferArray()
  //       .map((buf: Buffer) => `0x${buf.toString('hex')}`) as readonly `0x${string}`[],
  //   };

  //   let swapArgs = [
  //     wethCrossChainHarness.tokenPortalAddress.toString(),
  //     wethAmountToBridge,
  //     Number(uniswapFeeTier),
  //     daiCrossChainHarness.tokenPortalAddress.toString(),
  //     minimumOutputAmount,
  //     ownerAddress.toString(),
  //     secretHashForDepositingSwappedDai.toString(),
  //     true,
  //     [withdrawMessageMetadata, swapPrivateMessageMetadata],
  //   ] as let;

  //   // this should also insert a message into the inbox.
  //   let txHash = await uniswapPortal.write.swapPublic(swapArgs, {} as any);

  //   // We get the msg leaf from event so that we can later wait for it to be available for consumption
  //   let outTokenDepositMsgHash: Fr;
  //   {
  //     let txReceipt = await daiCrossChainHarness.publicClient.waitForTransactionReceipt({
  //       hash: txHash,
  //     });

  //     let txLog = txReceipt.logs[9];
  //     let topics = decodeEventLog({
  //       abi: InboxAbi,
  //       data: txLog.data,
  //       topics: txLog.topics,
  //     });
  //     outTokenDepositMsgHash = Fr.fromHexString(topics.args.hash);
  //   }

  //   // weth was swapped to dai and send to portal
  //   let daiL1BalanceOfPortalAfter = await daiCrossChainHarness.getL1BalanceOf(
  //     daiCrossChainHarness.tokenPortalAddress,
  //   );
  //   expect(daiL1BalanceOfPortalAfter).toBeGreaterThan(daiL1BalanceOfPortalBeforeSwap);
  //   let daiAmountToBridge = BigInt(daiL1BalanceOfPortalAfter - daiL1BalanceOfPortalBeforeSwap);

  //   // Wait for the message to be available for consumption
  //   await daiCrossChainHarness.makeMessageConsumable(outTokenDepositMsgHash);

  //   // Get message leaf index, needed for claiming in public
  //   let outTokenDepositMaybeIndexAndPath = await aztecNode.getL1ToL2MessageMembershipWitness(
  //     'latest',
  //     outTokenDepositMsgHash,
  //     0n,
  //   );
  //   assert(outTokenDepositMaybeIndexAndPath !== undefined, 'Message not found in tree');
  //   let outTokenDepositMessageLeafIndex = outTokenDepositMaybeIndexAndPath[0];

  //   // 6. claim dai on L2
  //   logger.info('Consuming messages to mint dai on L2');
  //   await daiCrossChainHarness.consumeMessageOnAztecAndMintPublicly(
  //     daiAmountToBridge,
  //     secretForDepositingSwappedDai,
  //     outTokenDepositMessageLeafIndex,
  //   );
  //   await daiCrossChainHarness.expectPublicBalanceOnL2(ownerAddress, daiL2BalanceBeforeSwap + daiAmountToBridge);

  //   let wethL2BalanceAfterSwap = await wethCrossChainHarness.getL2PublicBalanceOf(ownerAddress);
  //   let daiL2BalanceAfterSwap = await daiCrossChainHarness.getL2PublicBalanceOf(ownerAddress);

  //   logger.info('WETH balance before swap: ', wethL2BalanceBeforeSwap.toString());
  //   logger.info('DAI balance before swap  : ', daiL2BalanceBeforeSwap.toString());
  //   logger.info('***** 🧚‍♀️ SWAP L2 assets on L1 Uniswap 🧚‍♀️ *****');
  //   logger.info('WETH balance after swap : ', wethL2BalanceAfterSwap.toString());
  //   logger.info('DAI balance after swap  : ', daiL2BalanceAfterSwap.toString());
  // });
  // // docs:end:uniswap_public

  // Edge cases for the private flow:
  // note - tests for uniswapPortal.sol and minting asset on L2 are covered in other tests.

  console.log("swap_private reverts without transfer to public approval");

  // swap should fail since no withdraw approval to uniswap:
  nonceForWETHTransferToPublicApproval = new Fr(2n);

  let expectedMessageHash = await computeAuthWitMessageHash(
    {
      caller: uniswapL2Contract.address,
      action: wethCrossChainHarness.l2Token.methods.transfer_to_public(
        ownerAddress,
        uniswapL2Contract.address,
        wethAmountToBridge,
        nonceForWETHTransferToPublicApproval
      ),
    },
    { chainId: ownerWallet.getChainId(), version: ownerWallet.getVersion() }
  );

  // edge cases for public flow:

  console.log(
    "I don't need approval to call swap_public if I'm swapping on my own behalf"
  );
  // 1. get tokens on l2
  await wethCrossChainHarness.mintTokensPublicOnL2(wethAmountToBridge);

  // 2. Give approval to uniswap to transfer funds to itself
  let nonceForWETHTransferApproval = new Fr(2n);
  let validateActionInteraction = await ownerWallet.setPublicAuthWit(
    {
      caller: uniswapL2Contract.address,
      action: wethCrossChainHarness.l2Token.methods.transfer_in_public(
        ownerAddress,
        uniswapL2Contract.address,
        wethAmountToBridge,
        nonceForWETHTransferApproval
      ),
    },
    true
  );
  await validateActionInteraction.send().wait();

  // No approval to call `swap` but should work even without it:
  let _;
  [_, secretHashForDepositingSwappedDai] = await generateClaimSecret();

  await uniswapL2Contract.methods
    .swap_public(
      ownerAddress,
      wethCrossChainHarness.l2Bridge.address,
      wethAmountToBridge,
      daiCrossChainHarness.l2Bridge.address,
      nonceForWETHTransferApproval,
      uniswapFeeTier,
      minimumOutputAmount,
      ownerAddress,
      secretHashForDepositingSwappedDai,
      ownerEthAddress,
      Fr.ZERO // nonce for swap -> doesn't matter
    )
    .send()
    .wait();
  // check weth balance of owner on L2 (we first bridged `wethAmountToBridge` into L2 and now withdrew it!)
  await wethCrossChainHarness.expectPublicBalanceOnL2(ownerAddress, 0n);

  console.log("uniswap can't pull funds without transfer approval");
  // swap should fail since no transfer approval to uniswap:
  nonceForWETHTransferApproval = new Fr(4n);

  validateActionInteraction = await ownerWallet.setPublicAuthWit(
    {
      caller: uniswapL2Contract.address,
      action: wethCrossChainHarness.l2Token.methods.transfer_in_public(
        ownerAddress,
        uniswapL2Contract.address,
        wethAmountToBridge,
        nonceForWETHTransferApproval
      ),
    },
    true
  );
  await validateActionInteraction.send().wait();

  // tests when trying to mix private and public flows:
  console.log("can't call swap_public on L1 if called swap_private on L2");
  // get tokens on L2:
  logger.info("minting weth on L2");
  await wethCrossChainHarness.mintTokensPrivateOnL2(wethAmountToBridge);

  // Owner gives uniswap approval to transfer the funds to public to self on its behalf
  logger.info(
    "Approving uniswap to transfer the funds to public to self on my behalf"
  );
  nonceForWETHTransferToPublicApproval = new Fr(4n);
  transferToPublicAuhtwit = await ownerWallet.createAuthWit({
    caller: uniswapL2Contract.address,
    action: wethCrossChainHarness.l2Token.methods.transfer_to_public(
      ownerAddress,
      uniswapL2Contract.address,
      wethAmountToBridge,
      nonceForWETHTransferToPublicApproval
    ),
  });
  wethL2BalanceBeforeSwap = await wethCrossChainHarness.getL2PrivateBalanceOf(
    ownerAddress
  );

  // Swap
  logger.info("Withdrawing weth to L1 and sending message to swap to dai");

  [, secretHashForDepositingSwappedDai] = await generateClaimSecret();
  let withdrawReceipt = await uniswapL2Contract.methods
    .swap_private(
      wethCrossChainHarness.l2Token.address,
      wethCrossChainHarness.l2Bridge.address,
      wethAmountToBridge,
      daiCrossChainHarness.l2Bridge.address,
      nonceForWETHTransferToPublicApproval,
      uniswapFeeTier,
      minimumOutputAmount,
      secretHashForDepositingSwappedDai,
      ownerEthAddress
    )
    .send({ authWitnesses: [transferToPublicAuhtwit] })
    .wait();

  swapPrivateContent = sha256ToField([
    Buffer.from(
      toFunctionSelector(
        "swap_private(address,uint256,uint24,address,uint256,bytes32,address)"
      ).substring(2),
      "hex"
    ),
    wethCrossChainHarness.tokenPortalAddress.toBuffer32(),
    new Fr(wethAmountToBridge),
    new Fr(uniswapFeeTier),
    daiCrossChainHarness.tokenPortalAddress.toBuffer32(),
    new Fr(minimumOutputAmount),
    secretHashForDepositingSwappedDai,
    ownerEthAddress.toBuffer32(),
  ]);

  swapPrivateLeaf = sha256ToField([
    uniswapL2Contract.address,
    new Fr(1), // aztec version
    EthAddress.fromString(uniswapPortal.address).toBuffer32(),
    new Fr(publicClient.chain.id), // chain id
    swapPrivateContent,
  ]);

  withdrawContent = sha256ToField([
    Buffer.from(
      toFunctionSelector("withdraw(address,uint256,address)").substring(2),
      "hex"
    ),
    uniswapPortalAddress.toBuffer32(),
    new Fr(wethAmountToBridge),
    uniswapPortalAddress.toBuffer32(),
  ]);

  withdrawLeaf = sha256ToField([
    wethCrossChainHarness.l2Bridge.address,
    new Fr(1), // aztec version
    wethCrossChainHarness.tokenPortalAddress.toBuffer32(),
    new Fr(publicClient.chain.id), // chain id
    withdrawContent,
  ]);

  [swapPrivateL2MessageIndex, swapPrivateSiblingPath] =
    await aztecNode.getL2ToL1MessageMembershipWitness(
      withdrawReceipt.blockNumber!,
      swapPrivateLeaf
    );
  [withdrawL2MessageIndex, withdrawSiblingPath] =
    await aztecNode.getL2ToL1MessageMembershipWitness(
      withdrawReceipt.blockNumber!,
      withdrawLeaf
    );

  withdrawMessageMetadata = {
    _l2BlockNumber: BigInt(withdrawReceipt.blockNumber!),
    _leafIndex: BigInt(withdrawL2MessageIndex),
    _path: withdrawSiblingPath
      .toBufferArray()
      .map(
        (buf: Buffer) => `0x${buf.toString("hex")}`
      ) as readonly `0x${string}`[],
  };

  swapPrivateMessageMetadata = {
    _l2BlockNumber: BigInt(withdrawReceipt.blockNumber!),
    _leafIndex: BigInt(swapPrivateL2MessageIndex),
    _path: swapPrivateSiblingPath
      .toBufferArray()
      .map(
        (buf: Buffer) => `0x${buf.toString("hex")}`
      ) as readonly `0x${string}`[],
  };

  // ensure that user's funds were burnt
  await wethCrossChainHarness.expectPrivateBalanceOnL2(
    ownerAddress,
    wethL2BalanceBeforeSwap - wethAmountToBridge
  );

  // Since the outbox is only consumable when the block is proven, we need to set the block to be proven
  await cheatCodes.rollup.markAsProven(await rollup.getBlockNumber());

  // On L1 call swap_public!
  logger.info("call swap_public on L1");
};
