from mcp.server import Server, NotificationOptions, InitializationOptions
from mcp.server.stdio import stdio_server
import mcp.types as types
import asyncio
import json

# Initialize the MCP Server
app = Server("aphantasia-db-mcp")

@app.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """
    List available tools for this MCP server.
    """
    return [
        types.Tool(
            name="get_user_statistics",
            description="Fetches aggregated statistics about aphantasia test scores.",
            inputSchema={
                "type": "object",
                "properties": {
                    "test_type": {
                        "type": "string",
                        "description": "The type of test (e.g., 'full_aphantasia_profile')"
                    }
                },
                "required": ["test_type"]
            }
        ),
        types.Tool(
            name="query_scientific_database",
            description="Mock tool to query a local scientific paper database.",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "The research topic"
                    }
                },
                "required": ["topic"]
            }
        )
    ]

@app.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    """
    Handle tool execution requests.
    """
    if name == "get_user_statistics":
        # Mocking a database call
        test_type = arguments.get("test_type", "unknown")
        stats = {
            "test_type": test_type,
            "average_vviq": 32.5,
            "total_respondents": 1540
        }
        return [
            types.TextContent(
                type="text",
                text=json.dumps(stats, indent=2)
            )
        ]
        
    elif name == "query_scientific_database":
        topic = arguments.get("topic", "")
        return [
            types.TextContent(
                type="text",
                text=f"Found 3 recent papers on '{topic}'. The consensus indicates a neurological basis involving the visual cortex."
            )
        ]
        
    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    # Run the server using standard input/output streams
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="aphantasia-db-mcp",
                server_version="0.1.0",
                capabilities=app.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
