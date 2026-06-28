import asyncio
from typing import List, Dict, Any
from contextlib import asynccontextmanager
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_core.tools import StructuredTool

class MCPToolAdapter:
    """
    Adapter to connect to an external Model Context Protocol (MCP) server
    and expose its capabilities as LangChain tools.
    This demonstrates advanced integration of agentic workflows with MCP.
    """
    def __init__(self, server_script_path: str):
        """
        Initializes the adapter.
        :param server_script_path: Path to the MCP server script (e.g., a DB inspector)
        """
        self.server_params = StdioServerParameters(
            command="python",
            args=[server_script_path]
        )
        self.tools: List[StructuredTool] = []

    @asynccontextmanager
    async def connect(self):
        """
        Connects to the MCP server, fetches available tools, and converts them to LangChain tools.
        Yields the tools while keeping the connection open.
        """
        try:
            async with stdio_client(self.server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # Fetch tools from the MCP server
                    mcp_tools_response = await session.list_tools()
                    tools = []
                    
                    for mcp_tool in mcp_tools_response.tools:
                        # Dynamically build a Pydantic model from the JSON schema
                        from pydantic.v1 import create_model
                        fields = {}
                        properties = mcp_tool.inputSchema.get("properties", {})
                        required = mcp_tool.inputSchema.get("required", [])
                        for prop_name, prop_info in properties.items():
                            fields[prop_name] = (str, ...) if prop_name in required else (str, None)
                        
                        args_schema = create_model(f"{mcp_tool.name}Schema", **fields)
                        
                        # Convert MCP tool schema to LangChain StructuredTool
                        lc_tool = StructuredTool(
                            name=mcp_tool.name,
                            description=mcp_tool.description or "No description provided.",
                            coroutine=self._create_tool_executor(session, mcp_tool.name),
                            args_schema=args_schema
                        )
                        tools.append(lc_tool)
                        
                    yield tools
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Failed to initialize MCP tools: {e}")
            yield []

    def _create_tool_executor(self, session: ClientSession, tool_name: str):
        """
        Creates an async executor function for a specific MCP tool.
        """
        async def executor(**kwargs) -> Any:
            result = await session.call_tool(tool_name, arguments=kwargs)
            # Process MCP CallToolResult back to a string or dict for LangChain
            if result.isError:
                return f"Error executing tool {tool_name}: {result.content}"
            return "\n".join([c.text for c in result.content if hasattr(c, 'text')])
            
        return executor
