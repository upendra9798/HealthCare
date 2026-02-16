import express from "express";
import { AssemblyAI } from "assemblyai";
import { WebSocketServer } from "ws";

const router = express.Router();

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Store active transcription sessions
const sessions = new Map();

wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  const client = new AssemblyAI({
    apiKey:
      process.env.ASSEMBLY_AI_API_KEY || "d09d988dd29b457db1fd7ee4ad20307d",
  });

  const transcriber = client.streaming.transcriber({
    sampleRate: 16_000,
    formatTurns: true,
  });

  // Store the session
  const sessionId = Date.now().toString();
  sessions.set(sessionId, { ws, transcriber });

  transcriber.on("open", ({ id }) => {
    console.log(`Session opened with ID: ${id}`);
    ws.send(JSON.stringify({ type: "connected", sessionId }));
  });

  transcriber.on("error", (error) => {
    console.error("Transcription error:", error);
    ws.send(JSON.stringify({ type: "error", error: error.message }));
  });

  transcriber.on("close", (code, reason) => {
    console.log("Session closed:", code, reason);
    ws.send(JSON.stringify({ type: "closed", code, reason }));
  });

  transcriber.on("turn", (turn) => {
    if (!turn.transcript) return;
    console.log("Received transcription:", turn.transcript);
    ws.send(
      JSON.stringify({
        type: "transcript",
        text: turn.transcript,
        confidence: turn.confidence,
      })
    );
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message type:", data.type);

      if (data.type === "start") {
        console.log("Starting transcription session");
        await transcriber.connect();
        ws.send(JSON.stringify({ type: "started" }));
      } else if (data.type === "audio") {
        // Convert array back to Uint8Array
        const audioData = new Uint8Array(data.audio);
        console.log("Received audio chunk:", audioData.length, "bytes");

        try {
          await transcriber.stream(audioData);
          console.log("Audio chunk sent to AssemblyAI");
        } catch (error) {
          console.error("Error streaming audio:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              error: "Failed to process audio chunk",
            })
          );
        }
      } else if (data.type === "stop") {
        console.log("Stopping transcription session");
        const session = sessions.get(sessionId);
        if (session) {
          await transcriber.close();
          sessions.delete(sessionId);
        }
        ws.send(JSON.stringify({ type: "stopped" }));
      }
    } catch (error) {
      console.error("Error handling message:", error);
      ws.send(JSON.stringify({ type: "error", error: error.message }));
    }
  });

  ws.on("close", async () => {
    console.log("WebSocket connection closed");
    const session = sessions.get(sessionId);
    if (session) {
      await transcriber.close();
      sessions.delete(sessionId);
    }
  });
});

// HTTP route to handle WebSocket upgrade
router.get("/stream", (req, res, next) => {
  if (
    !req.headers.upgrade ||
    req.headers.upgrade.toLowerCase() !== "websocket"
  ) {
    return res.status(400).send("Expected WebSocket connection");
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit("connection", ws, req);
  });
});

export default router;
