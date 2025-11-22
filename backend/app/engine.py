import replicate
import os
import base64
import io
from PIL import Image

class AIEngine:
    def __init__(self):
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        if not self.api_token:
            print("⚠️ WARNING: REPLICATE_API_TOKEN is missing. AI features will fail.")
        else:
            print("✅ Connected to Replicate Cloud Engine")

    def generate(self, image_data: str, mask_data: str, prompt: str):
        if not self.api_token:
            raise Exception("Missing API Key. Please set REPLICATE_API_TOKEN in .env")

        print(f"🚀 Sending request to Flux Fill... Prompt: {prompt}")

        # 1. Prepare the files for the API
        # Replicate expects file handles or URLs. We will stream bytes.
        image_bytes = self._base64_to_bytes(image_data)
        mask_bytes = self._base64_to_bytes(mask_data)

        # 2. Call the Flux Fill Model
        # black-forest-labs/flux-fill-dev is designed exactly for this
        output = replicate.run(
            "black-forest-labs/flux-fill-dev",
            input={
                "image": io.BytesIO(image_bytes),
                "mask": io.BytesIO(mask_bytes),
                "prompt": prompt,
                "guidance_scale": 30, # High guidance for strict adherence
                "num_inference_steps": 20,
                "output_format": "png"
            }
        )

        # 3. Result is a URL or List of URLs. We want to return it as base64 to the frontend
        # so the frontend code doesn't change (it expects a data URI).
        # However, for speed, we can just return the URL if the frontend handles it.
        # Let's fetch it and convert to base64 to keep our app self-contained (avoid CORS issues with external URLs).

        print(f"✨ Received Result URL: {output}")

        # If output is a list (standard for Replicate), take the first one
        result_url = output[0] if isinstance(output, list) else output

        return self._download_and_encode(result_url)

    def _base64_to_bytes(self, b64_str):
        if "base64," in b64_str:
            b64_str = b64_str.split("base64,")[1]
        return base64.b64decode(b64_str)

    def _download_and_encode(self, url):
        import httpx
        r = httpx.get(url)
        r.raise_for_status()
        img_b64 = base64.b64encode(r.content).decode("utf-8")
        return f"data:image/png;base64,{img_b64}"

engine = AIEngine()