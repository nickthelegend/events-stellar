import React, { useEffect, useState, useMemo } from "react";
import { Layout } from "@stellar/design-system";
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
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = events.map((event) => event.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [events]);

  return (
    <div className="min-h-screen bg-primary">
      <Layout.Inset>
        <div className="page max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
            <p className="text-secondary mb-6">
              Explore blockchain-verified events and proof-of-attendance token
              opportunities
            </p>

            {/* Search and Filter Section */}
            <div className="flex gap-4 mb-6 flex-wrap items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-80">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search events by name, description, symbol, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input min-w-40"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Results Count */}
              <p className="text-sm text-secondary ml-auto">
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "event" : "events"} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="card p-12 max-w-md mx-auto">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                type="button"
                <p className="text-secondary mb-6">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No events have been created yet."}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.contract_id}`}
                  className="card card-interactive overflow-hidden"
                >
                  {/* Event Image */}
                  {event.image_url && (
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded">
                        <p className="text-xs text-white font-mono">
                          {event.symbol}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {event.name}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-secondary mb-4 line-clamp-3">
                        {event.description.length > 120
                          ? `${event.description.slice(0, 120)}...`
                          : event.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <p className="text-sm text-secondary">
                            {event.location}
                          </p>
                        </div>
                      )}

                      {event.event_date && (
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <p className="text-sm text-secondary">
                            {new Date(event.event_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {event.max_tickets && (
                        <div className="flex items-center gap-2">
                          <span>🎟️</span>
                          <p className="text-sm text-secondary">
                            {event.max_tickets} max tickets
                          </p>
                        </div>
                      )}

                      {event.category && (
                        <div className="inline-block px-3 py-1 bg-secondary rounded-full">
                          <p className="text-xs text-primary font-medium">
                            {event.category}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs font-mono text-muted mb-1">
                        {event.contract_id.slice(0, 20)}...
                      </p>
                      <p className="text-xs text-muted">
                        Created:{" "}
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Layout.Inset>
    </div>
  );
};

export default Events;
