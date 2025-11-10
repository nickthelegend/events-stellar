import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@stellar/design-system";
import { supabase, Event, Rsvp } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";
import { sendEmail } from "../lib/email";

const ManageAttendees: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { address } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;

      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("contract_id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        const { data: rsvpData, error: rsvpError } = await supabase
          .from("rsvps")
          .select("*")
          .eq("contract_id", eventId)
          .order("created_at", { ascending: false });

        if (rsvpError) throw rsvpError;
        setAttendees(rsvpData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [eventId]);

  const updateAttendeeStatus = async (
    attendeeId: string,
    status: "approved" | "rejected",
    email: string,
  ) => {
    try {
      const { error } = await supabase
        .from("rsvps")
        .update({ status })
        .eq("id", attendeeId);

      if (error) throw error;

      // Send email notification
      const subject =
        status === "approved"
          ? `✅ Your registration for ${event?.name} has been approved!`
          : `❌ Your registration for ${event?.name} has been declined`;

      const message =
        status === "approved"
          ? `Congratulations! Your registration for ${event?.name} has been approved. You can now attend the event and receive your proof-of-attendance token.`
          : `We're sorry, but your registration for ${event?.name} has been declined. Please contact the event organizer for more information.`;

      const emailResult = await sendEmail(email, subject, message);
      console.log("Email sent:", emailResult);

      // Update local state
      setAttendees((prev) =>
        prev.map((attendee) =>
          attendee.id === attendeeId ? { ...attendee, status } : attendee,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Layout.Inset>
          <div className="page max-w-6xl mx-auto p-8">
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading attendees...</p>
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
          <div className="page max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Access Denied
            </h1>
            <p className="text-secondary">
              You don't have permission to manage attendees for this event.
            </p>
          </div>
        </Layout.Inset>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Layout.Inset>
        <div className="page max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Manage Attendees
            </h1>
            <p className="text-secondary">{event.name}</p>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Attendee Registrations ({attendees.length})
              </h3>
            </div>

            {attendees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-secondary">No registrations yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-white">Email</th>
                      <th className="text-left py-3 px-4 text-white">
                        Wallet Address
                      </th>
                      <th className="text-left py-3 px-4 text-white">Status</th>
                      <th className="text-left py-3 px-4 text-white">
                        Registered
                      </th>
                      <th className="text-left py-3 px-4 text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr
                        key={attendee.id}
                        className="border-b border-gray-700"
                      >
                        <td className="py-3 px-4 text-white">
                          {attendee.email}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-secondary">
                          {attendee.attendee_address.slice(0, 10)}...
                          {attendee.attendee_address.slice(-8)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              attendee.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : attendee.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {attendee.status || "pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-secondary text-sm">
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {(!attendee.status ||
                            attendee.status === "pending") && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  updateAttendeeStatus(
                                    attendee.id,
                                    "approved",
                                    attendee.email,
                                  )
                                }
                              >
                                ✅ Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  updateAttendeeStatus(
                                    attendee.id,
                                    "rejected",
                                    attendee.email,
                                  )
                                }
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default ManageAttendees;
