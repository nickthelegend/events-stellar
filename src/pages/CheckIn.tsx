import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@stellar/design-system";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase, Event } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";

const CheckIn: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { address } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannedData, setScannedData] = useState<string>("");
  const [scanHistory, setScanHistory] = useState<string[]>([]);

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

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedValue = detectedCodes[0].rawValue;
      setScannedData(scannedValue);
      setScanHistory((prev) => [scannedValue, ...prev.slice(0, 9)]); // Keep last 10 scans
      console.log("Scanned:", scannedValue);
    }
  };

  const handleError = (error: any) => {
    console.error("Scanner error:", error);
  };

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
              You don't have permission to check-in attendees for this event.
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Check-in Attendees
            </h1>
            <p className="text-secondary">{event.name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Scanner */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                QR Code Scanner
              </h3>
              <div className="aspect-square">
                <Scanner onScan={handleScan} onError={handleError} />
              </div>
              <p className="text-sm text-secondary mt-4 text-center">
                Scan attendee QR codes to check them in
              </p>
            </div>

            {/* Scan Results */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Scan Results
              </h3>

              {scannedData && (
                <div className="mb-6">
                  <p className="text-sm text-secondary mb-2">Latest Scan:</p>
                  <div className="bg-secondary p-3 rounded">
                    <p className="font-mono text-sm break-all">{scannedData}</p>
                  </div>
                  <button type="button" className="btn btn-primary mt-3 w-full">
                    ✅ Check-in Attendee
                  </button>
                </div>
              )}

              {scanHistory.length > 0 && (
                <div>
                  <p className="text-sm text-secondary mb-3">Recent Scans:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scanHistory.map((scan, index) => (
                      <div key={index} className="bg-secondary p-2 rounded">
                        <p className="font-mono text-xs break-all">{scan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scanHistory.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📱</div>
                  <p className="text-secondary">No scans yet</p>
                  <p className="text-sm text-secondary">
                    Start scanning QR codes to check-in attendees
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default CheckIn;
