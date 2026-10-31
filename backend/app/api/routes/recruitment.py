from __future__ import annotations

import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import require

router = APIRouter(prefix="/recruitment", tags=["recruitment"])

KNOWN_SKILLS = [
    "React", "TypeScript", "JavaScript", "Python", "Java", "Go", "Node", "SQL",
    "PostgreSQL", "AWS", "Docker", "Kubernetes", "Figma", "Django", "FastAPI",
    "GraphQL", "Kotlin", "Swift", "Rust", "ML", "TensorFlow", "PyTorch",
]

DEPT_CODES = {
    "Engineering": "ENG", "Product": "PRD", "Design": "DSN", "Marketing": "MKT",
    "Sales": "SAL", "People Ops": "HRO", "Finance": "FIN", "Customer Success": "CS",
}


class ParseResumeRequest(BaseModel):
    text: str


class ParsedResume(BaseModel):
    name: str
    email: str
    phone: str
    role: str
    skills: list[str]
    source: str  # "llm" | "heuristic"


class CompanyIdResponse(BaseModel):
    employee_id: str
    format: str


def _heuristic_parse(text: str) -> ParsedResume:
    email_m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]{2,}", text)
    phone_m = re.search(r"(\+?\d[\d ()-]{8,}\d)", text)
    first_line = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    if re.fullmatch(r"[A-Za-z][A-Za-z .'-]{2,40}", first_line):
        name = first_line
    elif email_m:
        name = email_m.group(0).split("@")[0].replace(".", " ").replace("_", " ").title()
    else:
        name = "New Candidate"
    skills = [s for s in KNOWN_SKILLS if re.search(rf"\b{re.escape(s)}\b", text, re.I)]
    role_m = re.search(
        r"(senior |lead |staff |junior )?(software|frontend|backend|full[- ]?stack|data|product|ux|ui|devops|qa|mobile)[\w /-]*"
        r"(engineer|developer|designer|manager|scientist|analyst)",
        text, re.I,
    )
    return ParsedResume(
        name=name.title()[:60],
        email=email_m.group(0) if email_m else "",
        phone=(phone_m.group(0).strip() if phone_m else ""),
        role=role_m.group(0) if role_m else "",
        skills=skills,
        source="heuristic",
    )


@router.post("/parse-resume", response_model=ParsedResume, dependencies=[Depends(require("recruitment:manage"))])
async def parse_resume(payload: ParseResumeRequest):
    """
    Extract candidate fields from résumé text so HR reviews instead of retyping.

    OCR note: for scanned PDFs/images, run OCR (e.g. Tesseract) to text first,
    then POST that text here.

    LLM note: this heuristic is a drop-in baseline. To use an LLM (Claude) for
    higher-quality extraction, call the Anthropic API here with a structured
    prompt and fall back to the heuristic on error — the response shape is the
    same (``source`` then reports "llm").
    """
    return _heuristic_parse(payload.text)


@router.get("/company-id", response_model=CompanyIdResponse, dependencies=[Depends(require("employees:create"))])
async def generate_company_id(department: str = "Engineering"):
    """Generate the next company employee ID in the org's format."""
    code = DEPT_CODES.get(department, "GEN")
    year = datetime.now(timezone.utc).year
    seq = datetime.now(timezone.utc).strftime("%m%d%H%M")[-4:]
    fmt = "PH-<DEPT>-<YEAR>-<SEQ>"
    return CompanyIdResponse(employee_id=f"PH-{code}-{year}-{seq}", format=fmt)
