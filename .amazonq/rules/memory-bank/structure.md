# Project Structure

## Directory Organization

### Core Application (`src/`)
- **`components/`** - Reusable React components for wallet connection, network display, and UI elements
- **`pages/`** - Main application pages (Home, CreateEvent, Debugger)
- **`providers/`** - React context providers for wallet and notification management
- **`hooks/`** - Custom React hooks for wallet, notifications, and blockchain interactions
- **`contracts/`** - Contract interaction utilities and generated client interfaces
- **`util/`** - Utility functions for contract deployment, wallet operations, and storage
- **`debug/`** - Comprehensive debugging tools with components, hooks, and validation utilities

### Smart Contracts (`contracts/`)
- **`hello-world/`** - Example Rust smart contract with Soroban SDK
- Cargo workspace configuration for contract compilation and management

### Generated Packages (`packages/`)
- **`hello_world/`** - Auto-generated TypeScript client for contract interaction
- NPM workspace structure for contract bindings and type definitions

### Configuration Files
- **`environments.toml`** - Multi-environment configuration (development, staging, production)
- **`Cargo.toml`** - Rust workspace and dependency management
- **`package.json`** - Frontend dependencies and build scripts
- **`vite.config.ts`** - Vite bundler configuration with WASM support

### Build Artifacts (`target/`)
- Compiled Rust contracts and WASM binaries
- Release builds optimized for blockchain deployment

## Architectural Patterns

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI development
- **Provider Pattern**: Centralized state management for wallet and notifications
- **Custom Hooks**: Reusable logic for blockchain interactions
- **Modular Components**: Separation of concerns with dedicated component directories

### Smart Contract Integration
- **Auto-Generated Clients**: TypeScript bindings generated from Rust contracts
- **Multi-Environment Deployment**: Seamless switching between local, testnet, and mainnet
- **Contract Abstraction**: Utility layers for simplified contract interactions

### Development Workflow
- **Hot Reload**: Automatic client regeneration on contract changes
- **Workspace Management**: Monorepo structure with NPM workspaces
- **Build Pipeline**: Integrated Rust and TypeScript compilation