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
    Retrieve the markdown content of a David888 Wiki post. Use this to read existing research, 
    notes, or configuration stored on the wiki.

    Args:
        path: The unique slug/path of the article (e.g. 'project-notes').
        password: (Optional) Required if the page is password-protected. Try reading without a password first.
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
                return "Error: Password required. Please ask the user for the 'View Password' for this wiki page."
            elif response.status_code == 403:
                return "Error: Forbidden. The password provided is incorrect. Please verify with the user."
            elif response.status_code == 404:
                return f"Error: Page '{path}' not found. Check the path name or create a new page if intended."
            else:
                return f"Error: Server returned HTTP {response.status_code}. Details: {response.text}"
        except httpx.RequestError as exc:
            return f"Network Error: Unable to reach David888 Wiki. {exc}"


@mcp.tool()
async def write_wiki(
    path: str, 
    text: str, 
    password: Optional[str] = None, 
    new_view_password: Optional[str] = None,
    make_private: bool = False
) -> str:
    """
    Create or overwrite a markdown document on the David888 Wiki. 
    Use this for saving reports, final summaries, or new project documentations.

    WARNING: Overwrites existing content. For logs or incremental updates, use append_wiki.

    Args:
        path: The unique slug/path for the article. Use descriptive kebab-case (e.g., 'research-summary').
        text: The complete markdown content.
        password: (Optional) Admin/Edit password. Required if the page already exists and is protected.
        new_view_password: (Optional) Set this to restrict who can read the page.
        make_private: (Optional) Set to True to disable the public share link. Defaults to False (public).
    
    IMPORTANT: The API returns both an edit URL and a Share URL. You MUST provide the Share URL to the user.
    """
    url = f"{BASE_URL}/api/{path}"
    
    payload = {
        "text": text,
        "append": False,
        "public": not make_private
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
                    edit_url = data.get('url', f'{BASE_URL}/{path}')
                    
                    result = "Successfully saved to Wiki!\n"
                    if share_url:
                        result += f"Public Share URL: {share_url} (Give THIS to the user)\n"
                    result += f"Edit URL: {edit_url}\n"
                    return result
                
                # Handle specific API errors
                err_msg = res_data.get('msg', 'Unknown Error')
                if "Unauthorized" in err_msg:
                    return f"Error: Edit password required for '{path}'. Ask the user for the password."
                return f"Wiki API Error: {err_msg}"
            else:
                return f"Server Error: HTTP {response.status_code}. Details: {response.text}"
        except httpx.RequestError as exc:
            return f"Network Error: {exc}"


@mcp.tool()
async def append_wiki(path: str, text: str, password: Optional[str] = None) -> str:
    """
    Append markdown content to the END of an existing David888 Wiki post.
    Best for: Logs, continuous streams of data, or adding new sections to a document.

    Args:
        path: The URL path of the article.
        text: New text to add (Markdown supported). Suggest starting with a newline or header.
        password: (Optional) Required if the page has an edit password.
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
                    return f"Successfully appended. Share link: {share_url}"
                return f"Wiki API Error: {res_data.get('msg')}"
            else:
                return f"Server Error: HTTP {response.status_code}."
        except httpx.RequestError as exc:
            return f"Network Error: {exc}"


@mcp.tool()
async def upload_image(filepath: str) -> str:
    """
    Upload a local image to the wiki's cloud storage.
    
    WORKFLOW:
    1. Call this for any local image file you want to include in a wiki post.
    2. Wait for the URL (https://s3.wiki.david888.com/...).
    3. Use that URL in your markdown as ![alt text](URL).
    4. Finally, call write_wiki or append_wiki with the markdown.

    Args:
        filepath: Absolute path to the local image (e.g., '/Users/david/image.png').
    """
    url = f"{BASE_URL}/api/upload"
    
    if not os.path.exists(filepath):
        return f"File Error: Path does not exist: {filepath}"
        
    try:
        with open(filepath, "rb") as f:
            files = {"image": (os.path.basename(filepath), f, "application/octet-stream")}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, files=files, timeout=30.0)
                
                if response.status_code == 200:
                    res_data = response.json()
                    if res_data.get("err") == 0:
                        img_url = res_data.get('data')
                        return f"Upload Success! Use this URL in your markdown: {img_url}"
                    return f"Upload API Error: {res_data.get('msg')}"
                else:
                    return f"Server Error: HTTP {response.status_code}."
    except Exception as exc:
        return f"System Error during upload: {exc}"


if __name__ == "__main__":
    mcp.run()
