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
  try {
    console.log("🔧 Starting deployment with params:", { wasmSize: wasmBytes.length, eventParams, walletKey: wallet.publicKey });
    
    if (!wallet.publicKey) {
      throw new Error("Wallet publicKey is undefined. Make sure wallet is connected.");
    }
    
    const server = new rpc.Server(SOROBAN_RPC);

    // STEP 1: Upload Wasm
    console.log("📤 STEP 1: Uploading contract WASM...");
    const source = await server.getAccount(wallet.publicKey);
    console.log("✅ Got account source");

    console.log("🏗️ Building upload transaction...");
    let uploadTx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.uploadContractWasm({ wasm: wasmBytes }))
      .setTimeout(60)
      .build();
    console.log("✅ Upload transaction built");

    console.log("⚙️ Preparing transaction...");
    uploadTx = await server.prepareTransaction(uploadTx);
    console.log("✅ Transaction prepared");

    console.log("✍️ Signing transaction...");
    const signedUpload = await wallet.signTransaction(uploadTx.toXDR());
    console.log("✅ Transaction signed");

    console.log("📡 Sending upload transaction...");
    const txObj1 = TransactionBuilder.fromXDR(signedUpload, NETWORK_PASSPHRASE);
    const uploadResponse = await server.sendTransaction(txObj1);
    console.log("✅ Upload response:", uploadResponse);

    if (uploadResponse.status === "ERROR") {
      console.error("❌ Upload failed:", uploadResponse);
      throw new Error("WASM upload failed");
    }

    console.log("🔐 Generating WASM hash...");
    const wasmHashBuffer = await crypto.subtle.digest('SHA-256', wasmBytes);
    const wasmHash = new Uint8Array(wasmHashBuffer);
    console.log("✅ WASM Hash generated:", wasmHash);

    // STEP 2: Create contract
    console.log("🏭 STEP 2: Creating contract...");
    const source2 = await server.getAccount(wallet.publicKey);
    console.log("✅ Got account source for contract creation");

    console.log("🏗️ Building create contract transaction...");
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
    console.log("✅ Create contract transaction built");

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

    console.log("🎉 Deployment completed successfully!");
    return { contractId, wasmHash: Buffer.from(wasmHash).toString('hex') };
  } catch (error) {
    console.error("💥 Deployment failed at:", error);
    console.error("📍 Error stack:", error.stack);
    throw error;
  }
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


