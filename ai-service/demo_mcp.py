import asyncio
import os
from src.infrastructure.mcp_tools.adapter import MCPToolAdapter

async def main():
    print("Initializing MCP Client Adapter...")
    
    # Path to the sample MCP server script
    server_script = os.path.join(
        os.path.dirname(__file__), 
        "src", "infrastructure", "mcp_tools", "sample_server.py"
    )
    
    adapter = MCPToolAdapter(server_script_path=server_script)
    
    # Initialize connection and fetch LangChain tools
    async with adapter.connect() as tools:
        print(f"\nSuccessfully connected to MCP Server!")
        print(f"Discovered {len(tools)} tools via MCP:")
        
        for tool in tools:
            print(f"\n- Tool Name: {tool.name}")
            print(f"  Description: {tool.description}")
            
        if tools:
            print("\n--- Testing tool execution ---")
            # Find the statistics tool
            stats_tool = next((t for t in tools if t.name == "get_user_statistics"), None)
            if stats_tool:
                print(f"Executing '{stats_tool.name}'...")
                result = await stats_tool.ainvoke({"test_type": "full_aphantasia_profile"})
                print(f"Result:\n{result}")
                
            # Find the query tool
            query_tool = next((t for t in tools if t.name == "query_scientific_database"), None)
            if query_tool:
                print(f"\nExecuting '{query_tool.name}'...")
                result = await query_tool.ainvoke({"topic": "Aphantasia neurological basis"})
                print(f"Result:\n{result}")

if __name__ == "__main__":
    asyncio.run(main())
