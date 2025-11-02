import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout, Text, Button, Card } from "@stellar/design-system";
import { supabase, Event } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";

const EventDetail: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { address } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!contractId) return;

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('contract_id', contractId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [contractId]);

  if (loading) {
    return (
      <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
        <Layout.Inset>
          <Text as="p" size="md" style={{ color: "white" }}>Loading event...</Text>
        </Layout.Inset>
      </Layout.Content>
    );
  }

  if (!event) {
    return (
      <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
        <Layout.Inset>
          <Text as="h1" size="xl" style={{ color: "white" }}>Event Not Found</Text>
          <Text as="p" size="md" style={{ color: "white" }}>
            The event you're looking for doesn't exist.
          </Text>
        </Layout.Inset>
      </Layout.Content>
    );
  }

  const isOwner = address === event.creator_address;

  return (
    <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <div style={{ maxWidth: "800px" }}>
          <Text as="h1" size="xl" style={{ color: "white", marginBottom: "1rem" }}>
            {event.name}
          </Text>
          
          <Card style={{ 
            backgroundColor: "#1a1a2e", 
            border: "1px solid #8866e0",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "0.5rem" }}>
                  Event Details
                </Text>
                <Text as="p" size="sm" style={{ color: "white", marginBottom: "0.5rem" }}>
                  <strong>Name:</strong> {event.name}
                </Text>
                <Text as="p" size="sm" style={{ color: "white", marginBottom: "0.5rem" }}>
                  <strong>Symbol:</strong> {event.symbol}
                </Text>
                <Text as="p" size="sm" style={{ color: "white", marginBottom: "0.5rem" }}>
                  <strong>URI:</strong> {event.uri}
                </Text>
                <Text as="p" size="sm" style={{ color: "white" }}>
                  <strong>Created:</strong> {new Date(event.created_at).toLocaleDateString()}
                </Text>
              </div>
              
              <div>
                <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "0.5rem" }}>
                  Contract Info
                </Text>
                <Text as="p" size="xs" style={{ color: "white", fontFamily: "monospace", wordBreak: "break-all" }}>
                  <strong>Contract ID:</strong><br />
                  {event.contract_id}
                </Text>
                <Text as="p" size="xs" style={{ color: "white", fontFamily: "monospace", wordBreak: "break-all", marginTop: "0.5rem" }}>
                  <strong>Creator:</strong><br />
                  {event.creator_address}
                </Text>
              </div>
            </div>
          </Card>

          {isOwner && (
            <Card style={{ 
              backgroundColor: "#1a1a2e", 
              border: "1px solid #8866e0",
              padding: "2rem"
            }}>
              <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "1rem" }}>
                Event Management
              </Text>
              <Text as="p" size="sm" style={{ color: "white", marginBottom: "1rem" }}>
                As the event creator, you can manage attendance and mint POA tokens.
              </Text>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  variant="primary"
                  size="md"
                  style={{ backgroundColor: "#8866e0", border: "none" }}
                >
                  Mark Attendance
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  style={{ backgroundColor: "transparent", border: "2px solid #8866e0", color: "#8866e0" }}
                >
                  View Attendees
                </Button>
              </div>
            </Card>
          )}

          {!isOwner && address && (
            <Card style={{ 
              backgroundColor: "#1a1a2e", 
              border: "1px solid #8866e0",
              padding: "2rem"
            }}>
              <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "1rem" }}>
                Attendance
              </Text>
              <Text as="p" size="sm" style={{ color: "white", marginBottom: "1rem" }}>
                RSVP for this event to be eligible for a proof-of-attendance token.
              </Text>
              <Button
                variant="primary"
                size="md"
                style={{ backgroundColor: "#8866e0", border: "none" }}
              >
                RSVP for Event
              </Button>
            </Card>
          )}
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default EventDetail;