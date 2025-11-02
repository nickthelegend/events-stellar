# Development Guidelines

## Code Quality Standards

### TypeScript Conventions
- **Strict Type Safety**: Use explicit types for all function parameters and return values
- **Interface Definitions**: Define clear interfaces for complex objects (e.g., `WalletContextType`, `DeploymentResult`)
- **Optional Chaining**: Use `?.` for safe property access on potentially undefined objects
- **Type Guards**: Implement proper type checking with `typeof` and existence checks

### React Component Patterns
- **Functional Components**: Use React.FC type annotation for all components
- **Hook Dependencies**: Include exhaustive dependency arrays with ESLint disable comments when intentionally omitting
- **State Management**: Use `useState` with proper type annotations and `useTransition` for async operations
- **Context Providers**: Implement context with proper TypeScript interfaces and default values

### Error Handling Standards
- **Async Operations**: Wrap async calls in try-catch blocks with descriptive error messages
- **Contract Interactions**: Use specific error messages for blockchain operations (e.g., "WASM installation failed")
- **Graceful Degradation**: Provide fallback UI states for loading and error conditions
- **Console Logging**: Use structured logging with emojis for visual distinction (🚀, ✅, ❌, 📦)

## Architectural Patterns

### Smart Contract Integration
- **Three-Phase Deployment**: Install WASM → Create Contract Instance → Initialize Contract
- **Transaction Building**: Use `TransactionBuilder` with proper fee and timeout settings
- **Response Validation**: Check transaction status and extract results from response metadata
- **Contract Abstraction**: Separate contract deployment logic into dedicated utility functions

### State Management Patterns
- **Provider Pattern**: Use React Context for global state (wallet, notifications)
- **Polling Strategy**: Implement continuous state polling with cleanup on unmount
- **Storage Persistence**: Use local storage for wallet connection state persistence
- **Optimistic Updates**: Update UI state before blockchain confirmation

### Component Organization
- **Layout Components**: Use Stellar Design System Layout.Content and Layout.Inset for consistent spacing
- **Conditional Rendering**: Implement loading states, error states, and empty states
- **Navigation Integration**: Use React Router with NavLink for active state styling
- **Responsive Design**: Use flexbox with gap properties for consistent spacing

## Naming Conventions

### File and Directory Structure
- **PascalCase**: Component files (e.g., `WalletProvider.tsx`, `CreateEvent.tsx`)
- **camelCase**: Utility files (e.g., `contractDeploy.ts`, `useWallet.ts`)
- **kebab-case**: Contract directories (e.g., `hello-world/`)
- **Descriptive Names**: Use clear, purpose-driven names for all files and functions

### Variable and Function Naming
- **Descriptive Variables**: Use full words over abbreviations (e.g., `contractId` not `cId`)
- **Boolean Prefixes**: Use `is`, `has`, `should` prefixes for boolean variables
- **Event Handlers**: Use `handle` prefix for event handler functions
- **Async Functions**: Use descriptive verbs for async operations (e.g., `deployPOAContract`)

## Code Organization Patterns

### Import Structure
- **External Libraries**: Group imports from external packages first
- **Internal Modules**: Separate internal imports with clear organization
- **Type Imports**: Use `import type` for TypeScript-only imports when available
- **Relative Imports**: Use relative paths for local modules with clear directory structure

### Function Organization
- **Single Responsibility**: Each function should have one clear purpose
- **Parameter Validation**: Validate inputs at function entry points
- **Return Type Consistency**: Always specify return types for public functions
- **Helper Functions**: Extract reusable logic into separate utility functions

### Smart Contract Patterns (Rust)
- **Storage Symbols**: Use `symbol_short!` macro for storage keys with descriptive names
- **Access Control**: Use `#[only_owner]` macro for owner-restricted functions
- **Authentication**: Require caller authentication with `require_auth()` for user actions
- **State Validation**: Check existing state before mutations to prevent double-operations
- **Error Handling**: Use `panic!` with descriptive messages for contract violations

## Development Workflow Standards

### Environment Configuration
- **Multi-Environment Support**: Maintain separate configs for development, staging, production
- **Environment Variables**: Use `.env` files with clear variable naming
- **Network Abstraction**: Support multiple Stellar networks with proper passphrase handling
- **Local Development**: Provide localhost RPC endpoints for development

### Testing and Validation
- **Type Safety**: Leverage TypeScript compiler for compile-time validation
- **Runtime Validation**: Use Zod or similar for runtime type checking
- **Error Boundaries**: Implement proper error handling for async operations
- **State Consistency**: Validate state transitions in complex operations

### Performance Considerations
- **Memoization**: Use `useMemo` and `useCallback` for expensive computations
- **Polling Optimization**: Implement efficient polling with proper cleanup
- **Bundle Optimization**: Use dynamic imports for large dependencies
- **WASM Handling**: Optimize WASM loading and caching strategies