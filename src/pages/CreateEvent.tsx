import React, { useState } from "react";
import { Button, Input, Layout, Text, Card } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { deployPOAContract, EventParams } from "../util/contractDeploy";
import { createContractClient } from "../util/updateContract";

const CreateEvent: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [eventParams, setEventParams] = useState<EventParams>({
    symbol: "POA",
    uri: "www.mytoken.com",
    name: "Event 1"
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    contractId: string;
    wasmHash: string;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const handleDeploy = async () => {
    if (!address || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    console.log("🎯 Starting event creation...");
    console.log("👤 Wallet address:", address);
    console.log("📋 Event parameters:", eventParams);

    setIsDeploying(true);
    setError("");
    setDeploymentResult(null);

    try {
      // Load WASM file
      console.log("📁 Loading WASM file...");
      const wasmPath = "/target/wasm32v1-none/release/hello_world.wasm";
      const response = await fetch(wasmPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load WASM file: ${response.statusText}`);
      }
      
      const wasmBytes = new Uint8Array(await response.arrayBuffer());
      console.log("✅ WASM file loaded, size:", wasmBytes.length, "bytes");

      // Deploy contract
      const result = await deployPOAContract(
        wasmBytes,
        eventParams,
        address,
        signTransaction
      );

      console.log("🎉 Deployment successful!");
      console.log("📄 Contract ID:", result.contractId);
      console.log("🔗 WASM Hash:", result.wasmHash);

      // Update contract client configuration
      createContractClient(result.contractId);
      
      setDeploymentResult(result);
    } catch (err) {
      console.error("💥 Deployment error:", err);
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  if (!address) {
    return (
      <Layout.Content>
        <Layout.Inset>
          <Text as="h1" size="xl">Create Event</Text>
          <Text as="p" size="md">
            Please connect your wallet to create a new POA event.
          </Text>
        </Layout.Inset>
      </Layout.Content>
    );
  }

  if (deploymentResult) {
    return (
      <Layout.Content>
        <Layout.Inset>
          <Text as="h1" size="xl">Event Created Successfully! 🎉</Text>
          
          <Card style={{ marginTop: "1rem", padding: "1rem" }}>
            <Text as="h2" size="lg">Contract Details</Text>
            <div style={{ marginTop: "0.5rem" }}>
              <Text as="p" size="sm" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                <strong>Contract ID:</strong> {deploymentResult.contractId}
              </Text>
              <Text as="p" size="sm" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                <strong>WASM Hash:</strong> {deploymentResult.wasmHash}
              </Text>
            </div>
          </Card>

          <div style={{ marginTop: "1rem" }}>
            <Button
              variant="primary"
              onClick={() => {
                setDeploymentResult(null);
                setEventParams({
                  symbol: "POA",
                  uri: "www.mytoken.com", 
                  name: "Event 1"
                });
              }}
            >
              Create Another Event
            </Button>
          </div>
        </Layout.Inset>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <Layout.Inset>
        <Text as="h1" size="xl">Create New POA Event</Text>
        <Text as="p" size="md">
          Deploy a new Proof of Attendance smart contract for your event.
        </Text>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDeploy();
          }}
          style={{ marginTop: "2rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input
              label="Event Name"
              id="name"
              value={eventParams.name}
              onChange={(e) => setEventParams(prev => ({ ...prev, name: e.target.value }))}
              required
              fieldSize="lg"
            />
            
            <Input
              label="Token Symbol"
              id="symbol"
              value={eventParams.symbol}
              onChange={(e) => setEventParams(prev => ({ ...prev, symbol: e.target.value }))}
              required
              fieldSize="lg"
              placeholder="POA"
            />
            
            <Input
              label="Metadata URI"
              id="uri"
              value={eventParams.uri}
              onChange={(e) => setEventParams(prev => ({ ...prev, uri: e.target.value }))}
              required
              fieldSize="lg"
              placeholder="www.mytoken.com"
            />

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
              style={{ marginTop: "1rem" }}
            >
              {isDeploying ? "Deploying Contract..." : "Create Event"}
            </Button>
          </div>
        </form>

        <div style={{ marginTop: "2rem" }}>
          <Text as="h3" size="md">Connected Wallet</Text>
          <Text as="p" size="sm" style={{ fontFamily: "monospace" }}>
            {address}
          </Text>
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default CreateEvent;