import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@stellar/design-system";
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
          .from("events")
          .select("*")
          .eq("contract_id", contractId)
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
  }, [contractId]);

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

  if (!event) {
    return (
      <div className="min-h-screen bg-primary">
        <Layout.Inset>
          <div className="page max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
            <p className="text-secondary">
              The event you're looking for doesn't exist.
            </p>
          </div>
        </Layout.Inset>
      </div>
    );
  }

  const isOwner = address === event.creator_address;

  return (
    <div className="min-h-screen bg-primary">
      <Layout.Inset>
        <div className="page max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
            {event.description && (
              <p className="text-xl text-secondary mb-6">{event.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Image */}
            <div className="lg:col-span-1">
              {event.image_url && (
                <div className="card overflow-hidden mb-6">
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="lg:col-span-2">
              <div className="card p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="space-y-3">
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.event_date && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{new Date(event.event_date).toLocaleString()}</span>
                    </div>
                  )}
                  {event.category && (
                    <div className="flex items-center gap-2">
                      <span>🏷️</span>
                      <span className="capitalize">{event.category}</span>
                    </div>
                  )}
                  {event.max_tickets && (
                    <div className="flex items-center gap-2">
                      <span>🎟️</span>
                      <span>{event.max_tickets} max tickets</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Info */}
              <div className="card p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Contract Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-secondary mb-1">Contract ID</p>
                    <p className="font-mono text-sm bg-secondary p-2 rounded break-all">
                      {event.contract_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary mb-1">Token Symbol</p>
                    <p className="font-mono text-sm">{event.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary mb-1">Creator</p>
                    <p className="font-mono text-sm bg-secondary p-2 rounded break-all">
                      {event.creator_address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary mb-1">Created</p>
                    <p className="text-sm">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card p-6">
                {!address ? (
                  <div className="text-center">
                    <p className="text-secondary mb-4">
                      Connect your wallet to register for this event
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={() =>
                        window.open("https://freighter.app/", "_blank")
                      }
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : isOwner ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Event Management
                    </h3>
                    <p className="text-secondary mb-4">
                      As the event creator, you can manage attendance and mint
                      POA tokens.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      <button type="button" className="btn btn-primary">
                        Mark Attendance
                      </button>
                      <button type="button" className="btn btn-secondary">
                        View Attendees
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Register for Event
                    </h3>
                    <p className="text-secondary mb-4">
                      Register for this event to be eligible for a
                      proof-of-attendance token.
                    </p>
                    <button type="button" className="btn btn-primary btn-lg">
                      🎫 Register for Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default EventDetail;
