import React, { useState } from "react";
import { Button, Input, Layout, Text, Card } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { deployPOAContract, EventParams } from "../util/contractDeploy";
import { supabase } from "../lib/supabase";
import { uploadImageToPinata, uploadMetadataToPinata, EventMetadata } from "../lib/pinata";
import { useNavigate } from "react-router-dom";

const NewEvent: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const navigate = useNavigate();
  const [eventParams, setEventParams] = useState<EventParams>({
    symbol: "POA",
    uri: "",
    name: ""
  });
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    eventDate: "",
    eventTime: "12:00",
    maxTickets: "",
    ticketPrice: "",
    category: ""
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
        maxTickets: parseInt(formData.maxTickets) || 0,
        ticketPrice: parseFloat(formData.ticketPrice) || 0,
        category: formData.category,
        creator: address
      };

      // Upload metadata to Pinata
      console.log("📋 Uploading metadata to Pinata...");
      const metadataHash = await uploadMetadataToPinata(metadata);
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

      // Update eventParams with IPFS URI
      const updatedEventParams = {
        ...eventParams,
        uri: metadataUri
      };

      const wasmPath = "/target/wasm32v1-none/release/hello_world.wasm";
      const response = await fetch(wasmPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load WASM file: ${response.statusText}`);
      }
      
      const wasmBytes = new Uint8Array(await response.arrayBuffer());

      const result = await deployPOAContract(
        wasmBytes,
        updatedEventParams,
        { 
          publicKey: address, 
          signTransaction: async (xdr: string) => {
            const result = await signTransaction(xdr);
            return result.signedTxXdr;
          }
        }
      );

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('events')
        .insert({
          name: eventParams.name,
          description: formData.description,
          symbol: eventParams.symbol,
          uri: metadataUri,
          contract_id: result.contractId,
          creator_address: address,
          location: formData.location,
          event_date: new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString(),
          max_tickets: parseInt(formData.maxTickets) || null,
          ticket_price: parseFloat(formData.ticketPrice) || 0,
          category: formData.category,
          image_url: imageUrl,
          metadata_ipfs_hash: metadataHash
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
      <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
        <Layout.Inset>
          <Text as="h1" size="xl" style={{ color: "white" }}>Create Event</Text>
          <Text as="p" size="md" style={{ color: "white" }}>
            Please connect your wallet to create a new POA event.
          </Text>
        </Layout.Inset>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content style={{ backgroundColor: "#0f0f17", minHeight: "100vh", color: "white" }}>
      <Layout.Inset>
        <Text as="h1" size="xl" style={{ color: "white" }}>Create New POA Event</Text>
        <Text as="p" size="md" style={{ color: "white" }}>
          Deploy a new Proof of Attendance smart contract for your event.
        </Text>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDeploy();
          }}
          style={{ marginTop: "2rem", maxWidth: "800px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Input
                label="Event Name"
                id="name"
                value={eventParams.name}
                onChange={(e) => setEventParams(prev => ({ ...prev, name: e.target.value }))}
                required
                fieldSize="lg"
                style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
              />
              
              <div>
                <label style={{ color: "white", fontSize: "14px", marginBottom: "8px", display: "block" }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your event..."
                  style={{ 
                    width: "100%", 
                    minHeight: "100px", 
                    backgroundColor: "#1a1a2e", 
                    color: "white", 
                    border: "1px solid #8866e0",
                    borderRadius: "4px",
                    padding: "8px"
                  }}
                />
              </div>

              <Input
                label="Location"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                fieldSize="lg"
                style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Event Date"
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  required
                  fieldSize="lg"
                  style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
                />
                <Input
                  label="Event Time"
                  id="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                  fieldSize="lg"
                  style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Max Tickets"
                  id="maxTickets"
                  type="number"
                  value={formData.maxTickets}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTickets: e.target.value }))}
                  fieldSize="lg"
                  style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
                />
                <Input
                  label="Ticket Price (ALGO)"
                  id="ticketPrice"
                  type="number"
                  step="0.01"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                  fieldSize="lg"
                  style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
                />
              </div>

              <div>
                <label style={{ color: "white", fontSize: "14px", marginBottom: "8px", display: "block" }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#1a1a2e",
                    color: "white",
                    border: "1px solid #8866e0",
                    borderRadius: "4px"
                  }}
                >
                  <option value="">Select category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <Input
                label="Token Symbol"
                id="symbol"
                value={eventParams.symbol}
                onChange={(e) => setEventParams(prev => ({ ...prev, symbol: e.target.value }))}
                required
                fieldSize="lg"
                placeholder="POA"
                style={{ backgroundColor: "#1a1a2e", color: "white", border: "1px solid #8866e0" }}
              />
            </div>

            <div>
              <label style={{ color: "white", fontSize: "14px", marginBottom: "8px", display: "block" }}>Event Image</label>
              <Card style={{
                backgroundColor: "#1a1a2e",
                border: "2px dashed #8866e0",
                aspectRatio: "1",
                position: "relative",
                cursor: "pointer"
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (e) => setImagePreview(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: "none" }}
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  height: "100%",
                  cursor: "pointer"
                }}>
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#8866e0" }}>
                      <div style={{ fontSize: "48px", marginBottom: "8px" }}>📷</div>
                      <Text as="p" size="sm" style={{ color: "#8866e0" }}>Upload Image</Text>
                    </div>
                  )}
                </label>
              </Card>
            </div>
          </div>

            {error && (
              <Text as="p" size="sm" style={{ color: "red" }}>
                {error}
              </Text>
            )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isDeploying}
            style={{ marginTop: "2rem", backgroundColor: "#8866e0", border: "none", width: "100%" }}
          >
            {isDeploying ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default NewEvent;