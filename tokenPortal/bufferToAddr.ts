import { bytesToHex, getAddress } from "viem";

function logAddressFromBuffer(buffer) {
  if (!buffer || !buffer.data || !Array.isArray(buffer.data)) {
    console.error("Invalid buffer format. Expected {data: number[]}");
    return;
  }

  const uint8Array = new Uint8Array(buffer.data);
  const hex = bytesToHex(uint8Array);
  const address = getAddress(hex);

  console.log("Extracted address:", address);
  return address;
}

const bufferData = {
  type: "Buffer",
  data: [
    14, 199, 202, 60, 36, 171, 221, 137, 88, 179, 183, 115, 5, 245, 11, 126,
    111, 70, 52, 38, 165, 150, 214, 69, 174, 235, 97, 55, 162, 40, 72, 218,
  ],
};

logAddressFromBuffer(bufferData);
