import {
  createAztecNodeClient,
  createPXEClient,
  waitForPXE,
} from "@aztec/aztec.js";
import { MultisigContract } from "../artifacts/Multisig.js";
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";

const MNEMONIC = "test test test test test test test test test test test junk";

const setupSandbox = async () => {
  const { PXE_URL = "http://localhost:8080" } = process.env;
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const pxe = createPXEClient(PXE_URL);
  const aztecNode = createAztecNodeClient(PXE_URL);
  await waitForPXE(pxe);
  return { pxe, aztecNode };
};

async function main() {
  const { pxe } = await setupSandbox();
  const wallets = await getInitialTestAccountsWallets(pxe);
  const ownerWallet = wallets[0];
  const ownerAztecAddress = wallets[0].getAddress();
  const secondAztecAddress = wallets[1].getAddress();

  const multisigContract = await MultisigContract.deploy(ownerWallet, [
    ownerAztecAddress,
    secondAztecAddress,
  ])
    .send()
    .deployed();

  console.log(`Multisig contract deployed at ${multisigContract.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
