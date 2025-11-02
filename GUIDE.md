# Event2 - Stellar Smart Contract Frontend

A Scaffold Stellar project featuring three example smart contracts with a React frontend for interaction and testing.

## 🚀 Features

- **Guess The Number Game**: Interactive number guessing game with XLM rewards
- **Fungible Token with Allowlist**: Token contract with access control
- **Enumerable NFT**: Non-fungible token with enumeration capabilities
- **React Frontend**: Modern UI built with Vite, React, and TypeScript
- **Auto-generated Clients**: TypeScript bindings for all contracts
- **Multi-environment Support**: Development, staging, and production configurations

## 📋 Requirements

- [Rust](https://www.rust-lang.org/tools/install) with Cargo
- [Node.js](https://nodejs.org/) (v22+)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install)
- [Scaffold Stellar Plugin](https://github.com/AhaLabs/scaffold-stellar)

## 🛠 Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Start development environment**:
```bash
npm run dev
```

This will:
- Start the local Stellar network
- Deploy all contracts
- Generate TypeScript clients
- Launch the React frontend at `http://localhost:5173`

## 📁 Project Structure

```
event2/
├── contracts/                   # Smart contracts
│   ├── guess-the-number/       # Number guessing game
│   ├── fungible-allowlist/     # Token with access control
│   └── nft-enumerable/         # Enumerable NFT contract
├── packages/                   # Auto-generated TypeScript clients
├── src/                        # React frontend
│   ├── components/            # UI components
│   ├── contracts/             # Contract interaction helpers
│   ├── debug/                 # Contract debugging tools
│   ├── hooks/                 # Custom React hooks
│   └── pages/                 # Application pages
├── environments.toml          # Environment configurations
└── .env                       # Environment variables
```

## 🎮 Smart Contracts

### Guess The Number
Interactive game where players guess numbers 1-10:
- **Correct guess**: Win the contract's XLM balance
- **Wrong guess**: Pay 1 XLM to the contract
- **Admin functions**: Reset number, add funds, upgrade contract

### Fungible Allowlist
ERC-20 style token with access control:
- **Allowlist management**: Control who can hold tokens
- **Standard functions**: Transfer, approve, balance queries
- **Admin controls**: Manage allowlist and token supply

### NFT Enumerable
Non-fungible token with enumeration:
- **Mint/burn**: Create and destroy unique tokens
- **Enumeration**: List all tokens and owners
- **Metadata**: Store token information

## ⚙️ Environment Configuration

The project uses `environments.toml` for multi-environment setup:

### Development (Local Network)
- **Network**: Standalone local network
- **RPC**: `http://localhost:8000/rpc`
- **Auto-deploy**: All 3 contracts with client generation
- **Test account**: "me" with admin privileges

### Staging (Testnet)
- **Network**: Stellar Testnet
- **RPC**: `https://soroban-testnet.stellar.org`
- **Account**: "testnet-user"
- **Contracts**: Ready for testnet deployment (currently commented)

### Production (Mainnet)
- **Network**: Stellar Mainnet
- **RPC**: Custom provider URL
- **Account**: "official-team-account"
- **Contracts**: Production contract addresses (currently commented)

## 🔧 Available Scripts

- `npm run dev` - Start development with contract watching
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run install:contracts` - Install contract packages

## 🌐 Network Switching

Update `.env` file to switch networks:

**Local Development**:
```env
PUBLIC_STELLAR_NETWORK="LOCAL"
PUBLIC_STELLAR_RPC_URL="http://localhost:8000/rpc"
```

**Testnet**:
```env
PUBLIC_STELLAR_NETWORK="TESTNET"
PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
```

## 🚀 Deployment

### Testnet Deployment
1. Update `environments.toml` staging section with contract IDs
2. Set environment: `STELLAR_SCAFFOLD_ENV=staging`
3. Deploy contracts using Stellar CLI

### Mainnet Deployment
1. Update `environments.toml` production section
2. Set environment: `STELLAR_SCAFFOLD_ENV=production`
3. Deploy with production account

## 🔍 Debugging

The project includes a built-in contract debugger at `/debug` route:
- Inspect contract state
- Call contract methods
- View transaction history
- Test contract interactions

## 📚 Learn More

- [Scaffold Stellar Documentation](https://github.com/AhaLabs/scaffold-stellar)
- [Stellar Smart Contracts](https://developers.stellar.org/docs/build/smart-contracts)
- [Soroban SDK](https://docs.rs/soroban-sdk/)

## 📄 License

Apache-2.0