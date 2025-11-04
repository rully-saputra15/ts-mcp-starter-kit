# TypeScript MCP Starter Kit 🚀

A fully functional starter template for building Model Context Protocol (MCP) servers with TypeScript, supporting both HTTP/SSE and stdio transports for seamless integration with AI applications.

## ✨ Features

- **TypeScript Ready**: Full TypeScript support with strict type checking
- **SSE Transport**: Real-time bidirectional communication using Server-Sent Events
- **Zod Validation**: Runtime type validation and schema parsing
- **RESTful Integration**: Example implementation with REST Countries API
- **Session Management**: Built-in session handling for multiple concurrent connections
- **CORS Support**: Cross-origin resource sharing configured
- **Hot Reload**: Development server with `tsx` for instant feedback

## 🏗️ Architecture

```
src/
├── index.ts          # HTTP server & SSE transport setup
├── server.ts         # MCP server configuration & tool registration
├── types.ts          # TypeScript type definitions
├── api/              # External API integrations
│   └── fetchRestCountries.ts
├── parser/           # Zod schema validators
│   └── index.ts
└── resources/        # MCP resources configurations
│   └── index.ts
└── tools/            # MCP tool configurations
    └── index.ts
```

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm start
   ```

3. **Server endpoints:**
   - SSE Stream: `GET http://localhost:8000/mcp`
   - Message Endpoint: `POST http://localhost:8000/mcp/messages?sessionId={id}`

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```env
PORT=8000  # Optional, defaults to 8000
```

### Adding New Tools

1. **Define the tool configuration** in [`src/tools/index.ts`](src/tools/index.ts):
```typescript
export const myNewToolConfig = (): TRegisterTool => ({
  title: "My New Tool",
  description: "Description of what it does",
  inputSchema: {
    param1: z.string().describe("Parameter description")
  },
  outputSchema: {
    result: z.any()
  }
});
```

2. **Register the tool** in [`src/server.ts`](src/server.ts):
```typescript
server.registerTool(
  "my_new_tool",
  myNewToolConfig(),
  async ({ param1 }) => {
    // Tool implementation
    return {
      content: [{ type: "text", text: "Result" }],
      structuredContent: { result: "data" }
    };
  }
);
```

## 🛠️ Built-in Example: Country Data Tool

The starter includes a complete example that fetches country information:

- **Tool Name**: `get_country_data`
- **Input**: `countryName` (string)
- **API**: [REST Countries API](https://restcountries.com/)
- **Validation**: Zod schema in [`src/parser/index.ts`](src/parser/index.ts)

**Usage:**
```typescript
// The tool accepts a country name and returns detailed country data
{ "countryName": "Germany" }
```

## 🔍 Key Components

### [`McpServer`](src/server.ts)
Core MCP server setup with tool registration and capability configuration.

### [`SSEServerTransport`](src/index.ts)
Handles Server-Sent Events transport layer for real-time communication between client and server.

### [`StdioTransport`](src/stdio.ts)
Handle the client AI application that can't use SSEServerTransport

### [`SessionRecord`](src/types.ts)
Type-safe session management for handling multiple concurrent connections.

### [`fetchRestCountries`](src/api/fetchRestCountries.ts)
Example API integration with error handling and response formatting.

## 📊 Transport Layer

This implementation uses **SSE (Server-Sent Events)** instead of stdio transport:

- ✅ **Real-time**: Instant bidirectional communication
- ✅ **Web-compatible**: Works seamlessly with web clients
- ✅ **Session-based**: Multiple concurrent connections support
- ✅ **Error handling**: Robust connection management

## 🧪 Development

### Type Safety
All schemas are validated using [Zod](https://github.com/colinhacks/zod) with TypeScript integration:

```typescript
import z from "zod";

export const mySchema = z.object({
  field: z.string().describe("Field description")
});
```

### Adding External APIs
Follow the pattern in [`src/api/fetchRestCountries.ts`](src/api/fetchRestCountries.ts):

```typescript
const fetchMyAPI = async (param: string) => {
  try {
    const res = await fetch(`https://api.example.com/${param}`);
    return await res.json();
  } catch (err) {
    console.error(`API Error: ${err}`);
    return "Error message";
  }
};
```

## 📦 Dependencies

- **[@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)**: Core MCP functionality
- **[zod](https://github.com/colinhacks/zod)**: Runtime type validation
- **[tsx](https://github.com/esbuild-kit/tsx)**: TypeScript execution engine
- **[dotenv](https://github.com/motdotla/dotenv)**: Environment variable management

## 🌐 Usage with AI Clients

This MCP server supports two transport methods:

### Option 1: HTTP/SSE Transport (for ChatGPT via ngrok)

1. **Start the HTTP server:**
   ```bash
   pnpm start
   ```

2. **Expose your server with ngrok:**
   ```bash
   ngrok http 8000
   ```

3. **Configure ChatGPT:**
   - Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - In ChatGPT, add your MCP server using the SSE endpoint:
     - SSE Stream: `https://abc123.ngrok.io/mcp`
     - Message Endpoint: `https://abc123.ngrok.io/mcp/messages`

### Option 2: Stdio Transport (for Claude Desktop & Local AI Apps)

1. **Configure Claude Desktop** (or other local AI application):
   
   Edit your `claude_desktop_config.json` file:
   ```json
   {
     "mcpServers": {
       "ts_mcp_starter": {
         "command": "C:\\Users\\YOUR_USERNAME\\Development\\mcp\\YOUR_MCP_FOLDER\\node_modules\\.bin\\tsx.cmd",
         "args": ["C:\\Users\\YOUR_USERNAME\\Development\\mcp\\YOUR_MCP_FOLDER\\src\\stdio.ts"],
         "cwd": "C:\\Users\\YOUR_USERNAME\\Development\\mcp\\YOUR_MCP_FOLDER"
       }
     }
   }
   ```
   
   **Important:** Replace `YOUR_USERNAME` with your actual username and adjust paths as needed.

   **For macOS/Linux:**
   ```json
   {
     "mcpServers": {
       "ts_mcp_starter": {
         "command": "node",
         "args": ["/absolute/path/to/YOUR_MCP_FOLDER/node_modules/.bin/tsx", "src/stdio.ts"],
         "cwd": "/absolute/path/to/YOUR_MCP_FOLDER"
       }
     }
   }
   ```

2. **Restart Claude Desktop** to load the MCP server

3. **Verify connection:**
   - Check Claude Desktop logs for successful connection
   - The server will output to stderr: "MCP Server running on stdio"

### Which Transport Should I Use?

| Transport | Use Case | Pros | Cons |
|-----------|----------|------|------|
| **HTTP/SSE** | ChatGPT, web clients, remote access | Multiple concurrent connections, web-compatible, easy to debug | Requires ngrok for ChatGPT, port management |
| **Stdio** | Claude Desktop, local AI apps | Direct integration, no network setup, secure | Single connection, local only |

## 🚀 Production Deployment

Build and run in production:

```bash
# Build the project
npx tsc

# Run the built server
node build/index.js
```

For containerized deployment, the server runs on the configured port and accepts HTTP connections for MCP communication.

---

**Ready to build your next MCP server?** This starter kit provides everything you need to create robust, type-safe MCP applications with modern TypeScript tooling! 🎉