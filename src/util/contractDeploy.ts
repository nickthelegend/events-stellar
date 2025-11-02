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
  StrKey,
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
    

  uploadTx = await server.prepareTransaction(uploadTx);
  const signedUpload = await wallet.signTransaction(uploadTx.toXDR());

  const txObj1 = TransactionBuilder.fromXDR(signedUpload, NETWORK_PASSPHRASE);
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
        address: Address.fromString(wallet.publicKey),
      })
    )
    .setTimeout(60)
    .build();

  // 1) SIMULATE to read the return value (contract address) before submitting
  const sim = await server.simulateTransaction(createTx);
  const scv = extractSimRetval(sim);
  if (!scv) {
    throw new Error(
      `simulateTransaction returned no retval for createCustomContract: ${JSON.stringify(sim)}`
    );
  }
  if (scv.switch() !== xdr.ScValType.scvAddress()) {
    throw new Error('createCustomContract retval is not an Address ScVal');
  }
  const scAddr = scv.address();
  if (scAddr.switch() !== xdr.ScAddressType.scAddressTypeContract()) {
    throw new Error('createCustomContract retval Address is not a contract');
  }
  const contractId = StrKey.encodeContract(scAddr.contractId()); // => "C..."

  // 2) Prepare, sign, send, poll
  createTx = await server.prepareTransaction(createTx);
  
  const signedCreate = await wallet.signTransaction(createTx.toXDR());
  const txObj = TransactionBuilder.fromXDR(signedCreate, NETWORK_PASSPHRASE);
  const createResponse = await server.sendTransaction(txObj);

  if (createResponse.status === "ERROR") {
    console.error("Contract creation failed:", createResponse);
    throw new Error("Contract creation failed");
  }

  console.log("✅ Contract deployed! ID:", contractId);

function extractSimRetval(sim: any) {
  return sim.result?.retval;
}

  // STEP 3: Call constructor
  await callContract(wallet, contractId, "__constructor", [
    Address.fromString(wallet.publicKey),
    eventParams.symbol,
    eventParams.uri,
    eventParams.name
  ]);

  return { contractId, wasmHash: wasmHash };
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
  const txObj = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  const response = await server.sendTransaction(txObj);

  console.log("Invoke Response:", response);
  return response;
}


