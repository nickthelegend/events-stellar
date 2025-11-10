import React, { useEffect, useState } from "react";
import { Layout } from "@stellar/design-system";
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
          .from("events")
          .select("*")
          .eq("creator_address", address)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching admin events:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchAdminEvents();
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen bg-primary">
        <Layout.Inset>
          <div className="page max-w-4xl mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">My Events</h1>
            <p className="text-xl text-secondary mb-8">
              Connect your wallet to manage your events
            </p>
            <div className="card p-8 max-w-md mx-auto">
              <p className="text-secondary">
                Only events created by your connected wallet address will be
                displayed here.
              </p>
            </div>
          </div>
        </Layout.Inset>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Layout.Inset>
        <div className="page max-w-6xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
              <p className="text-sm text-secondary font-mono">
                Managing events for: {address.slice(0, 20)}...
              </p>
            </div>
            <Link to="/new" className="btn btn-primary">
              <span>➕</span>
              Create New Event
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading your events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="card p-12 max-w-md mx-auto">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Events Found
                </h3>
                <p className="text-secondary mb-6">
                  You haven't created any events yet. Get started by creating
                  your first event.
                </p>
                <Link to="/new" className="btn btn-primary">
                  Create Your First Event
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="card card-interactive p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-secondary mb-3 line-clamp-2">
                          {event.description.length > 100
                            ? `${event.description.slice(0, 100)}...`
                            : event.description}
                        </p>
                      )}
                    </div>
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="w-16 h-16 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-secondary">Symbol:</span>
                      <span className="text-xs font-mono text-white">
                        {event.symbol}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary">
                          Location:
                        </span>
                        <span className="text-xs text-white">
                          {event.location}
                        </span>
                      </div>
                    )}
                    {event.event_date && (
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary">Date:</span>
                        <span className="text-xs text-white">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {event.max_tickets && (
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary">
                          Max Tickets:
                        </span>
                        <span className="text-xs text-white">
                          {event.max_tickets}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-mono text-secondary">
                        {event.contract_id.slice(0, 20)}...
                      </p>
                      <Link
                        to={`/event/${event.contract_id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                    <p className="text-xs text-secondary mt-2">
                      Created: {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout.Inset>
    </div>
  );
};

export default AdminEvents;
