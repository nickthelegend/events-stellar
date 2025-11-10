import React from "react";
import { Layout } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-primary">
      <Layout.Inset>
        <div className="page text-center" style={{ padding: "4rem 1rem" }}>
          {/* Hero Section */}
          <div className="slide-up mb-8">
            <div className="text-5xl mb-4">🌟</div>
            <h1 className="text-5xl font-bold text-white mb-6">EventStellar</h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
              Create and manage blockchain-verified events with
              proof-of-attendance tokens on Stellar
            </p>
          </div>

          {/* Action Section */}
          {!address ? (
            <div className="scale-in mb-12">
              type="button"
              <button
                className="btn btn-primary btn-lg"
                onClick={() => window.open("https://freighter.app/", "_blank")}
              >
                <span className="text-lg">👛</span>
                Connect Wallet to Get Started
              </button>
            </div>
          ) : (
            <div className="scale-in mb-12">
              <div className="bg-card border rounded-lg p-4 mb-6 inline-block">
                <p className="font-mono text-sm text-secondary flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Connected: {address?.slice(0, 10)}...{address?.slice(-8)}
                </p>
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/new" className="btn btn-primary btn-lg">
                  <span>➕</span>
                  Create Event
                </Link>
                <Link to="/events" className="btn btn-secondary btn-lg">
                  <span>🌐</span>
                  Discover Events
                </Link>
                <Link to="/admin/events" className="btn btn-secondary btn-lg">
                  <span>⚙️</span>
                  My Events
                </Link>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card card-interactive p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Create Events
              </h3>
              <p className="text-secondary">
                Deploy smart contracts for your events and manage attendance
                verification seamlessly
              </p>
            </div>
            <div className="card card-interactive p-8">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                POA Tokens
              </h3>
              <p className="text-secondary">
                Issue proof-of-attendance NFTs to verified participants with
                blockchain security
              </p>
            </div>
            <div className="card card-interactive p-8">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Blockchain Verified
              </h3>
              <p className="text-secondary">
                All events and attendance records are immutably stored on
                Stellar blockchain
              </p>
            </div>
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default Home;
