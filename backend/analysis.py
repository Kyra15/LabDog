import json
import logging
import os
import re

log = logging.getLogger(__name__)

ANALYSIS_MODEL = os.environ.get("ANALYSIS_MODEL", "command-a-03-2025")
MAX_INPUT_CHARS = 60000
MAX_MARKERS = 100

DISCLAIMER = (
    "LabDog explains lab results in plain language. It is not a diagnosis. Talk to your doctor about your results."
)

# used AI to set up system prompts, as AI are usually more thourough and understand how to control other AIs
SYSTEM_PROMPT = """You explain laboratory reports to patients in plain language.
You are given text transcribed from a lab report. Personal details were removed and
appear as placeholders such as [NAME], [DOB] or [ID]. Never guess what a placeholder was.

Return ONE JSON object that matches the schema. Rules:

1. markers: one entry per test result printed in the text, in the order they appear.
   Copy name, value, unit and range EXACTLY as printed. Do not convert units, round,
   or reword. If something is not printed, use "". Never add a result that is not in
   the text. printed_flag: copy the abnormal flag exactly as printed (H, L, High, Low,
   *, Abnormal ...), or "" if there is none.
2. summary: 2 to 4 short sentences in plain words (about an 8th grade reading level):
   what kind of report this is and what stands out.
3. key_insights: up to 5 short items. Each one explains, in plain words, what a result
   that is outside its printed range measures and that being outside the range can have
   many causes, many of them harmless. Only discuss results that are in markers.
4. doctor_questions: 3 to 5 specific questions the person could ask their doctor.
5. NEVER diagnose. Do not say or imply that the person has, may have, or does not have
   any disease or condition. Do not name a condition as a conclusion. Do not suggest
   medicines, doses or treatments. Use wording like "worth discussing with your doctor".
6. If the text is not a lab report or has no readable results, return an empty markers
   list and say so in the summary.
7. Use only information in the text. If something is unclear, leave it blank.
Write in English. Output JSON only."""

# call schema
_STR = {"type": "string"}
SCHEMA = {
    "type": "object",
    "properties": {
        "title": _STR,
        "report_date": _STR,
        "summary": _STR,
        "markers": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": _STR,
                    "value": _STR,
                    "unit": _STR,
                    "range": _STR,
                    "printed_flag": _STR,
                },
                "required": ["name", "value", "unit", "range", "printed_flag"],
            },
        },
        "key_insights": {"type": "array", "items": _STR},
        "doctor_questions": {"type": "array", "items": _STR},
    },
    "required": ["title", "report_date", "summary", "markers", "key_insights", "doctor_questions"],
}


# more error class bc of getters and setters
class AnalysisError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


# some helpers
def _norm(s):
    return re.sub(r"\s+", " ", s or "").strip().lower()


def _str(v, limit):
    return v.strip()[:limit] if isinstance(v, str) else ""


_NUM = r"[-+]?\d+(?:,\d{3})*(?:\.\d+)?|[-+]?\.\d+"


def _to_float(s):
    try:
        return float(s.replace(",", ""))
    except ValueError:
        return None


def parse_value(value):
    # parse numbers
    m = re.fullmatch(r"\s*(" + _NUM + r")\s*", value or "")
    return _to_float(m.group(1)) if m else None


_UNIT_TAIL = r"(?:\s*[A-Za-z%/][A-Za-z0-9%/.^\-]{0,14})?"


def parse_range(rng):
    # parses values that are ranges (like 1 to 100, 1-100, etc.)
    r = rng or ""
    m = re.fullmatch(r"\s*(" + _NUM + r")\s*(?:-|–|—|to)\s*(" + _NUM + r")" + _UNIT_TAIL + r"\s*", r, re.IGNORECASE)
    if m:
        lo, hi = _to_float(m.group(1)), _to_float(m.group(2))
        if lo is not None and hi is not None and lo <= hi:
            return lo, hi, True, True
        return None
    m = re.fullmatch(r"\s*(<=|≤|<)\s*(" + _NUM + r")" + _UNIT_TAIL + r"\s*", r)
    if m:
        return None, _to_float(m.group(2)), True, m.group(1) != "<"
    m = re.fullmatch(r"\s*(>=|≥|>)\s*(" + _NUM + r")" + _UNIT_TAIL + r"\s*", r)
    if m:
        return _to_float(m.group(2)), None, m.group(1) != ">", True
    return None


_HIGH = {"h", "hi", "high", "hh", "critical high", "crit high"}
_LOW = {"l", "lo", "low", "ll", "critical low", "crit low"}
_NORMAL = {"n", "normal", "wnl"}


