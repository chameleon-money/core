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
    58, 173, 226, 220, 210, 223, 106, 140, 172, 104, 158, 231, 151, 89, 27, 41,
    19, 101, 134, 89,
  ],
};

logAddressFromBuffer(bufferData);
