import { rpcUrl } from '../contracts/util';

// This will be used to create a new contract client instance with the deployed contract ID
export function createContractClient(contractId: string) {
  // Since we can't dynamically import the generated client at runtime,
  // we'll store the contract ID for later use
  localStorage.setItem('deployedContractId', contractId);
  console.log('📝 Stored contract ID in localStorage:', contractId);
  
  // In a real implementation, you would:
  // 1. Update the contract client configuration
  // 2. Re-initialize the client with the new contract ID
  // 3. Make it available to components that need it
  
  return {
    contractId,
    rpcUrl,
    networkPassphrase: 'Standalone Network ; February 2017',
    allowHttp: true,
  };
}

export function getDeployedContractId(): string | null {
  return localStorage.getItem('deployedContractId');
}