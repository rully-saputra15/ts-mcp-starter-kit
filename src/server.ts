import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCountryDataToolConfig } from "./tools/index.js";
import fetchRestCountries from "./api/fetchRestCountries.js";

function createMcpServer() {
  const server = new McpServer({
    name: "mcp-name",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  server.registerTool(
    "get_country_data",
    getCountryDataToolConfig(),
    async ({ countryName }) => {
      const res = await fetchRestCountries(countryName);

      return {
        content: [{ type: "text", text: JSON.stringify(res[0] || []) }],
        structuredContent: {
            data: res[0] || []
        }
      };
    }
  );

  return server;
}

export default createMcpServer;
