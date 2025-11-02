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
  Contract,
} from "@stellar/stellar-sdk";

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

export async function deployPOAContract(
  wasmBytes: Uint8Array,
  eventParams: EventParams,
  wallet: Wallet
): Promise<DeploymentResult> {
  const server = new rpc.Server(SOROBAN_RPC);

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
    const signedUpload = await wallet.signTransaction(uploadTx.toXDR());

    const txObj1 = TransactionBuilder.fromXDR(signedUpload, NETWORK_PASSPHRASE);

  uploadTx = await server.prepareTransaction(uploadTx);

  let hashTemp, statusTemp;
  const uploadResponse = await server.sendTransaction(txObj1).then(result => {
    console.log("hash:", result.hash);
    hashTemp = result.hash;
    console.log("status:", result.status);
    statusTemp = result.status
    console.log("errorResultXdr:", result.errorResult);
  });;

  if (statusTemp === "ERROR") {
    console.error("Upload failed:", uploadResponse);
    throw new Error("WASM upload failed");
  }
  
  const wasmHash : string | undefined = hashTemp ;

  if (!wasmHash) throw new Error("Could not extract wasmHash");
  console.log("WASM Hash:", wasmHash);

  // STEP 2: Create contract
  console.log("Creating contract...");
  const source2 = await server.getAccount(wallet.publicKey);

  let createTx = new TransactionBuilder(source2, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createCustomContract({
        wasmHash: wasmHash,
        address: wallet.publicKey,
      })
    )
    .setTimeout(60)
    .build();

  createTx = await server.prepareTransaction(createTx);
  
  const signedCreate = await wallet.signTransaction(createTx.toXDR());
  const txObj = TransactionBuilder.fromXDR(signedCreate, NETWORK_PASSPHRASE);
  const createResponse = await server.sendTransaction(txObj);

  if (createResponse.status === "ERROR") {
    console.error("Contract creation failed:", createResponse);
    throw new Error("Contract creation failed");
  }

  const contractId = extractContractId(createResponse.!);
  console.log("✅ Contract deployed! ID:", contractId);

  // STEP 3: Call constructor
  await callContract(wallet, contractId, "__constructor", [
    Address.fromString(wallet.publicKey),
    eventParams.symbol,
    eventParams.uri,
    eventParams.name
  ]);

  return { contractId, wasmHash: wasmHash.toString("hex") };
}

async function callContract(wallet: Wallet, contractId: string, method: string, args: any[]) {
  const server = new rpc.Server(SOROBAN_RPC);
  const source = await server.getAccount(wallet.publicKey);
  const contract = new Contract(contractId);

  console.log(`Calling method ${method} on contract ${contractId}`);

  let callTx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        method,
        ...args.map(a => nativeToScVal(a))
      )
    )
    .setTimeout(60)
    .build();

  callTx = await server.prepareTransaction(callTx);
  const signed = await wallet.signTransaction(callTx.toXDR());
  const response = await server.sendTransaction(signed);

  console.log("Invoke Response:", response);
  return response;
}

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