# MCP Server Setup

> **Status**: Pre-configured
> **Last Updated**: 2026-02-17

## Overview

The starter kit ships with `.mcp.json` pre-configured for two MCP (Model Context Protocol) servers that help Claude Code work more effectively with your project.

## Configured Servers

### 1. Convex MCP

**Purpose**: Database schema exploration, data querying, function debugging.

**When to use**:
- Exploring the current schema without reading `convex/schema.ts`
- Querying data directly from the database
- Debugging Convex function behavior
- Understanding data relationships

**Setup**:
1. Get your deployment name from `CONVEX_DEPLOYMENT` in `.env.local` (e.g., `dev:your-deployment`)
2. Update `.mcp.json` with your deployment name

### 2. PostHog MCP

**Purpose**: Analytics event tracking, feature flag management, user behavior analysis.

**When to use**:
- Setting up analytics events
- Checking feature flag configurations
- Reviewing user behavior data
- Debugging event tracking

**Setup**:
1. Get your PostHog project API key
2. Update `.mcp.json` with your key and host

## Configuration (`.mcp.json`)

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["convex-mcp-server"],
      "env": {
        "CONVEX_DEPLOYMENT": "your-deployment-name"
      }
    },
    "posthog": {
      "command": "npx",
      "args": ["posthog-mcp-server"],
      "env": {
        "POSTHOG_API_KEY": "your-api-key",
        "POSTHOG_HOST": "https://eu.posthog.com"
      }
    }
  }
}
```

## Troubleshooting

- **MCP server not connecting**: Ensure env vars in `.mcp.json` are filled in (they ship as placeholders)
- **Convex MCP can't access data**: Verify `CONVEX_DEPLOYMENT` matches your `.env.local` value
- **PostHog MCP not working**: Ensure the API key has sufficient permissions
- **MCP not available in IDE**: Restart your IDE after updating `.mcp.json`

## Notes

- MCP servers run locally — no data leaves your machine beyond normal API calls
- `.mcp.json` is gitignored by default in many setups — ensure it's committed if you want it to transfer
- The Convex MCP is particularly useful during schema design and debugging queries
