from google import genai
from google.genai import types
import dotenv
import os
import time
from typing import List

dotenv.load_dotenv()

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))


def generate_gemini_response(prompt: str, thinking_level: str = "low", models: List[str] = None) -> str:
    """
    Generate a response from Gemini API, trying multiple model names as fallbacks.

    Args:
        prompt: The input prompt/question
        thinking_level: Thinking level ("low", "medium", "high")
        models: Optional list of model names to try in order. If omitted, uses sensible defaults.

    Returns:
        str: The generated response text

    Notes:
        If the preferred model is under high demand (503), this function will automatically
        try older/less in-demand model names without requiring a change to the API key.
    """
    if models is None:
        # Preferred -> fallback models (order matters)
        models = [
            "gemini-3-flash-preview",
            "gemini-3.5-preview",
            "gemini-2.1",
            "gemini-1.0",
        ]

    backoff_base = 1.0
    for idx, model_name in enumerate(models):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_level=thinking_level)
                ),
            )
            # Prefer returning text if available
            return getattr(response, 'text', str(response))
        except Exception as e:
            # If last model, re-raise the exception
            print(f"Gemini model {model_name} failed: {e}")
            if idx == len(models) - 1:
                raise
            # Exponential backoff before trying next model
            sleep_time = backoff_base * (2 ** idx)
            time.sleep(sleep_time)




if __name__ == "__main__":
    result = generate_gemini_response("How does AI work?")
    print(result)
