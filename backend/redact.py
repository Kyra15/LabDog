import re
from collections import Counter, defaultdict

# lines with/without colons regex commands to find text
_SEP = r"\s*[:#]\s*"
_OPT = r"(?:\s*[:#]\s*|\s+|$)"

# general keywords to catch any PII using regex
_ID_LABELS = (
    r"mrn|medical\s+record(?:\s+(?:no\.?|number|#))?|patient\s+id|pt\.?\s*id"
    r"|account(?:\s+(?:no\.?|number|#))?|acct\s*(?:no\.?|#)?"
    r"|accession(?:\s+(?:no\.?|number|#))?|specimen\s+(?:id|no\.?|number)"
    r"|member\s+id|insurance\s+id|subscriber\s+id|policy(?:\s+(?:no\.?|number|#))?"
    r"|ssn|social\s+security(?:\s+(?:no\.?|number|#))?"
    r"|requisition(?:\s+(?:no\.?|number|#))?|lab\s+id|barcode"
)

_NAME_STRONG = r"patient\s+name|pt\.?\s*name|member\s+name|name\s+of\s+patient|full\s+name|legal\s+name"
_NAME_WEAK = (
    r"patient|pt|subscriber|guarantor|responsible\s+party|next\s+of\s+kin|emergency\s+contact"
    r"|(?:ordering|referring|attending|requesting|primary\s+care)\s+(?:physician|provider|doctor|clinician)"
    r"|ordered\s+by|physician|provider|doctor|pcp|collected\s+by|performed\s+by"
    r"|reviewed\s+by|verified\s+by|signed\s+by|pathologist|technologist"
)

_FIELD_RE = re.compile(
    r"(?:"
    r"(?P<dob>\b(?:d\.?o\.?b\.?|date\s+of\s+birth|birth\s*date)\b)" + _OPT + r"|"
    r"(?P<id>\b(?:" + _ID_LABELS + r")\b)" + _OPT + r"|"
    r"(?P<name1>\b(?:" + _NAME_STRONG + r")\b)" + _OPT + r"|"
    r"(?P<name2>\b(?:" + _NAME_WEAK + r")\b)" + _SEP + r"|"
    r"(?P<name3>^\s*name)" + _SEP + r"|"
    r"(?P<address>\b(?:(?:home|mailing|patient|street)\s+)?address|\baddr)" + _SEP +
    r")",
    re.IGNORECASE,
)

# value stops where one of these labels starts
_STOP_RE = re.compile(
    r"\b(?:sex|gender|age|dob|date|mrn|acct|account|accession|collected|collection|received|"
    r"reported|report|phone|tel|fax|address|specimen|fasting|physician|provider|doctor|ordered|"
    r"ordering|referring|requesting|printed|page|location|facility|lab|client|status|time)\b\s*[:#]",
    re.IGNORECASE,
)

_MONTHS = r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?"
_DATE_RE = re.compile(
    r"\b(?:\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}"
    r"|" + _MONTHS + r"\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+" + _MONTHS + r",?\s+\d{4})\b",
    re.IGNORECASE,
)
_ID_VALUE_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9\-/]*")

_PLACEHOLDER = {"name": "[NAME]", "dob": "[DOB]", "id": "[ID]", "address": "[ADDRESS]"}
_MAX_NAME_TOKENS = 6


def _find_span(kind, value):
    # start and end of redaction, replaced with redacted
    if kind == "dob":
        m = _DATE_RE.search(value)
        return (m.start(), m.end()) if m else None
    if kind == "id":
        for m in _ID_VALUE_RE.finditer(value):
            tok = m.group()
            if len(tok) >= 4 and any(c.isdigit() for c in tok):
                return m.start(), m.end()
        return None
    tokens = list(re.finditer(r"\S+", value))
    if not tokens:
        return None
    if kind == "name":
        tokens = tokens[:_MAX_NAME_TOKENS]
    start, end = tokens[0].start(), tokens[-1].end()
    while end > start and value[end - 1] in ",;|-:":
        end -= 1
    return (start, end) if end > start else None


