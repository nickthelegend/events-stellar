import {
  rpc,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Networks,
  Address,
  scValToNative,
  nativeToScVal,
  xdr,
} from "@stellar/stellar-sdk";
import fs from "fs";

const SOROBAN_RPC = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

interface Wallet {
  publicKey: string;
  signTransaction: (xdr: string) => Promise<string>;
}

export interface DeploymentResult {
  contractId: string;
  wasmHash: string;
}

export interface EventParams {
  symbol: string;
  uri: string;
  name: string;
}

export async function deployContract(wallet: Wallet, wasmPath: string) {
  const server = new rpc.Server(SOROBAN_RPC);
  const wasmBytes = fs.readFileSync(wasmPath);

  // STEP 1: Upload Wasm
  console.log("Uploading contract WASM...");
  const source = await server.getAccount(wallet.publicKey);

  let uploadTx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBytes }))
    .setTimeout(60)
    .build();

  uploadTx = await server.prepareTransaction(uploadTx);
  const signedUpload = await wallet.signTransaction(uploadTx.toXDR());
  const uploadResponse = await server.sendTransaction(signedUpload);

  if (uploadResponse.status !== "SUCCESS") {
    console.error("Upload failed:", uploadResponse);
    throw new Error("WASM upload failed");
  }

  const wasmHash = uploadResponse.resultMetaXdr
    ? extractWasmHash(uploadResponse.resultMetaXdr)
    : null;

  if (!wasmHash) throw new Error("Could not extract wasmHash");
  console.log("WASM Hash:", wasmHash.toString("hex"));

  // STEP 2: Create contract
  console.log("Creating contract...");
  const source2 = await server.getAccount(wallet.publicKey);

  let createTx = new TransactionBuilder(source2, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createContract({
        wasmHash: wasmHash,
        address: new Address(wallet.publicKey).toScAddress(),
        salt: crypto.getRandomValues(new Uint8Array(32)),
      })
    )
    .setTimeout(60)
    .build();

  createTx = await server.prepareTransaction(createTx);
  const signedCreate = await wallet.signTransaction(createTx.toXDR());
  const createResponse = await server.sendTransaction(signedCreate);

  if (createResponse.status !== "SUCCESS") {
    console.error("Contract creation failed:", createResponse);
    throw new Error("Contract creation failed");
  }

  const contractId = extractContractId(createResponse.resultMetaXdr);
  console.log("✅ Contract deployed! ID:", contractId);

  // STEP 3 (optional): Call an init function or constructor
  // e.g. invoke a method named “init”
  await callContract(wallet, contractId, "init", []);

  return contractId;
}

async function callContract(wallet: Wallet, contractId: string, method: string, args: any[]) {
  const server = new rpc.Server(SOROBAN_RPC);
  const source = await server.getAccount(wallet.publicKey);

  console.log(`Calling method ${method} on contract ${contractId}`);

  let callTx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(),
        parameters: [],
        contractId: contractId,
        functionName: method,
        args: args.map(a => nativeToScVal(a)),
      })
    )
    .setTimeout(60)
    .build();

  callTx = await server.prepareTransaction(callTx);
  const signed = await wallet.signTransaction(callTx.toXDR());
  const response = await server.sendTransaction(signed);

  console.log("Invoke Response:", response);
  return response;
}

// Helpers
function extractWasmHash(metaXdr: string): Buffer | null {
  try {
    const meta = xdr.TransactionMeta.fromXDR(metaXdr, "base64");
    const wasmHash = meta.v3().sorobanMeta().returnValue().bytes();
    return Buffer.from(wasmHash);
  } catch (e) {
    console.error("extractWasmHash failed:", e);
    return null;
  }
}

function extractContractId(metaXdr: string): string {
  try {
    const meta = xdr.TransactionMeta.fromXDR(metaXdr, "base64");
    const returnVal = meta.v3().sorobanMeta().returnValue().bytes();
    const hex = Buffer.from(returnVal).toString("hex");
    return `C${hex}`;
  } catch (e) {
    console.error("extractContractId failed:", e);
    return "UNKNOWN";
  }
}
