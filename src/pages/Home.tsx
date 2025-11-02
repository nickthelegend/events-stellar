import React from "react";
import { Button, Layout, Text, Icon } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const { address } = useWallet();

  return (
    <div style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <Text as="h1" size="xl" style={{ color: "white", marginBottom: "1rem" }}>
            Stellar Event Manager
          </Text>
          <Text as="p" size="lg" style={{ color: "white", marginBottom: "3rem" }}>
            Create and manage blockchain-verified events with proof-of-attendance tokens
          </Text>
          
          {!address ? (
            <div style={{ marginBottom: "3rem" }}>
              <Button
                variant="primary"
                size="lg"
                style={{ backgroundColor: "#6366f1", border: "none" }}
              >
                Connect Wallet to Get Started
              </Button>
            </div>
          ) : (
            <div style={{ marginBottom: "3rem" }}>
              <Text as="p" size="sm" style={{ fontFamily: "monospace", color: "white", marginBottom: "1rem" }}>
                Connected: {address}
              </Text>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/new">
                  <Button
                    variant="primary"
                    size="lg"
                    style={{ backgroundColor: "#6366f1", border: "none" }}
                  >
                    <Icon.Plus size="md" style={{ marginRight: "0.5rem" }} />
                    Create Event
                  </Button>
                </Link>
                <Link to="/events">
                  <Button
                    variant="secondary"
                    size="lg"
                    style={{ backgroundColor: "transparent", border: "2px solid #6366f1", color: "#6366f1" }}
                  >
                    <Icon.Globe01 size="md" style={{ marginRight: "0.5rem" }} />
                    Discover Events
                  </Button>
                </Link>
                <Link to="/admin/events">
                  <Button
                    variant="tertiary"
                    size="lg"
                    style={{ backgroundColor: "transparent", border: "1px solid #a0a0b8", color: "#a0a0b8" }}
                  >
                    <Icon.Settings01 size="md" style={{ marginRight: "0.5rem" }} />
                    My Events
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginTop: "4rem" }}>
            <div style={{ padding: "2rem", backgroundColor: "#111111", borderRadius: "12px", border: "1px solid #27272a" }} className="card-hover glass">
              <Text as="h3" size="md" style={{ color: "#6366f1", marginBottom: "1rem" }}>Create Events</Text>
              <Text as="p" size="sm" style={{ color: "white" }}>Deploy smart contracts for your events and manage attendance verification</Text>
            </div>
            <div style={{ padding: "2rem", backgroundColor: "#111111", borderRadius: "12px", border: "1px solid #27272a" }} className="card-hover glass">
              <Text as="h3" size="md" style={{ color: "#6366f1", marginBottom: "1rem" }}>POA Tokens</Text>
              <Text as="p" size="sm" style={{ color: "white" }}>Issue proof-of-attendance NFTs to verified participants</Text>
            </div>
            <div style={{ padding: "2rem", backgroundColor: "#111111", borderRadius: "12px", border: "1px solid #27272a" }} className="card-hover glass">
              <Text as="h3" size="md" style={{ color: "#6366f1", marginBottom: "1rem" }}>Blockchain Verified</Text>
              <Text as="p" size="sm" style={{ color: "white" }}>All events and attendance records are stored on Stellar blockchain</Text>
            </div>
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default Home;
