import type { ViemPublicClient } from "@aztec/ethereum";
import fs from "fs";

export async function loadChainState(
  publicClient: ViemPublicClient,
  fileName: string
): Promise<void> {
  const data = JSON.parse(fs.readFileSync(`${fileName}.json`, "utf8"));
  try {
    await publicClient.transport.request({
      method: "hardhat_loadState",
      params: [data],
    });
  } catch (e) {
    throw new Error(`Error loading state: ${e}`);
  }
  console.log(`Loaded state from ${fileName}`);
}
