import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ZodRawShape } from "zod";
import { ZodObject } from "zod/v4";

export type SessionRecord = {
    server: McpServer
    transport: SSEServerTransport;
}

export type TMetadataGeneral = {
    title: string;
    description: string;
}

export type TRegisterTool = Partial<TMetadataGeneral> & {
    inputSchema?: ZodRawShape
    outputSchema?: ZodRawShape
}