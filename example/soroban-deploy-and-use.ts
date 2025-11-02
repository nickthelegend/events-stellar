// soroban-deploy-and-use.ts
import { Server, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
// NOTE: some SDKs expose soroban helpers on Server, e.g. server.prepareTransaction.
// If your version is @stellar/soroban-client or similar, import that Server instead.

import * as bindings from "./bindings/my-contract"; // generated bindings (no contractId baked)

// Helper types for wallet abstraction — adapt to your wallet kit
type Wallet = {
  publicKey: string;
  // signTransaction takes unsigned XDR and returns signed XDR (or signatures)
  signTransaction: (txXdr: string) => Promise<string>;
};

const SOROBAN_RPC = "https://soroban-testnet.stellar.org";
const server = new Server(SOROBAN_RPC); // or new SorobanServer(...) in some libs
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function installWasm(wallet: Wallet, wasmBytes: Uint8Array) {
  // 1) Prepare an install wasm transaction (simulate to get footprint)
  // Note: server.prepareTransaction is the recommended helper to get footprints.
  // The exact call shape can vary by SDK version; many examples call server.prepareTransaction([...hostFunctions...], sourceAccount)
  const sourceAccount = await server.getAccount(wallet.publicKey);

  // Build a transaction that uploads the contract WASM using the "upload contract wasm" host function.
  // Many SDKs provide a convenience `server.prepareTransaction` for Soroban host functions.
  // PSEUDO: this shows the steps — adapt the inner host function builder to your SDK.
  const tx = await server.prepareTransaction(
    // host functions array: first entry is "upload contract code"
    [
      {
        // SDK-specific: this object represents the "upload contract wasm" host function and payload
        type: "upload_wasm",
        wasm: wasmBytes,
      },
    ],
    sourceAccount,
    { networkPassphrase: NETWORK_PASSPHRASE }
  );

  // 2) Ask wallet to sign
  const signedXdr = await wallet.signTransaction(tx.toXDR());
  // 3) submit
  const installResp = await server.sendTransaction(signedXdr);

  // 4) extract wasmHash from transaction result/events
  // The exact place depends on SDK/horizon response shape. Commonly: installResp.result_meta.events
  // Example (pseudo):
  const wasmHash = extractWasmHashFromInstallResponse(installResp);
  return wasmHash;
}

async function createContractInstance(wallet: Wallet, wasmHash: string) {
  // After installing the wasm, create a contract instance (this returns contractId).
  const sourceAccount = await server.getAccount(wallet.publicKey);

  const tx = await server.prepareTransaction(
    [
      {
        type: "create_contract",
        wasm_hash: wasmHash,
        // if your SDK uses a salt, pass it or let it be auto-generated
        salt: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(),
      },
    ],
    sourceAccount,
    { networkPassphrase: NETWORK_PASSPHRASE }
  );

  const signedXdr = await wallet.signTransaction(tx.toXDR());
  const createResp = await server.sendTransaction(signedXdr);

  // Extract created contractId from createResp.
  const contractId = extractContractIdFromCreateResponse(createResp);
  return contractId;
}

// Utility: inject contractId into generated bindings at runtime.
// How to inject depends on the generated bindings shape. Two patterns are common:
// A) Generated bindings export a `networks` object -> override networks.testnet.contractId
// B) Generated bindings export a client factory that accepts runtime options.
// We'll try pattern A then B.
function injectContractIdIntoBindings(contractId: string, rpcUrl = SOROBAN_RPC) {
  // Pattern A (most generators include a `networks` map)
  try {
    // @ts-ignore
    if (bindings.networks && bindings.networks.Standalone) {
      // Replace Standalone with testnet info (or add a new key)
      // Note: check the generated file to see exact object names.
      bindings.networks.testnet = {
        networkPassphrase: NETWORK_PASSPHRASE,
        rpcUrl,
        contractId,
      };
      bindings.network = "testnet"; // if the binding expects a chosen network key
      return;
    }
  } catch (e) {
    // ignore — fallback to pattern B
  }

  // Pattern B: constructor-based client. Many bindings export a class you can instantiate:
  // const client = new bindings.MyToken({ contractId, rpcUrl, networkPassphrase });
  // We'll return that client if available.
  // @ts-ignore
  if (typeof bindings.default === "function" || typeof bindings.MyToken === "function") {
    // the calling code can create an instance using the factory exported by bindings
    return;
  }

  // If neither pattern fits, you can manually pass contractId when calling low-level helpers.
  // Generated bindings usually export function wrappers; inspect the generated README to know how to pass contractId.
}

// Example usage: deploy wasm (from user file input), create contract, and then call an exported method
export async function deployFromClientAndCall(wasmFile: File, wallet: Wallet) {
  // read wasm bytes
  const wasmBytes = new Uint8Array(await wasmFile.arrayBuffer());

  // 1) install wasm -> get wasmHash
  const wasmHash = await installWasm(wallet, wasmBytes);

  // 2) create contract -> get contractId
  const contractId = await createContractInstance(wallet, wasmHash);

  console.log("Deployed contractId:", contractId);

  // 3) inject into the binding
  injectContractIdIntoBindings(contractId);

  // 4) now call a contract method using the generated bindings or low-level invoke
  // Example: call `rsvp(attendee)` using low-level invoke (if binding not directly usable)
  await callRsvpWithWallet(wallet, contractId, wallet.publicKey);
}

// Low-level example of invoking rsvp (fallback when bindings can't be used directly)
async function callRsvpWithWallet(wallet: Wallet, contractId: string, attendeeAddress: string) {
  const sourceAccount = await server.getAccount(wallet.publicKey);

  // prepare a transaction with one host function: invoke contract's `rsvp` with the attendee address
  const tx = await server.prepareTransaction(
    [
      {
        type: "invoke_contract",
        contractId,
        method: "rsvp",
        // arguments depend on how generated bindings serialize Address and Strings
        args: [attendeeAddress],
      },
    ],
    sourceAccount,
    { networkPassphrase: NETWORK_PASSPHRASE }
  );

  const signedXdr = await wallet.signTransaction(tx.toXDR());
  const resp = await server.sendTransaction(signedXdr);
  return resp;
}

/* -------------------------
  Helper extractors (pseudo)
  These depend on actual RPC response shapes — parse the returned transaction
  metadata / events to find the wasm hash and contract id. Check your SDK's
  transaction result format; you usually find the created contract id in
  `result_meta.events` or similar.
------------------------- */

function extractWasmHashFromInstallResponse(installResp: any): string {
  // Example (pseudo):
  // find an event with type "wasm_installed" and return its wasm_hash
  if (installResp && installResp.results) {
    // parse results to find wasm_hash
  }
  throw new Error("could not parse wasm hash from install response; inspect response shape");
}

function extractContractIdFromCreateResponse(createResp: any): string {
  // Example (pseudo):
  // find an event "created_contract" and read the contract id
  if (createResp && createResp.results) {
    // parse results
  }
  throw new Error("could not parse contract id from create response; inspect response shape");
}
