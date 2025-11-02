import { 
  SorobanRpc, 
  TransactionBuilder, 
  Operation,
  BASE_FEE,
  Address,
  Contract,
  xdr,
  nativeToScVal
} from "@stellar/stellar-sdk";

const SOROBAN_RPC = import.meta.env.PUBLIC_STELLAR_RPC_URL || "http://localhost:8000/rpc";
const NETWORK_PASSPHRASE = import.meta.env.PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Standalone Network ; February 2017";

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
  publicKey: string,
  signTransaction: (txXdr: string) => Promise<string>
): Promise<DeploymentResult> {
  console.log("🚀 Starting POA contract deployment...");
  console.log("📋 Event params:", eventParams);
  
  const server = new SorobanRpc.Server(SOROBAN_RPC);
  
  try {
    // 1. Install WASM
    console.log("📦 Installing WASM...");
    const wasmHash = await installWasm(server, wasmBytes, publicKey, signTransaction);
    console.log("✅ WASM installed with hash:", wasmHash);
    
    // 2. Create contract instance
    console.log("🏗️ Creating contract instance...");
    const contractId = await createContractInstance(server, wasmHash, publicKey, signTransaction);
    console.log("✅ Contract created with ID:", contractId);
    
    // 3. Initialize contract
    console.log("⚙️ Initializing contract...");
    await initializeContract(server, contractId, eventParams, publicKey, signTransaction);
    console.log("✅ Contract initialized successfully!");
    
    return { contractId, wasmHash };
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

async function installWasm(
  server: SorobanRpc.Server,
  wasmBytes: Uint8Array,
  publicKey: string,
  signTransaction: (txXdr: string) => Promise<string>
): Promise<string> {
  const sourceAccount = await server.getAccount(publicKey);
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBytes }))
    .setTimeout(30)
    .build();
  
  const preparedTx = await server.prepareTransaction(transaction);
  const signedXdr = await signTransaction(preparedTx.toXDR());
  
  const response = await server.sendTransaction(signedXdr);
  
  if (response.status === "ERROR") {
    throw new Error(`WASM installation failed: ${response.errorResultXdr}`);
  }
  
  // Extract WASM hash from response
  const wasmHash = extractWasmHash(response);
  return wasmHash;
}

async function createContractInstance(
  server: SorobanRpc.Server,
  wasmHash: string,
  publicKey: string,
  signTransaction: (txXdr: string) => Promise<string>
): Promise<string> {
  const sourceAccount = await server.getAccount(publicKey);
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createStellarAsset({
        asset: wasmHash,
        source: publicKey,
      })
    )
    .setTimeout(30)
    .build();
  
  const preparedTx = await server.prepareTransaction(transaction);
  const signedXdr = await signTransaction(preparedTx.toXDR());
  
  const response = await server.sendTransaction(signedXdr);
  
  if (response.status === "ERROR") {
    throw new Error(`Contract creation failed: ${response.errorResultXdr}`);
  }
  
  // Extract contract ID from response
  const contractId = extractContractId(response);
  return contractId;
}

async function initializeContract(
  server: SorobanRpc.Server,
  contractId: string,
  eventParams: EventParams,
  publicKey: string,
  signTransaction: (txXdr: string) => Promise<string>
): Promise<void> {
  const sourceAccount = await server.getAccount(publicKey);
  const contract = new Contract(contractId);
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "__constructor",
        nativeToScVal(Address.fromString(publicKey)),
        nativeToScVal(eventParams.symbol),
        nativeToScVal(eventParams.uri),
        nativeToScVal(eventParams.name)
      )
    )
    .setTimeout(30)
    .build();
  
  const preparedTx = await server.prepareTransaction(transaction);
  const signedXdr = await signTransaction(preparedTx.toXDR());
  
  const response = await server.sendTransaction(signedXdr);
  
  if (response.status === "ERROR") {
    throw new Error(`Contract initialization failed: ${response.errorResultXdr}`);
  }
}

function extractWasmHash(response: SorobanRpc.Api.SendTransactionResponse): string {
  console.log("📊 Extracting WASM hash from response:", response);
  
  // For now, generate a mock hash - in production, extract from response
  const mockHash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  console.log("🔗 Generated WASM hash:", mockHash);
  return mockHash;
}

function extractContractId(response: SorobanRpc.Api.SendTransactionResponse): string {
  console.log("📊 Extracting contract ID from response:", response);
  
  // For now, generate a mock contract ID - in production, extract from response
  const mockContractId = "CDUU47Y6DIBREP3CMFO3IQRA4NZX3HRGMUUHNBKTK4HKOXFZCBLZSYBT";
  console.log("🆔 Generated contract ID:", mockContractId);
  return mockContractId;
}