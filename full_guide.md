# Event2 - Complete Developer Guide

A comprehensive guide to understanding and working with the Event2 Stellar smart contract project.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Smart Contracts Analysis](#smart-contracts-analysis)
4. [Frontend Architecture](#frontend-architecture)
5. [Environment Configuration](#environment-configuration)
6. [Development Workflow](#development-workflow)
7. [Deployment Guide](#deployment-guide)
8. [Debugging & Testing](#debugging--testing)
9. [Advanced Topics](#advanced-topics)

## 🎯 Project Overview

Event2 is a Scaffold Stellar project demonstrating three different types of smart contracts with a React frontend. It showcases:

- **Game Contract**: Interactive number guessing with XLM rewards
- **Token Contract**: Fungible token with allowlist access control
- **NFT Contract**: Non-fungible tokens with enumeration capabilities
- **Modern Frontend**: React + TypeScript + Vite with auto-generated contract clients

### Tech Stack
- **Smart Contracts**: Rust + Soroban SDK
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Stellar Design System
- **Wallet Integration**: Stellar Wallets Kit
- **Build Tools**: Cargo (Rust) + npm (Frontend)

## 🏗 Architecture Deep Dive

### Project Structure
```
event2/
├── contracts/                   # Rust smart contracts
│   ├── guess-the-number/       # Game logic contract
│   ├── fungible-allowlist/     # Token with access control
│   └── nft-enumerable/         # NFT with enumeration
├── packages/                   # Auto-generated TypeScript clients
│   ├── guess_the_number/       # Generated from guess-the-number
│   ├── fungible_allowlist_example/
│   └── nft_enumerable_example/
├── src/                        # React frontend application
│   ├── components/            # Reusable UI components
│   ├── contracts/             # Contract interaction layer
│   ├── debug/                 # Contract debugging interface
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Application pages
│   ├── providers/             # React context providers
│   └── util/                  # Utility functions
├── target/                     # Rust build artifacts
├── .config/                    # Stellar CLI configuration
├── environments.toml           # Multi-environment setup
└── .env                        # Environment variables
```

### Data Flow
1. **Contract Compilation**: Rust contracts → WASM bytecode
2. **Client Generation**: WASM + metadata → TypeScript clients
3. **Frontend Integration**: TypeScript clients → React components
4. **User Interaction**: React UI → Wallet → Stellar Network

## 🔧 Smart Contracts Analysis

### 1. Guess The Number Contract

**Location**: `contracts/guess-the-number/src/lib.rs`

**Purpose**: Interactive gambling game where players guess numbers 1-10

**Key Features**:
- Admin-controlled random number generation
- XLM reward system (winner takes all)
- Automatic fund management
- Contract upgradeability

**Core Functions**:
```rust
// Initialize with admin and starting funds
pub fn __constructor(env: &Env, admin: Address)

// Player guesses a number (1-10)
pub fn guess(env: &Env, a_number: u64, guesser: Address) -> Result<bool, Error>

// Admin resets the number
pub fn reset(env: &Env)

// Admin adds more funds
pub fn add_funds(env: &Env, amount: i128)
```

**Game Logic**:
- Correct guess: Player wins entire contract balance
- Wrong guess: Player pays 1 XLM to contract
- Admin can reset number and add funds

### 2. Fungible Allowlist Contract

**Location**: `contracts/fungible-allowlist/src/contract.rs`

**Purpose**: ERC-20 style token with access control mechanisms

**Key Features**:
- SEP-41 compliant fungible token
- Allowlist-based access control
- Role-based permissions (admin/manager)
- Burnable tokens

**Core Functions**:
```rust
// Initialize token with metadata and roles
pub fn __constructor(e: &Env, admin: Address, manager: Address, initial_supply: i128)

// Standard token functions (inherited)
// - transfer, approve, balance_of, etc.

// Allowlist management
fn allow_user(e: &Env, user: Address, operator: Address)
fn disallow_user(e: &Env, user: Address, operator: Address)
```

**Access Control**:
- **Admin**: Full contract control
- **Manager**: Can manage allowlist
- **Users**: Must be allowlisted to hold tokens

### 3. NFT Enumerable Contract

**Location**: `contracts/nft-enumerable/src/contract.rs`

**Purpose**: Non-fungible tokens with enumeration capabilities

**Key Features**:
- Sequential token ID generation
- Owner-based minting
- Token enumeration (list all tokens/owners)
- Burnable NFTs

**Core Functions**:
```rust
// Initialize with owner and metadata
pub fn __constructor(e: &Env, owner: Address)

// Mint new token to address
pub fn mint(e: &Env, to: Address) -> u32

// Inherited enumeration functions
// - total_supply, token_by_index, token_of_owner_by_index
```

## 🖥 Frontend Architecture

### Component Structure

**Main Components**:
- `App.tsx`: Root component with routing
- `ConnectAccount.tsx`: Wallet connection interface
- `GuessTheNumber.tsx`: Game interaction component
- `WalletButton.tsx`: Wallet status display

**Key Hooks**:
- `useWallet()`: Wallet state management
- `useNotification()`: User notifications
- `useWalletBalance()`: Balance tracking

### Contract Integration Layer

**Location**: `src/contracts/`

Each contract has a TypeScript wrapper:
```typescript
// src/contracts/guess_the_number.ts
import * as Client from 'guess_the_number';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CCN4S3OJU7U57HOBKQZNYISID4NODJYEACHOVOZ6WJ6O4ZRQZ6CJSTZU',
  rpcUrl,
  allowHttp: true,
});
```

### Wallet Provider

**Location**: `src/providers/WalletProvider.tsx`

**Features**:
- Automatic wallet state polling
- Multi-wallet support via Stellar Wallets Kit
- Persistent connection state
- Network detection

**State Management**:
```typescript
interface WalletContextType {
  address?: string;
  network?: string;
  networkPassphrase?: string;
  isPending: boolean;
  signTransaction?: typeof wallet.signTransaction;
}
```

## ⚙️ Environment Configuration

### environments.toml Structure

**Development Environment**:
```toml
[development.network]
rpc-url = "http://localhost:8000/rpc"
network-passphrase = "Standalone Network ; February 2017"
run-locally = true

[[development.accounts]]
name = "me"
default = true

[development.contracts]
fungible_allowlist_example = { 
  client = true, 
  constructor_args = "--admin me --manager me --initial_supply 1000000000000000000000000" 
}
nft_enumerable_example = { 
  client = true, 
  constructor_args = "--owner me" 
}

[development.contracts.guess_the_number]
client = true
constructor_args = "--admin me"
after_deploy = "reset"
```

**Key Configuration Options**:
- `client = true`: Generate TypeScript client
- `constructor_args`: Arguments for contract initialization
- `after_deploy`: Commands to run after deployment
- `run-locally = true`: Auto-start local network

### Environment Variables

**.env Configuration**:
```env
STELLAR_SCAFFOLD_ENV=development
XDG_CONFIG_HOME=".config"
PUBLIC_STELLAR_NETWORK="LOCAL"
PUBLIC_STELLAR_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
PUBLIC_STELLAR_RPC_URL="http://localhost:8000/rpc"
PUBLIC_STELLAR_HORIZON_URL="http://localhost:8000"
```

**Network Switching**:
- **Local**: `PUBLIC_STELLAR_NETWORK="LOCAL"`
- **Testnet**: `PUBLIC_STELLAR_NETWORK="TESTNET"`
- **Mainnet**: `PUBLIC_STELLAR_NETWORK="MAINNET"`

## 🔄 Development Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Start development environment
npm run dev
```

### 2. Contract Development Cycle
```bash
# Watch for contract changes and rebuild clients
stellar scaffold watch --build-clients

# Manual contract build
cargo build --target wasm32-unknown-unknown --release

# Deploy specific contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/guess_the_number.wasm
```

### 3. Frontend Development
```bash
# Start Vite dev server
vite

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Pre-commit hooks (via Husky)
# Runs automatically on git commit
```

## 🚀 Deployment Guide

### Local Development
1. Contracts auto-deploy via `environments.toml`
2. TypeScript clients auto-generate
3. Frontend connects to local network

### Testnet Deployment
1. **Update environments.toml**:
```toml
[staging.contracts]
guess_the_number = { id = "CXXXXX..." }
fungible_allowlist_example = { id = "CXXXXX..." }
nft_enumerable_example = { id = "CXXXXX..." }
```

2. **Deploy contracts**:
```bash
stellar contract deploy --network testnet --source testnet-user
```

3. **Update environment**:
```bash
export STELLAR_SCAFFOLD_ENV=staging
```

### Mainnet Deployment
1. **Security checklist**:
   - Audit smart contracts
   - Test on testnet thoroughly
   - Verify contract addresses
   - Secure admin keys

2. **Deploy process**:
```bash
stellar contract deploy --network mainnet --source official-team-account
```

## 🐛 Debugging & Testing

### Built-in Debugger

**Location**: `/debug` route in frontend

**Features**:
- Contract method invocation
- Transaction simulation
- State inspection
- XDR analysis
- Error diagnostics

**Components**:
- `ContractForm.tsx`: Method invocation interface
- `JsonSchemaRenderer.tsx`: Dynamic form generation
- `PrettyJsonTransaction.tsx`: Transaction visualization
- `XdrJsonViewer.tsx`: XDR data inspection

### Testing Strategies

**Contract Testing**:
```rust
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_guess_correct() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let guesser = Address::generate(&env);
        
        let contract = GuessTheNumberClient::new(&env, &contract_id);
        contract.__constructor(&admin);
        
        // Test implementation
    }
}
```

**Frontend Testing**:
- Unit tests for components
- Integration tests for contract interactions
- E2E tests for user workflows

### Common Issues & Solutions

**Contract Deployment Failures**:
- Check WASM file size limits
- Verify constructor arguments
- Ensure sufficient account balance

**Client Generation Issues**:
- Rebuild contracts after changes
- Clear `target/` directory
- Check contract metadata

**Wallet Connection Problems**:
- Verify network configuration
- Check wallet extension installation
- Clear browser storage

## 🔬 Advanced Topics

### Custom Contract Extensions

**Adding New Functionality**:
1. Implement trait in contract
2. Add to `contractimpl` block
3. Update client generation
4. Create frontend components

### Performance Optimization

**Contract Optimization**:
- Minimize storage operations
- Use efficient data structures
- Optimize WASM size

**Frontend Optimization**:
- Lazy load contract clients
- Cache contract calls
- Optimize bundle size

### Security Considerations

**Smart Contract Security**:
- Input validation
- Access control checks
- Reentrancy protection
- Integer overflow prevention

**Frontend Security**:
- Secure wallet integration
- Transaction validation
- XSS prevention
- CSRF protection

### Monitoring & Analytics

**Contract Monitoring**:
- Event emission
- State change tracking
- Performance metrics
- Error logging

**Frontend Analytics**:
- User interaction tracking
- Transaction success rates
- Performance monitoring
- Error reporting

## 📚 Additional Resources

- [Soroban Documentation](https://soroban.stellar.org/)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Scaffold Stellar Repository](https://github.com/AhaLabs/scaffold-stellar)
- [Stellar Developer Discord](https://discord.gg/stellardev)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code review process

## 📄 License

Apache-2.0 - See LICENSE file for details