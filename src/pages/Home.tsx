import React from "react";
import { Button, Layout, Text, Icon } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const { address, connect } = useWallet();

  return (
    <div style={{ backgroundColor: "transparent", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <div className="page-transition" style={{ textAlign: "center", padding: "6rem 2rem 4rem" }}>
          <div className="fade-in-up" style={{ marginBottom: "2rem" }}>
            <div style={{ 
              fontSize: '72px', 
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))'
            }}>
              🌟
            </div>
            <Text as="h1" size="xl" className="gradient-text" style={{ 
              fontSize: '56px', 
              fontWeight: '900', 
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
              lineHeight: '1.1'
            }}>
              Stellar Event Manager
            </Text>
            <Text as="p" size="lg" style={{ 
              color: "var(--text-secondary)", 
              fontSize: '20px',
              maxWidth: '700px',
              margin: '0 auto 3rem',
              lineHeight: '1.6'
            }}>
              Create and manage blockchain-verified events with proof-of-attendance tokens on Stellar
            </Text>
          </div>
          
          {!address ? (
            <div className="slide-in-right" style={{ marginBottom: "3rem" }}>
              <Button
                variant="primary"
                size="lg"
                onClick={connect}
                style={{ 
                  backgroundColor: "#6366f1", 
                  border: "none",
                  padding: "1rem 2.5rem",
                  fontSize: "18px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-glow)"
                }}
              >
                <Icon.Wallet01 size="md" style={{ marginRight: "0.75rem" }} />
                Connect Wallet to Get Started
              </Button>
            </div>
          ) : (
            <div className="slide-in-right" style={{ marginBottom: "3rem" }}>
              <div style={{ 
                padding: "1rem 1.5rem",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "12px",
                marginBottom: "2rem",
                display: "inline-block"
              }} className="glass">
                <Text as="p" size="sm" style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>
                  <Icon.CheckCircle size="sm" style={{ color: "#10b981", marginRight: "0.5rem", verticalAlign: "middle" }} />
                  Connected: {address.slice(0, 10)}...{address.slice(-8)}
                </Text>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/new">
                  <Button
                    variant="primary"
                    size="lg"
                    style={{ 
                      backgroundColor: "#6366f1", 
                      border: "none",
                      padding: "0.875rem 2rem",
                      fontSize: "16px",
                      fontWeight: "600",
                      borderRadius: "10px"
                    }}
                  >
                    <Icon.Plus size="md" style={{ marginRight: "0.5rem" }} />
                    Create Event
                  </Button>
                </Link>
                <Link to="/events">
                  <Button
                    variant="secondary"
                    size="lg"
                    style={{ 
                      backgroundColor: "transparent", 
                      border: "2px solid #6366f1", 
                      color: "#6366f1",
                      padding: "0.875rem 2rem",
                      fontSize: "16px",
                      fontWeight: "600",
                      borderRadius: "10px"
                    }}
                  >
                    <Icon.Globe01 size="md" style={{ marginRight: "0.5rem" }} />
                    Discover Events
                  </Button>
                </Link>
                <Link to="/admin/events">
                  <Button
                    variant="tertiary"
                    size="lg"
                    style={{ 
                      backgroundColor: "transparent", 
                      border: "1px solid var(--border-medium)", 
                      color: "var(--text-secondary)",
                      padding: "0.875rem 2rem",
                      fontSize: "16px",
                      fontWeight: "600",
                      borderRadius: "10px"
                    }}
                  >
                    <Icon.Settings01 size="md" style={{ marginRight: "0.5rem" }} />
                    My Events
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: "2rem", 
            marginTop: "5rem",
            maxWidth: "1200px",
            margin: "5rem auto 0"
          }}>
            <div style={{ 
              padding: "2.5rem", 
              backgroundColor: "var(--bg-card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border-light)",
              position: "relative",
              overflow: "hidden"
            }} className="card-hover glass">
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🚀</div>
              <Text as="h3" size="md" style={{ color: "#6366f1", marginBottom: "1rem", fontWeight: "700", fontSize: "20px" }}>
                Create Events
              </Text>
              <Text as="p" size="sm" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Deploy smart contracts for your events and manage attendance verification seamlessly
              </Text>
            </div>
            <div style={{ 
              padding: "2.5rem", 
              backgroundColor: "var(--bg-card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border-light)",
              position: "relative",
              overflow: "hidden"
            }} className="card-hover glass">
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🎫</div>
              <Text as="h3" size="md" style={{ color: "#8b5cf6", marginBottom: "1rem", fontWeight: "700", fontSize: "20px" }}>
                POA Tokens
              </Text>
              <Text as="p" size="sm" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Issue proof-of-attendance NFTs to verified participants with blockchain security
              </Text>
            </div>
            <div style={{ 
              padding: "2.5rem", 
              backgroundColor: "var(--bg-card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border-light)",
              position: "relative",
              overflow: "hidden"
            }} className="card-hover glass">
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🔐</div>
              <Text as="h3" size="md" style={{ color: "#06b6d4", marginBottom: "1rem", fontWeight: "700", fontSize: "20px" }}>
                Blockchain Verified
              </Text>
              <Text as="p" size="sm" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                All events and attendance records are immutably stored on Stellar blockchain
              </Text>
            </div>
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default Home;
