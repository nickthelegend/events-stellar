import React from "react";
import { Button, Layout, Text } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const { address, connect } = useWallet();

  return (
    <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
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
                onClick={connect}
                style={{ backgroundColor: "#8866e0", border: "none" }}
              >
                Connect Wallet to Get Started
              </Button>
            </div>
          ) : (
            <div style={{ marginBottom: "3rem" }}>
              <Text as="p" size="sm" style={{ fontFamily: "monospace", color: "white", marginBottom: "1rem" }}>
                Connected: {address}
              </Text>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <Link to="/new">
                  <Button 
                    variant="primary" 
                    size="lg"
                    style={{ backgroundColor: "#8866e0", border: "none" }}
                  >
                    Create Event
                  </Button>
                </Link>
                <Link to="/events">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    style={{ backgroundColor: "transparent", border: "2px solid #8866e0", color: "#8866e0" }}
                  >
                    View Events
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginTop: "4rem" }}>
            <div style={{ padding: "2rem", backgroundColor: "#1a1a2e", borderRadius: "8px" }}>
              <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "1rem" }}>Create Events</Text>
              <Text as="p" size="sm" style={{ color: "white" }}>Deploy smart contracts for your events and manage attendance verification</Text>
            </div>
            <div style={{ padding: "2rem", backgroundColor: "#1a1a2e", borderRadius: "8px" }}>
              <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "1rem" }}>POA Tokens</Text>
              <Text as="p" size="sm" style={{ color: "white" }}>Issue proof-of-attendance NFTs to verified participants</Text>
            </div>
            <div style={{ padding: "2rem", backgroundColor: "#1a1a2e", borderRadius: "8px" }}>
              <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "1rem" }}>Blockchain Verified</Text>
              <Text as="p" size="sm" style={{ color: "white" }}>All events and attendance records are stored on Stellar blockchain</Text>
            </div>
          </div>
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