def _label_pass(text, found, counts):
    out = []
    carry = None
    for line in text.split("\n"):
        if carry and line.strip():
            if len(line.strip()) <= 80 and not _FIELD_RE.search(line):
                span = _find_span(carry, line)
                if span:
                    s, e = span
                    found[carry].append(line[s:e])
                    counts[carry] += 1
                    line = line[:s] + _PLACEHOLDER[carry] + line[e:]
            carry = None

        matches = list(_FIELD_RE.finditer(line))
        edits = []
        for i, m in enumerate(matches):
            kind = re.sub(r"\d+$", "", m.lastgroup)
            limit = matches[i + 1].start() if i + 1 < len(matches) else len(line)
            stop = _STOP_RE.search(line, m.end(), limit)
            if stop:
                limit = stop.start()
            value = line[m.end():limit]
            if not value.strip():
                if i == len(matches) - 1:
                    carry = kind
                continue
            span = _find_span(kind, value)
            if span:
                s, e = m.end() + span[0], m.end() + span[1]
                edits.append((s, e, kind))

        for s, e, kind in sorted(edits, reverse=True):
            found[kind].append(line[s:e])
            counts[kind] += 1
            line = line[:s] + _PLACEHOLDER[kind] + line[e:]
        out.append(line)
    return "\n".join(out)



_STATES = (
    "AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|"
    "NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY"
)
_SUFFIX = (
    r"Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl|"
    r"Parkway|Pkwy|Highway|Hwy|Circle|Cir|Terrace|Ter|Trail|Trl"
)
_UNITS = r"mg|mcg|ug|ng|pg|ml|dl|l|g|u|iu|meq|mmol|mol|umol|fl|cells|copies|x10"

_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
_URL_RE = re.compile(r"\b(?:https?://|www\.)\S+", re.IGNORECASE)
_PHONE_RE = re.compile(
    r"(?<![\d.])(?:\+?1[\s.\-]?)?(?:\(\d{3}\)\s?|\d{3}[\s.\-])\d{3}[\s.\-]\d{4}(?!\d)"
    r"(?:\s*(?:x|ext\.?)\s*\d{1,5})?"
)
_PHONE_LABELED_RE = re.compile(
    r"\b(?:phone|tel(?:ephone)?|fax|cell|mobile)\s*(?:no\.?|number|#)?\s*[:#]?\s*(\+?\d[\d\s().\-]{7,}\d)",
    re.IGNORECASE,
)
_STREET_RE = re.compile(
    r"\b\d{1,6}\s+(?:[NSEW]\.?\s+)?"
    r"(?!(?:" + _UNITS + r")\b)(?:(?-i:[A-Z0-9])[A-Za-z0-9.'\-]*\s+){0,4}?"
    r"(?:" + _SUFFIX + r")\b\.?"
    r"(?:,?\s*(?:Apt|Apartment|Suite|Ste|Unit|Floor|Fl|#)\.?\s*[A-Za-z0-9\-]+)?",
    re.IGNORECASE,
)
_CSZ_RE = re.compile(
    r"\b[A-Z][A-Za-z.'\-]*(?:\s+[A-Z][A-Za-z.'\-]*){0,3},?\s+(?:" + _STATES + r")\s+\d{5}(?:-\d{4})?\b"
)
_STATE_ZIP_RE = re.compile(r"\b(?:" + _STATES + r")\s+\d{5}(?:-\d{4})?\b")
_DR_RE = re.compile(r"\b(?:Dr|Doctor|Prof)\.?\s+([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){0,2})")
_CRED_RE = re.compile(
    r"\b([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z'\-]+),?\s+"
    r"(?:M\.?D\.?|D\.?O\.?|N\.?P\.?|P\.?A\.?(?:-C)?|R\.?N\.?|Ph\.?D\.?|DPM|DDS)(?![A-Za-z])"
)


