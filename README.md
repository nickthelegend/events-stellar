# Stellar Event Manager

A modern blockchain-based event management platform built on Stellar network with proof-of-attendance (POA) tokens.

## Features

- 🎫 **Event Creation**: Create blockchain-verified events with metadata stored on IPFS
- 🎟️ **POA Tokens**: Deploy smart contracts for proof-of-attendance tokens
- 📱 **QR Check-in**: Mobile-friendly QR code scanning for event attendance
- 👥 **RSVP System**: Complete attendee management with email notifications
- 🔐 **Wallet Integration**: Stellar wallet connectivity with multi-network support
- 📊 **Admin Dashboard**: Event management interface for organizers
- 💾 **Database Storage**: Supabase integration for event and attendee data

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Blockchain**: Stellar SDK + Soroban Smart Contracts
- **Database**: Supabase PostgreSQL
- **Storage**: Pinata IPFS
- **Email**: Resend API
- **Styling**: Custom CSS with modern design system
- **QR Scanner**: @yudiel/react-qr-scanner

## Prerequisites

- [Node.js](https://nodejs.org/) (v22+)
- [Rust](https://www.rust-lang.org/tools/install) + Cargo
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup)
- [Scaffold Stellar CLI](https://github.com/AhaLabs/scaffold-stellar)

## Environment Setup

1. **Clone and Install**:

```bash
git clone <repository>
cd event2
npm install
```

2. **Environment Variables** (`.env`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Pinata IPFS Configuration
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY_URL=your_pinata_gateway_url

# Resend Email Configuration
VITE_RESEND_API_KEY=your_resend_api_key

# Stellar Network Configuration
STELLAR_SCAFFOLD_ENV=development
```

3. **Database Setup**:

```sql
-- Run in Supabase SQL Editor
\i events_schema.sql
\i rsvp_schema.sql
\i rsvp_schema_update.sql
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Install contract packages
npm run install:contracts

# Watch contracts and rebuild clients
stellar scaffold watch --build-clients
```

## Project Structure

```
event2/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Application pages
│   │   ├── Home.tsx        # Landing page
│   │   ├── NewEvent.tsx    # Event creation form
│   │   ├── Events.tsx      # Event listing
│   │   ├── EventDetail.tsx # Event details & RSVP
│   │   ├── AdminEvents.tsx # Admin dashboard
│   │   ├── CheckIn.tsx     # QR scanner check-in
│   │   └── ManageAttendees.tsx # Attendee management
│   ├── lib/                # External service integrations
│   │   ├── supabase.ts     # Database client
│   │   ├── pinata.ts       # IPFS storage
│   │   └── email.ts        # Email notifications
│   ├── util/               # Utility functions
│   │   ├── contractDeploy.ts # Smart contract deployment
│   │   └── contractRsvp.ts   # RSVP contract interactions
│   ├── hooks/              # Custom React hooks
│   ├── providers/          # Context providers
│   └── index.css           # Custom styling
├── contracts/              # Rust smart contracts
├── packages/               # Generated TypeScript clients
├── target/                 # Build artifacts
├── environments.toml       # Network configurations
└── *.sql                   # Database schemas
```

## Key Features Implementation

### Event Creation Flow

1. **Form Submission**: User fills event details and uploads image
2. **IPFS Upload**: Image and metadata uploaded to Pinata
3. **Contract Deployment**: POA token contract deployed to Stellar
4. **Database Storage**: Event data stored in Supabase

### RSVP System

1. **User Registration**: Attendee provides email and wallet address
2. **Database Entry**: RSVP stored with pending status
3. **Admin Approval**: Event creator approves/rejects RSVPs
4. **Email Notification**: Automated emails sent via Resend

### Check-in Process

1. **QR Generation**: Unique QR codes generated for approved attendees
2. **Mobile Scanning**: Event organizers scan QR codes
3. **Token Minting**: POA tokens minted to attendee wallets
4. **Status Update**: Attendance recorded in database

## Smart Contract Integration

### Contract Deployment

```typescript
// Deploy POA contract with metadata
const result = await deployPOAContract({
  name: "Event POA Token",
  symbol: "POA",
  metadataUri: ipfsHash,
  organizer: walletAddress,
});
```

### RSVP Contract Calls

```typescript
// Register for event
await rsvpForEvent(contractId, attendeeAddress);

// Check attendance status
const hasAttended = await checkAttendance(contractId, attendeeAddress);
```

## Database Schema

### Events Table

- `id`: UUID primary key
- `title`, `description`: Event details
- `date_time`: Event timestamp
- `location`: Event venue
- `image_url`: IPFS image hash
- `contract_id`: Stellar contract address
- `creator_wallet`: Organizer wallet address
- `metadata_uri`: IPFS metadata hash

### RSVPs Table

- `id`: UUID primary key
- `event_id`: Foreign key to events
- `attendee_wallet`: Stellar wallet address
- `email`: Contact email
- `status`: pending/approved/rejected
- `checked_in`: Attendance status

## API Integrations

### Supabase Operations

```typescript
// Insert new event
const { data } = await supabase.from("events").insert(eventData).select();

// Update RSVP status
await supabase.from("rsvps").update({ status: "approved" }).eq("id", rsvpId);
```

### Pinata IPFS Upload

```typescript
// Upload image to IPFS
const imageResult = await pinata.upload.file(file);

// Upload metadata JSON
const metadataResult = await pinata.upload.json(metadata);
```

### Resend Email

```typescript
// Send approval notification
await resend.emails.send({
  from: "events@nickthelegened.tech",
  to: attendeeEmail,
  subject: "RSVP Approved",
  html: emailTemplate,
});
```

## Deployment

### Testnet Deployment

```bash
# Deploy contracts to testnet
stellar registry publish --network testnet
stellar registry deploy --network testnet

# Build and deploy frontend
npm run build
# Deploy to your hosting platform
```

### Production Considerations

- Configure production Stellar network in `environments.toml`
- Set up proper domain for email sending
- Configure CORS settings for Supabase
- Optimize IPFS gateway for performance
- Set up monitoring and error tracking

## Troubleshooting

### Common Issues

- **Wallet Connection**: Ensure Stellar wallet extension is installed
- **Contract Deployment**: Check network configuration and account funding
- **IPFS Upload**: Verify Pinata JWT token permissions
- **Email Delivery**: Confirm Resend API key and domain setup
- **Database Errors**: Check Supabase connection and table schemas

### Debug Tools

- Use `/debug` route for contract exploration
- Check browser console for detailed error messages
- Monitor network requests in developer tools
- Verify environment variables are properly loaded

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow TypeScript and React best practices
4. Test thoroughly on testnet before mainnet
5. Submit pull request with detailed description

## License

MIT License - see LICENSE file for details
