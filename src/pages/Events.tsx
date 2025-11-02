import React, { useEffect, useState } from "react";
import { Layout, Text, Card } from "@stellar/design-system";
import { supabase, Event } from "../lib/supabase";
import { Link } from "react-router-dom";

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <Text as="h1" size="xl" style={{ color: "white", marginBottom: "2rem" }}>
          All Events
        </Text>

        {loading ? (
          <Text as="p" size="md" style={{ color: "white" }}>Loading events...</Text>
        ) : events.length === 0 ? (
          <Text as="p" size="md" style={{ color: "white" }}>No events found.</Text>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {events.map((event) => (
              <Link 
                key={event.id} 
                to={`/event/${event.contract_id}`}
                style={{ textDecoration: "none" }}
              >
                <Card style={{ 
                  backgroundColor: "#1a1a2e", 
                  border: "1px solid #8866e0",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}>
                  <Text as="h3" size="md" style={{ color: "#8866e0", marginBottom: "0.5rem" }}>
                    {event.name}
                  </Text>
                  <Text as="p" size="sm" style={{ color: "white", marginBottom: "0.5rem" }}>
                    Symbol: {event.symbol}
                  </Text>
                  <Text as="p" size="xs" style={{ color: "#888", fontFamily: "monospace" }}>
                    {event.contract_id.slice(0, 20)}...
                  </Text>
                  <Text as="p" size="xs" style={{ color: "#888", marginTop: "0.5rem" }}>
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </Text>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Events;