def _sub(pattern, repl, text, key, counts, found=None, group=None):
    def fn(m):
        counts[key] += 1
        if found is not None and group is not None:
            found["name"].append(m.group(group))
        if group is None:
            return repl
        return m.group(0)[: m.start(group) - m.start()] + repl + m.group(0)[m.end(group) - m.start():]
    return pattern.sub(fn, text)


def _pattern_pass(text, found, counts):
    text = _sub(_SSN_RE, "[SSN]", text, "ssn", counts)
    text = _sub(_EMAIL_RE, "[EMAIL]", text, "email", counts)
    text = _sub(_URL_RE, "[URL]", text, "url", counts)
    text = _sub(_PHONE_LABELED_RE, "[PHONE]", text, "phone", counts, group=1)
    text = _sub(_PHONE_RE, "[PHONE]", text, "phone", counts)
    text = _sub(_STREET_RE, "[ADDRESS]", text, "address", counts)
    text = _sub(_CSZ_RE, "[ADDRESS]", text, "address", counts)
    text = _sub(_STATE_ZIP_RE, "[ADDRESS]", text, "address", counts)
    text = _sub(_DR_RE, "[NAME]", text, "name", counts, found=found, group=1)
    text = _sub(_CRED_RE, "[NAME]", text, "name", counts, found=found, group=1)
    return text



_TITLES = re.compile(r"\b(?:dr|mr|mrs|ms|prof|md|do|np|pa|rn|phd|jr|sr|ii|iii|iv)\b\.?", re.IGNORECASE)
_NOT_NAMES = {
    "high", "low", "normal", "test", "tests", "result", "results", "blood", "urine", "serum",
    "plasma", "range", "date", "time", "fasting", "male", "female", "page", "panel", "total",
    "report", "lab", "name", "patient", "unknown", "none", "the", "and", "for", "not",
}


def _name_tokens(raw):
    cleaned = _TITLES.sub(" ", raw)
    cleaned = re.sub(r"[^A-Za-z'\- ]", " ", cleaned)
    return [t for t in cleaned.split() if len(t) >= 3 and t.lower() not in _NOT_NAMES]


def _scrub_words(text, words, placeholder, counts, key):
    words = sorted({w for w in words if w}, key=len, reverse=True)
    if not words:
        return text
    pattern = re.compile(
        r"(?<![A-Za-z])(?:" + "|".join(re.escape(w) for w in words) + r")(?![A-Za-z])",
        re.IGNORECASE,
    )
    text, n = pattern.subn(placeholder, text)
    counts[key] += n
    return text


def _propagate(text, found, counts):
    # scrub name tokens
    tokens = []
    for raw in found["name"]:
        if not re.search(r"\d", raw):
            tokens += _name_tokens(raw)
    text = _scrub_words(text, tokens, "[NAME]", counts, "name")
    text = re.sub(r"\[NAME\](?:[\s,]+(?:[A-Za-z]\.?[\s,]+)?\[NAME\])+", "[NAME]", text)
    text = re.sub(r"\[NAME\][ \t]+[A-Z]\.?(?=[ \t]|$)", "[NAME]", text, flags=re.MULTILINE)

    # scrub DOB, id, and addresses
    for kind in ("dob", "id", "address"):
        values = [re.sub(r"\s+", " ", v).strip() for v in found[kind]]
        values = [v for v in values if len(v) >= 5]
        text = _scrub_words(text, values, _PLACEHOLDER[kind], counts, kind)
    return text



def redact(text):
    # return clean redacted text
    counts = Counter()
    found = defaultdict(list)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = _label_pass(text, found, counts)
    text = _pattern_pass(text, found, counts)
    text = _propagate(text, found, counts)
    return text, dict(counts)
