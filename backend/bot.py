import os
import json
import aiohttp
import asyncio
import discord
from discord.ext import commands
import dotenv

dotenv.load_dotenv()

DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN")
API_BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000")

from gemini_config import generate_gemini_response
from pool import connection_pool

import discord
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (id: {bot.user.id})")

@bot.command(name="lookup")
async def lookup(ctx, lookup_id: str):
    url = f"{API_BASE}/data/{lookup_id}"
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Show only markdown notes, article links, and images
                    md = data.get('md_notes') or ''
                    articles = data.get('article_links') or []
                    images = data.get('images') or []

                    embed = discord.Embed(title=(data.get('name') or lookup_id), color=0x2b7a78)

                    # Put markdown notes in description (truncate to Discord limit)
                    if md:
                        embed.description = md if len(md) <= 2048 else md[:2045] + '...'

                    # Articles field (if present)
                    if articles:
                        # join with newlines and truncate to field limit
                        val = '\n'.join(articles)
                        embed.add_field(name='Articles', value=(val[:1024] + ('...' if len(val) > 1024 else '')), inline=False)

                    # Images: construct Cloudinary URLs using either env vars or provided defaults
                    cloud = os.environ.get('CLOUDINARY_CLOUD_NAME', 'dkek5ojrc')
                    version = os.environ.get('CLOUDINARY_CLOUD_VERSION', 'v1772898344')
                    image_urls = []
                    for img in images:
                        public_id = img.get('public_id')
                        if public_id:
                            # user-specified pattern: https://res.cloudinary.com/dkek5ojrc/image/upload/v1772898344/${img.public_id}
                            image_urls.append(f"https://res.cloudinary.com/{cloud}/image/upload/{version}/{public_id}")

                    # Attach first image to embed if available
                    if image_urls:
                        embed.set_image(url=image_urls[0])

                    await ctx.send(embed=embed)

                    # Send any additional image URLs as separate messages (so all images are accessible)
                    for extra in image_urls[1:]:
                        await ctx.send(extra)
                elif resp.status == 404:
                    await ctx.send(f"No data found for `{lookup_id}` (404).")
                else:
                    text = await resp.text()
                    await ctx.send(f"Error fetching data: {resp.status}\n{text}")
        except Exception as e:
            await ctx.send(f"Request error: {e}")


def fetch_all_md_notes():
    """Return concatenated md_notes from all rows in `knowledge_base`."""
    conn = None
    notes = []
    try:
        conn = connection_pool.getconn()
        with conn.cursor() as cur:
            cur.execute("SELECT md_notes FROM knowledge_base;")
            rows = cur.fetchall()
            for (md,) in rows:
                if md:
                    notes.append(md)
        return "\n\n".join(notes)
    finally:
        if conn:
            connection_pool.putconn(conn)


@bot.command(name="ask")
async def ask(ctx, *, question: str):
    """Ask Gemini a question using the entire `md_notes` column as context.

    Usage: !ask <your question>
    """
    try:
        md_all = fetch_all_md_notes() or ''
    except Exception as e:
        await ctx.send(f"DB error: {e}")
        return

    # Build prompt: include the entire MD context and then the user question
    MAX_CONTEXT = int(os.environ.get('GEMINI_MAX_CONTEXT_CHARS', '20000'))
    context = md_all if len(md_all) <= MAX_CONTEXT else md_all[-MAX_CONTEXT:]
    combined_prompt = f"Context:\n{context}\n\nQuestion:\n{question}"

    async with ctx.typing():
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, generate_gemini_response, combined_prompt)
        except Exception as e:
            # If Gemini is unavailable (503) or any other error occurs, fall back to a
            # simple local extractive summary so the command remains usable.
            def simple_extractive_summary(context_text, question_text, max_chars=1800):
                import re
                if not context_text:
                    return "(no context available)"
                # Find candidate sentences
                sentences = re.split(r'(?<=[.!?])\s+', context_text)
                # Simple keyword match from question
                q_words = set(re.findall(r"\w+", question_text.lower()))
                matches = [s for s in sentences if q_words & set(re.findall(r"\w+", s.lower()))]
                if matches:
                    summary = " ".join(matches)
                else:
                    # fallback: use the first few sentences
                    summary = " ".join(sentences[:3])
                if len(summary) > max_chars:
                    return summary[:max_chars] + '...'
                return summary

            fallback = simple_extractive_summary(context, question)
            await ctx.send("Gemini unavailable — returning a local extractive fallback summary:")
            await ctx.send(fallback)
            return

    reply = result or 'No response from Gemini.'
    if len(reply) > 1900:
        for i in range(0, len(reply), 1900):
            await ctx.send(reply[i:i+1900])
    else:
        await ctx.send(reply)

if __name__ == "__main__":
    if not DISCORD_TOKEN:
        raise SystemExit("Set DISCORD_TOKEN environment variable")
    bot.run(DISCORD_TOKEN)