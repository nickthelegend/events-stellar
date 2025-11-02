import React, { useEffect, useState, useMemo } from "react";
import { Layout, Text, Button, Icon } from "@stellar/design-system";
import { supabase, Event } from "../lib/supabase";
import { Link } from "react-router-dom";

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery === "" ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = events.map(event => event.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [events]);

  return (
    <div style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <div style={{ marginBottom: "2rem" }}>
          <Text as="h1" size="xl" style={{ color: "white", marginBottom: "1rem" }}>
            Discover Events
          </Text>
          <Text as="p" size="md" style={{ color: "#a0a0b8", marginBottom: "2rem" }}>
            Explore blockchain-verified events and proof-of-attendance token opportunities
          </Text>

          {/* Search and Filter Section */}
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: "1", minWidth: "300px" }}>
              <Icon.SearchLg size="md" style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)"
              }} />
              <input
                type="text"
                placeholder="Search events by name, description, symbol, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 3rem",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-light)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                minWidth: "150px",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Results Count */}
            <Text as="p" size="sm" style={{ color: "var(--text-secondary)", marginLeft: "auto" }}>
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </Text>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="spinner" style={{ width: "32px", height: "32px", border: "3px solid var(--bg-hover)", borderTop: "3px solid var(--primary)", borderRadius: "50%", margin: "0 auto 1rem" }}></div>
            <Text as="p" size="md" style={{ color: "var(--text-primary)" }}>Loading events...</Text>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ padding: "3rem", backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-light)" }} className="glass">
              <Icon.SearchLg size="xl" style={{ color: "var(--primary)", marginBottom: "1rem" }} />
              <Text as="h3" size="md" style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
                No Events Found
              </Text>
              <Text as="p" size="sm" style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No events have been created yet."
                }
              </Text>
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  style={{ backgroundColor: "transparent", border: "1px solid var(--primary)", color: "var(--primary)" }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.contract_id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card-hover glass"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                    padding: "0",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Event Image */}
                  {event.image_url && (
                    <div style={{
                      height: "200px",
                      overflow: "hidden",
                      position: "relative"
                    }}>
                      <img
                        src={event.image_url}
                        alt={event.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        backdropFilter: "blur(4px)",
                      }}>
                        <Text as="p" size="xs" style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>
                          {event.symbol}
                        </Text>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "1.5rem" }}>
                    <Text as="h3" size="md" style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>
                      {event.name}
                    </Text>
                    
                    {event.description && (
                      <Text as="p" size="sm" style={{ color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: "1.4" }}>
                        {event.description.length > 120 ? `${event.description.slice(0, 120)}...` : event.description}
                      </Text>
                    )}

                    <div style={{ marginBottom: "1rem" }}>
                      {event.location && (
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)", marginRight: "0.5rem", fontSize: "14px" }}>📍</span>
                          <Text as="p" size="sm" style={{ color: "var(--text-secondary)" }}>{event.location}</Text>
                        </div>
                      )}
                      
                      {event.event_date && (
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)", marginRight: "0.5rem", fontSize: "14px" }}>📅</span>
                          <Text as="p" size="sm" style={{ color: "var(--text-secondary)" }}>{new Date(event.event_date).toLocaleDateString()}</Text>
                        </div>
                      )}

                      {event.max_tickets && (
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)", marginRight: "0.5rem", fontSize: "14px" }}>🎟️</span>
                          <Text as="p" size="sm" style={{ color: "var(--text-secondary)" }}>{event.max_tickets} max tickets</Text>
                        </div>
                      )}

                      {event.category && (
                        <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", backgroundColor: "var(--bg-hover)", borderRadius: "12px", marginTop: "0.5rem" }}>
                          <Text as="p" size="xs" style={{ color: "var(--primary)" }}>{event.category}</Text>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                      <Text as="p" size="xs" style={{ color: "var(--text-secondary)", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                        {event.contract_id.slice(0, 20)}...
                      </Text>
                      <Text as="p" size="xs" style={{ color: "var(--text-secondary)" }}>
                        Created: {new Date(event.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Layout.Inset>
    </div>
  );
};

export default Events;