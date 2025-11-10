import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@stellar/design-system";
import { supabase, Event } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";

const AdminEventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { address } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("contract_id", eventId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Layout.Inset>
          <div className="page max-w-4xl mx-auto p-8">
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading event...</p>
            </div>
          </div>
        </Layout.Inset>
      </div>
    );
  }

  if (!event || event.creator_address !== address) {
    return (
      <div className="min-h-screen bg-primary">
        <Layout.Inset>
          <div className="page max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Access Denied
            </h1>
            <p className="text-secondary">
              You don't have permission to manage this event.
            </p>
          </div>
        </Layout.Inset>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Layout.Inset>
        <div className="page max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{event.name}</h1>
            <p className="text-secondary">Event Management Dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Info Card */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Event Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-secondary">Contract ID</p>
                  <p className="font-mono text-xs bg-secondary p-2 rounded break-all">
                    {event.contract_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary">Symbol</p>
                  <p className="text-white">{event.symbol}</p>
                </div>
                {event.location && (
                  <div>
                    <p className="text-sm text-secondary">Location</p>
                    <p className="text-white">{event.location}</p>
                  </div>
                )}
                {event.event_date && (
                  <div>
                    <p className="text-sm text-secondary">Date</p>
                    <p className="text-white">
                      {new Date(event.event_date).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Management Actions Card */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Management Actions
              </h3>
              <div className="space-y-4">
                <Link
                  to={`/admin/event/${event.contract_id}/checkin`}
                  className="btn btn-primary w-full block text-center"
                >
                  📱 Check-in Attendees
                </Link>
                <button type="button" className="btn btn-secondary w-full">
                  👥 View Attendees
                </button>
                <button type="button" className="btn btn-secondary w-full">
                  🎫 Mint POA Tokens
                </button>
                <Link
                  to={`/event/${event.contract_id}`}
                  className="btn btn-secondary w-full block text-center"
                >
                  👁️ View Public Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default AdminEventDetail;
