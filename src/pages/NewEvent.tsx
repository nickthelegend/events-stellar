import React, { useState } from "react";
import { Layout } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { deployPOAContract, EventParams } from "../util/contractDeploy";
import { supabase } from "../lib/supabase";
import {
  uploadImageToPinata,
  uploadMetadataToPinata,
  EventMetadata,
} from "../lib/pinata";
import { useNavigate } from "react-router-dom";

const NewEvent: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const navigate = useNavigate();
  const [eventParams, setEventParams] = useState<EventParams>({
    symbol: "POA",
    uri: "",
    name: "",
  });
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    eventDate: "",
    eventTime: "12:00",
    category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string>("");

  const handleDeploy = async () => {
    if (!address || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    if (!eventParams.name.trim()) {
      setError("Event name is required");
      return;
    }

    if (!imageFile) {
      setError("Event image is required");
      return;
    }

    if (!formData.eventDate) {
      setError("Event date is required");
      return;
    }

    setIsDeploying(true);
    setError("");

    try {
      // Upload image to Pinata
      console.log("📸 Uploading image to Pinata...");
      const imageHash = await uploadImageToPinata(imageFile);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

      // Create metadata object
      const metadata: EventMetadata = {
        name: eventParams.name,
        description: formData.description,
        location: formData.location,
        date: formData.eventDate,
        time: formData.eventTime,
        image: imageUrl,
        category: formData.category,
        creator: address,
      };

      // Upload metadata to Pinata
      console.log("📋 Uploading metadata to Pinata...");
      const metadataHash = await uploadMetadataToPinata(metadata);
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

      // Update eventParams with IPFS URI
      const updatedEventParams = {
        ...eventParams,
        uri: metadataUri,
      };

      const wasmPath = "/target/wasm32v1-none/release/hello_world.wasm";
      const response = await fetch(wasmPath);

      if (!response.ok) {
        throw new Error(`Failed to load WASM file: ${response.statusText}`);
      }

      const wasmBytes = new Uint8Array(await response.arrayBuffer());

      const result = await deployPOAContract(wasmBytes, updatedEventParams, {
        publicKey: address,
        signTransaction: async (xdr: string) => {
          const result = await signTransaction(xdr);
          return result.signedTxXdr;
        },
      });

      // Save to Supabase
      const { error: dbError } = await supabase.from("events").insert({
        name: eventParams.name,
        description: formData.description,
        symbol: eventParams.symbol,
        uri: metadataUri,
        contract_id: result.contractId,
        creator_address: address,
        location: formData.location,
        event_date: new Date(
          `${formData.eventDate}T${formData.eventTime}`,
        ).toISOString(),
        category: formData.category,
        image_url: imageUrl,
        metadata_ipfs_hash: metadataHash,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save event to database");
      }

      navigate(`/event/${result.contractId}`);
    } catch (err) {
      console.error("Deployment error:", err);
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-primary">
        <Layout.Inset>
          <div className="page max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Create Event</h1>
            <p className="text-secondary">
              Please connect your wallet to create a new POA event.
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
          <h1 className="text-3xl font-bold mb-2">Create New POA Event</h1>
          <p className="text-secondary mb-8">
            Deploy a new Proof of Attendance smart contract for your event.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDeploy();
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Name
                </label>
                <input
                  className="input"
                  value={eventParams.name}
                  onChange={(e) =>
                    setEventParams((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="input textarea"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  className="input"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Event location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Date
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        eventDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Time
                  </label>
                  <input
                    className="input"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        eventTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="">Select category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Token Symbol
                </label>
                <input
                  className="input"
                  value={eventParams.symbol}
                  onChange={(e) =>
                    setEventParams((prev) => ({
                      ...prev,
                      symbol: e.target.value,
                    }))
                  }
                  required
                  placeholder="POA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Event Image
              </label>
              <div className="card border-2 border-dashed border-primary aspect-square relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (e) =>
                        setImagePreview(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="flex items-center justify-center h-full cursor-pointer"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-primary">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm">Upload Image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="lg:col-span-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={isDeploying}
              >
                {isDeploying ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </Layout.Inset>
    </div>
  );
};

export default NewEvent;