def derive_flag(value, ref_range, printed_flag):
    # high low medium parser
    p = _norm(printed_flag).strip("*. ")
    if p in _HIGH:
        return "high"
    if p in _LOW:
        return "low"
    if p in _NORMAL:
        return "normal"

    v = parse_value(value)
    rng = parse_range(ref_range)
    if v is None or rng is None:
        return "unknown"
    lo, hi, lo_inc, hi_inc = rng
    if lo is not None and (v < lo or (v == lo and not lo_inc)):
        return "low"
    if hi is not None and (v > hi or (v == hi and not hi_inc)):
        return "high"
    return "normal"


# do NOT include diagnoses bc that would be an invasion of privacy
_DIAGNOSIS_PATTERNS = [
    r"\bdiagnos\w*",
    r"\byou\s+(?:likely\s+|probably\s+|definitely\s+)?(?:have|has|had)\s+(?!questions?\b|a\s+question\b|any\b|some\b)",
    r"\byou(?:'re|\s+are)\s+(?:diabetic|prediabetic|anemic|anaemic|hypothyroid|hyperthyroid|sick|ill)\b",
    r"\bsuffer\w*\s+from\b",
    r"\b(?:indicates?|confirms?|means?|proves?|shows?)\s+(?:that\s+)?you\b",
    r"\bconsistent\s+with\b",
    r"\bprescri\w+",
    r"\byou\s+(?:should|need\s+to|must)\s+(?:take|start|stop)\b",
]
_DIAGNOSIS_RE = re.compile("|".join(_DIAGNOSIS_PATTERNS), re.IGNORECASE)


def _drop_diagnosis(text):
    # get rid of diagnosises
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    kept = [s for s in sentences if not _DIAGNOSIS_RE.search(s)]
    return " ".join(kept).strip(), len(sentences) - len(kept)


def clean_analysis(raw, source_text):
    if not isinstance(raw, dict):
        raise ValueError("model did not return a JSON object")

    src = _norm(source_text)
    markers = []
    for item in (raw.get("markers") or [])[: MAX_MARKERS * 2]:
        if not isinstance(item, dict):
            continue
        name = _str(item.get("name"), 120)
        if not name or _norm(name) not in src:
            continue
        value = _str(item.get("value"), 60)
        unit = _str(item.get("unit"), 40)
        rng = _str(item.get("range"), 80)
        if value and _norm(value) not in src:
            value = ""
        if unit and _norm(unit) not in src:
            unit = ""
        if rng and _norm(rng) not in src:
            rng = ""
        flag = derive_flag(value, rng, _str(item.get("printed_flag"), 20)) if value else "unknown"
        markers.append(
            {"name": name, "value": value, "unit": unit, "ref_range": rng, "flag": flag,
             "position": len(markers)}
        )
        if len(markers) >= MAX_MARKERS:
            break

    dropped = 0
    summary, n = _drop_diagnosis(_str(raw.get("summary"), 1200))
    dropped += n
    if not summary:
        summary = ("This report was read, but a plain-language summary isn't available. "
                   "Please review the results with your doctor.")

    insights = []
    for s in (raw.get("key_insights") or [])[:5]:
        s, n = _drop_diagnosis(_str(s, 500))
        dropped += n
        if s:
            insights.append(s)

    questions = [q for q in (_str(q, 300) for q in (raw.get("doctor_questions") or [])[:5]) if q]

    if dropped:
        log.info("removed %d sentence(s) that read like a diagnosis", dropped)

    return {
        "title": _str(raw.get("title"), 80) or "Lab report",
        "report_date": _str(raw.get("report_date"), 30),
        "summary": summary,
        "key_insights": insights,
        "doctor_questions": questions,
        "markers": markers,
        "disclaimer": DISCLAIMER,
    }



def analyze_report(co, redacted_text):
    text = redacted_text.strip()[:MAX_INPUT_CHARS]
    if not text:
        raise AnalysisError("no_text", "No text was found. Make sure the lab report fills the frame.")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "Lab report text:\n\n" + text + "\n\nReturn the JSON object."},
    ]

    for i in range(2):
        try:
            response = co.chat(
                model=ANALYSIS_MODEL,
                messages=messages,
                temperature=0.0,
                max_tokens=7000,
                response_format={"type": "json_object", "schema": SCHEMA},
            )
        except Exception as e:
            # log the error without the name in case it shows PII
            log.error("analysis call failed: %s status=%s", type(e).__name__, getattr(e, "status_code", None))
            raise AnalysisError("analysis_failed",
                                "The explainer is having trouble right now. Please try again in a moment.")
        try:
            parts = response.message.content or []
            return clean_analysis(json.loads(parts[0].text), text)
        except (ValueError, IndexError, AttributeError, TypeError):
            log.warning("analysis returned unusable json, retrying")
    raise AnalysisError("analysis_failed", "We couldn't organize the results. Please try scanning again.")
