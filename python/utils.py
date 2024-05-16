import requests
import asyncio
import aiohttp


async def get_repo_info(repo_url):
    response = requests.get(f"{repo_url}?")
    response.raise_for_status()

    # Get list of repo files
    data = response.json()["data"]
    files = data["siblings"]

    # Create an array of async HEAD requests to get the file sizes
    async def get_file_size(file):
        async with aiohttp.ClientSession() as session:
            async with session.head(f"{repo_url}/resolve/main/{file}") as response:
                return file, int(response.headers["Content-Length"])

    tasks = [get_file_size(file["rfilename"]) for file in files]

    # Sum the file sizes
    total_size = 0
    for task in asyncio.as_completed(tasks):
        file, size = await task
        total_size += size

    return files, total_size
