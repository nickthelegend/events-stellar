import {
  rpc,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";
import { network } from "../contracts/util";

export interface ContractRsvpParams {
  contractId: string;
  userAddress: string;
  signTransaction: (xdr: string) => Promise<string>;
}

export const rsvpToEvent = async ({
  contractId,
  userAddress,
  signTransaction,
}: ContractRsvpParams) => {
  try {
    const server = new rpc.Server(network.rpcUrl);
    const source = await server.getAccount(userAddress);
    const contract = new Contract(contractId);

    // Build transaction for rsvp method
    let tx = new TransactionBuilder(source, {
      fee: "100000",
      networkPassphrase: network.passphrase,
    })
      .addOperation(
        contract.call("rsvp", nativeToScVal(Address.fromString(userAddress))),
      )
      .setTimeout(60)
      .build();

    // Prepare transaction
    tx = await server.prepareTransaction(tx);

    // Sign transaction
    const signedTxXdr = await signTransaction(tx.toXDR());

    // Submit to network
    const txObj = TransactionBuilder.fromXDR(signedTxXdr, network.passphrase);
    const result = await server.sendTransaction(txObj);

    return { success: true, result };
  } catch (error) {
    console.error("RSVP failed:", error);
    throw error;
  }
};

export const checkRsvpStatus = async (
  contractId: string,
  userAddress: string,
): Promise<boolean> => {
  try {
    const server = new rpc.Server(network.rpcUrl);
    const source = await server.getAccount(userAddress);
    const contract = new Contract(contractId);

    // Build read-only transaction for has_rsvped method
    const tx = new TransactionBuilder(source, {
      fee: "100000",
      networkPassphrase: network.passphrase,
    })
      .addOperation(
        contract.call(
          "has_rsvped",
          nativeToScVal(Address.fromString(userAddress)),
        ),
      )
      .setTimeout(60)
      .build();

    // Simulate transaction (read-only)
    const result = await server.simulateTransaction(tx);

    if (result.events && result.events.length > 0) {
      return Boolean(result.events.length);
    }

    return false;
  } catch (error) {
    console.error("Check RSVP status failed:", error);
    return false;
  }
};

export const markAttended = async ({
  contractId,
  userAddress,
  attendeeAddress,
  signTransaction,
}: ContractRsvpParams & { attendeeAddress: string }) => {
  try {
    const server = new rpc.Server(network.rpcUrl);
    const source = await server.getAccount(userAddress);
    const contract = new Contract(contractId);

    // Build transaction for mark_attended method
    let tx = new TransactionBuilder(source, {
      fee: "100000",
      networkPassphrase: network.passphrase,
    })
      .addOperation(
        contract.call(
          "mark_attended",
          nativeToScVal(Address.fromString(attendeeAddress)),
        ),
      )
      .setTimeout(60)
      .build();

    // Prepare transaction
    tx = await server.prepareTransaction(tx);

    // Sign transaction
    const signedTxXdr = await signTransaction(tx.toXDR());

    // Submit to network
    const txObj = TransactionBuilder.fromXDR(signedTxXdr, network.passphrase);
    const result = await server.sendTransaction(txObj);

    return { success: true, result };
  } catch (error) {
    console.error("Mark attended failed:", error);
    throw error;
  }
};
