import base64
import binascii
import io
import logging
import os
from concurrent.futures import ThreadPoolExecutor

import cohere
import cv2
import numpy as np
import pillow_heif
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from werkzeug.exceptions import HTTPException
from tools import check_quality, post_process

load_dotenv()
pillow_heif.register_heif_opener()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

api_key = os.environ.get("API_KEY")
co = cohere.ClientV2(api_key) if api_key else None

MAX_PAGES = 10
OCR_WORKERS = 3

PROMPT_OCR = (
    "Transcribe every piece of visible text in this image exactly as it "
    "appears, in reading order. Do not summarize, explain, or add commentary."
    "Output only the transcribed text."
)

PROMPT = (
    ""
)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
CORS(app)


def fail(message, status, code=None):
    body = {"error": message}
    if code:
        body["code"] = code
    return jsonify(body), status


@app.errorhandler(HTTPException)
def handle_http_error(e):
    return fail(e.description, e.code)


@app.errorhandler(Exception)
def handle_unexpected_error(e):
    log.exception("unhandled error")
    return fail("internal server error", 500)


def decode_image(image_base64):
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(image_base64)
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    if image is None:
        # opencv can't read heic, fall back to pillow
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    return image


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "cohere": co is not None})


def read_page(image_base64, run_quality_check):
    try:
        image = decode_image(image_base64)
    except (binascii.Error, ValueError, OSError, cv2.error, Image.DecompressionBombError):
        raise ValueError("unreadable", "That image could not be opened. Try retaking it.")

    if run_quality_check:
        problem = check_quality(image)
        if problem:
            raise ValueError(*problem)

    image = post_process(image)
    success, encoded_img = cv2.imencode(".jpg", image)
    if not success:
        raise ValueError("unreadable", "That image could not be processed. Try retaking it.")

    data_uri = "data:image/jpeg;base64," + base64.b64encode(encoded_img).decode("utf-8")

    try:
        response = co.chat(
            model="command-a-vision-07-2025",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": PROMPT_OCR},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_uri, "detail": "high"},
                        },
                    ],
                }
            ],
            temperature=0.0,
        )
    except Exception:
        log.exception("ocr req failed")
        raise ValueError("ocr_failed", "The reader is having trouble right now. Please try again in a moment.")

    parts = response.message.content or []
    text = parts[0].text.strip() if parts else ""
    if not text:
        raise ValueError("no_text", "No text was found. Make sure the lab report fills the frame.")
    return text


@app.route("/analyze", methods=["POST"])
def analyze_photo():
    data = request.get_json(silent=True) or {}
    images = data.get("images")
    if images is None and data.get("imageBase64"):
        images = [data["imageBase64"]]

    if not isinstance(images, list) or not images or not all(isinstance(i, str) and i for i in images):
        return fail("images is required", 400)
    if len(images) > MAX_PAGES:
        return fail(f"Please scan {MAX_PAGES} pages or fewer at a time.", 400, "too_many_pages")
    if co is None:
        return fail("server is missing its api key", 500)

    run_check = not data.get("skipQualityCheck")

    def run(numbered):
        page, b64 = numbered
        try:
            return page, read_page(b64, run_check), None
        except ValueError as e:
            return page, None, e

    # pool.map keeps input order of pages whne uploaded so should come back numbered
    with ThreadPoolExecutor(max_workers=OCR_WORKERS) as pool:
        results = list(pool.map(run, enumerate(images, start=1)))

    texts = [text for _, text, err in results if err is None]
    problems = [
        {"page": page, "code": err.code, "error": err.message}
        for page, _, err in results
        if err is not None
    ]

    if not texts:
        first = problems[0]
        message = first["error"]
        if len(images) > 1:
            message = f"None of the pages could be read. Page {first['page']}: {message}"
        status = 502 if first["code"] == "ocr_failed" else 422
        return fail(message, status, first["code"])

    return jsonify({"summary": "\n\n".join(texts), "pages": len(images), "problems": problems})




if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 4200)),
        debug=os.environ.get("FLASK_DEBUG") == "1",
    )
