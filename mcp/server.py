# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "mcp[cli]>=1.2.0",
#     "httpx>=0.28.0",
# ]
# ///

from typing import Optional
import os
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server
mcp = FastMCP("david888-wiki")

# Configure Wiki Base URL
# Can be overridden by users hosting their own instances
BASE_URL = os.getenv("WIKI_BASE_URL", "https://wiki.david888.com")


@mcp.tool()
async def read_wiki(path: str, password: Optional[str] = None) -> str:
    """
    Retrieve the markdown content of a David888 Wiki post.

    Args:
        path: The URL path of the article (e.g. 'tsladavid888123')
        password: (Optional) The view or edit password if the post is protected.
    """
    url = f"{BASE_URL}/api/{path}"
    params = {}
    if password:
        params["pw"] = password
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code == 200:
                return response.text
            elif response.status_code == 401:
                return f"Error: Unauthorized. A password is required to view '{path}'."
            elif response.status_code == 403:
                return f"Error: Forbidden. Incorrect password for '{path}'."
            else:
                return f"Error: Retrieved HTTP {response.status_code} from Wiki Server."
        except httpx.RequestError as exc:
            return f"An error occurred while requesting {exc.request.url!r}: {exc}"


@mcp.tool()
async def write_wiki(
    path: str, 
    text: str, 
    password: Optional[str] = None, 
    new_view_password: Optional[str] = None
) -> str:
    """
    Write or overwrite a markdown document on the David888 Wiki.
    
    WARNING: This completely replaces any existing content on the page. Use append_wiki
    if you only want to add new content to the end.

    Args:
        path: The URL path of the article to create or overwrite.
        text: The complete markdown content to save.
        password: (Optional) Set an edit password, or provide the existing edit password to overwrite.
        new_view_password: (Optional) Set a new view password to restrict who can read this page.
    """
    url = f"{BASE_URL}/api/{path}"
    
    payload = {
        "text": text,
        "append": False
    }
    
    if password:
        payload["pw"] = password
    if new_view_password:
        payload["vpw"] = new_view_password
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=15.0)
            
            if response.status_code == 200:
                res_data = response.json()
                if res_data.get("err") == 0:
                    data = res_data.get('data', {})
                    share_url = data.get('shareUrl')
                    url = data.get('url', f'{BASE_URL}/{path}')
                    if share_url:
                        return f"Successfully wrote to wiki! Give this Public Share URL to the user: {share_url}"
                    return f"Successfully wrote to wiki! View it at: {url}"
                return f"Wiki API Error: {res_data.get('msg')}"
            else:
                return f"Error: HTTP {response.status_code}. Response: {response.text}"
        except httpx.RequestError as exc:
            return f"An error occurred while communicating with the wiki: {exc}"


@mcp.tool()
async def upload_image(filepath: str) -> str:
    """
    Upload a local image file to the wiki's R2 storage.
    
    Use this when you generate an image or need to include an existing local image 
    in your markdown document. You MUST upload the image first, wait for the URL, 
    and then embed that URL in your markdown before calling write_wiki.

    Args:
        filepath: The absolute path to the local image file on your machine.
    """
    url = f"{BASE_URL}/api/upload"
    
    if not os.path.exists(filepath):
        return f"Error: File not found at {filepath}"
        
    try:
        with open(filepath, "rb") as f:
            files = {"image": (os.path.basename(filepath), f, "application/octet-stream")}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, files=files, timeout=30.0)
                
                if response.status_code == 200:
                    res_data = response.json()
                    if res_data.get("err") == 0:
                        img_url = res_data.get('data')
                        return f"Success! Image uploaded. Embed it using this URL: {img_url}"
                    return f"Wiki API Error: {res_data.get('msg')}"
                else:
                    return f"Error: HTTP {response.status_code}. Response: {response.text}"
    except Exception as exc:
        return f"An error occurred while uploading the image: {exc}"


@mcp.tool()
async def append_wiki(path: str, text: str, password: Optional[str] = None) -> str:
    """
    Append new markdown content to the END of an existing David888 Wiki post.
    
    This is highly recommended for continuous updates (like long AI generations), 
    as it avoids fetching and overwriting the entire document.

    Args:
        path: The URL path of the article.
        text: The new markdown content to append.
        password: (Optional) The existing edit password, if the post is protected.
    """
    url = f"{BASE_URL}/api/{path}"
    
    payload = {
        "text": text,
        "append": True
    }
    
    if password:
        payload["pw"] = password
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=15.0)
            
            if response.status_code == 200:
                res_data = response.json()
                if res_data.get("err") == 0:
                    data = res_data.get('data', {})
                    share_url = data.get('shareUrl')
                    url = data.get('url', f'{BASE_URL}/{path}')
                    if share_url:
                        return f"Successfully appended to wiki! Give this Public Share URL to the user: {share_url}"
                    return f"Successfully appended to wiki! View it at: {url}"
                return f"Wiki API Error: {res_data.get('msg')}"
            else:
                return f"Error: HTTP {response.status_code}. Response: {response.text}"
        except httpx.RequestError as exc:
            return f"An error occurred while communicating with the wiki: {exc}"


if __name__ == "__main__":
    # Provides stdio mapping implicitly when executed
    mcp.run()
