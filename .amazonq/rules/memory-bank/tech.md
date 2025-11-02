# Technology Stack

## Programming Languages
- **TypeScript 5.9.2**: Primary frontend language with strict type checking
- **Rust 2021 Edition**: Smart contract development with Soroban SDK
- **JavaScript/JSX**: React components and utilities

## Frontend Framework
- **React 19.1.1**: Modern React with hooks and concurrent features
- **Vite 7.1.11**: Fast build tool with HMR and optimized bundling
- **React Router DOM 7.9.3**: Client-side routing and navigation

## Blockchain Integration
- **Stellar SDK 14.2.0**: Core Stellar blockchain interactions
- **Soroban SDK 23.0.2**: Smart contract development framework
- **Stellar Wallets Kit 1.9.5**: Multi-wallet connectivity
- **Stellar Design System 3.1.5**: UI components following Stellar design patterns

## State Management & Data
- **TanStack React Query 5.90.2**: Server state management and caching
- **React Context**: Global state for wallet and notifications
- **Zod 4.1.11**: Runtime type validation and schema parsing

## Development Tools
- **ESLint 9.36.0**: Code linting with React and TypeScript rules
- **Prettier 3.6.2**: Code formatting and style consistency
- **Husky 9.1.7**: Git hooks for pre-commit validation
- **Concurrently 9.2.1**: Parallel script execution for development

## Build System
- **Cargo**: Rust package manager and build system
- **NPM Workspaces**: Monorepo package management
- **Vite Plugins**: WASM support and Node.js polyfills

## Smart Contract Dependencies
- **OpenZeppelin Stellar Contracts**: Security-audited contract libraries
  - stellar-access, stellar-tokens, stellar-fungible, stellar-non-fungible
  - stellar-pausable, stellar-macros for enhanced functionality

## Development Commands
- `npm run dev`: Start development server with contract watching
- `npm run build`: Production build with TypeScript compilation
- `npm run install:contracts`: Install and build contract packages
- `stellar scaffold watch --build-clients`: Auto-regenerate contract clients
- `cargo build --release`: Compile optimized smart contracts

## Environment Configuration
- **Local Development**: Standalone Stellar network on localhost:8000
- **Staging**: Stellar testnet with test accounts
- **Production**: Custom RPC provider with mainnet configuration