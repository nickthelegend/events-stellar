import React, { useEffect, useState } from "react";
import { Layout, Text, Card, Button, Icon } from "@stellar/design-system";
import { supabase, Event } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";
import { Link } from "react-router-dom";

const AdminEvents: React.FC = () => {
  const { address } = useWallet();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminEvents = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('creator_address', address)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching admin events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminEvents();
  }, [address]);

  if (!address) {
    return (
      <div style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
        <Layout.Inset>
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <Text as="h1" size="xl" style={{ color: "white", marginBottom: "1rem" }}>
              Admin Events
            </Text>
            <Text as="p" size="lg" style={{ color: "white", marginBottom: "2rem" }}>
              Connect your wallet to manage your events
            </Text>
            <div style={{ padding: "2rem", backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--primary)" }} className="glass">
              <Text as="p" size="md" style={{ color: "var(--text-secondary)" }}>
                Only events created by your connected wallet address will be displayed here.
              </Text>
            </div>
          </div>
        </Layout.Inset>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <Text as="h1" size="xl" style={{ color: "white", marginBottom: "0.5rem" }}>
              Admin Events
            </Text>
            <Text as="p" size="sm" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
              Managing events for: {address.slice(0, 20)}...
            </Text>
          </div>
          <Link to="/new">
            <Button
              variant="primary"
              size="md"
              style={{ backgroundColor: "var(--primary)", border: "none" }}
            >
              <Icon.Plus size="md" style={{ marginRight: "0.5rem" }} />
              Create New Event
            </Button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="spinner" style={{ width: "32px", height: "32px", border: "3px solid var(--bg-hover)", borderTop: "3px solid var(--primary)", borderRadius: "50%", margin: "0 auto 1rem" }}></div>
            <Text as="p" size="md" style={{ color: "var(--text-primary)" }}>Loading your events...</Text>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ padding: "3rem", backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-light)" }} className="glass">
              <Icon.FileX01 size="xl" style={{ color: "var(--primary)", marginBottom: "1rem" }} />
              <Text as="h3" size="md" style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
                No Events Found
              </Text>
              <Text as="p" size="sm" style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                You haven't created any events yet. Get started by creating your first event.
              </Text>
              <Link to="/new">
                <Button
                  variant="primary"
                  size="md"
                  style={{ backgroundColor: "var(--primary)", border: "none" }}
                >
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {events.map((event) => (
              <div
                key={event.id}
                className="card-hover glass"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <Text as="h3" size="md" style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>
                      {event.name}
                    </Text>
                    {event.description && (
                      <Text as="p" size="sm" style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                        {event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description}
                      </Text>
                    )}
                  </div>
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        marginLeft: "1rem"
                      }}
                    />
                  )}
                </div>
                
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <Text as="p" size="xs" style={{ color: "var(--text-secondary)" }}>Symbol:</Text>
                    <Text as="p" size="xs" style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>{event.symbol}</Text>
                  </div>
                  {event.location && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <Text as="p" size="xs" style={{ color: "var(--text-secondary)" }}>Location:</Text>
                      <Text as="p" size="xs" style={{ color: "var(--text-primary)" }}>{event.location}</Text>
                    </div>
                  )}
                  {event.event_date && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <Text as="p" size="xs" style={{ color: "var(--text-secondary)" }}>Date:</Text>
                      <Text as="p" size="xs" style={{ color: "var(--text-primary)" }}>{new Date(event.event_date).toLocaleDateString()}</Text>
                    </div>
                  )}
                  {event.max_tickets && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <Text as="p" size="xs" style={{ color: "var(--text-secondary)" }}>Max Tickets:</Text>
                      <Text as="p" size="xs" style={{ color: "var(--text-primary)" }}>{event.max_tickets}</Text>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem", marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text as="p" size="xs" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                      {event.contract_id.slice(0, 20)}...
                    </Text>
                    <Link to={`/event/${event.contract_id}`}>
                      <Button
                        variant="tertiary"
                        size="sm"
                        style={{ backgroundColor: "transparent", border: "1px solid var(--primary)", color: "var(--primary)" }}
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                  <Text as="p" size="xs" style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Layout.Inset>
    </div>
  );
};

export default AdminEvents;