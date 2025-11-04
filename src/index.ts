import { createServer, IncomingMessage, ServerResponse } from "node:http";
import createMcpServer from "./server.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { SessionRecord } from "./types.js";
import { URL } from "node:url";

import "dotenv/config";

// maintain active sessions
const sessions = new Map<string, SessionRecord>();

const ssePath = "/mcp";
const postPath = "/mcp/messages";

const portEnv = Number(process.env.port ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;

// GET REQUEST
async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createMcpServer();
  const transport = new SSEServerTransport(postPath, res);

  const sessionId = transport.sessionId;

  // flag to prevent circular close calls
  let isClosing = false;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    if (isClosing) return;
    isClosing = true;

    sessions.delete(sessionId);

    try {
      await server.close();
    } catch (error) {
      console.error(`Error closing server: ${error}`);
    }
  };

  transport.onerror = (error) => {
    console.error(`SSE Transport error ${error}`);
  };

  try {
    await server.connect(transport);
  } catch (err) {
    sessions.delete(sessionId);
    console.error(`Failed start SSE connection ${err}`);
    if (!res.headersSent) {
      res.writeHead(500).end(`Failed established SSE connection ${err}`);
    }
  }
}

// POST REQUEST

async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("Missing sessionId query params");
    return;
  }

  const session = sessions.get(sessionId);

  try {
    await session?.transport.handlePostMessage(req, res);
  } catch (err) {
    console.error(`Failed to process message ${err}`);
    if (!res.headersSent) {
      res.writeHead(500).end(`Failed to process message ${err}`);
    }
  }
}

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end("Missing Url");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    
    // Add health check endpoint
    if (req.method === "GET" && url.pathname === "/health") {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        sessions: sessions.size
      }));
      return;
    }

    if (
      req.method === "OPTIONS" &&
      (url.pathname === ssePath || url.pathname === postPath)
    ) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === ssePath) {
      await handleSseRequest(res);
      return;
    }
    if (req.method === "POST" && url.pathname === postPath) {
      await handlePostMessage(req, res, url);
      return;
    }

    res.writeHead(404).end("Not Found");
  }
);

httpServer.on("clientError", (err: Error, socket) => {
  console.error(`HTTP CLIENT ERROR ${err}`);
});

httpServer.listen(port, () => {
  console.log(`MCP Server listening on http://localhost:${port}`);
  console.log(` SSE Stream: GET http://localhost:${port}${ssePath}`);
  console.log(
    ` Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=`
  );
});
