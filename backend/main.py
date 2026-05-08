from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import db_core
from datetime import date

app = FastAPI(title="ELN Finance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- AUTH ----------
class LoginRequest(BaseModel):
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    if req.password == "Mclovinepato":
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Senha incorreta")

# ---------- DASHBOARD ----------
@app.get("/api/dashboard")
def dashboard(month: int, year: int):
    return db_core.get_dashboard_data(month, year)

@app.get("/api/dashboard/person")
def person_detail(name: str, month: int, year: int):
    return db_core.get_person_debt_details(name, month, year)

# ---------- PERSONS ----------
@app.get("/api/persons")
def get_persons():
    return [{"id": p.id, "name": p.name} for p in db_core.get_persons()]

class PersonCreate(BaseModel):
    name: str

@app.post("/api/persons")
def create_person(body: PersonCreate):
    ok = db_core.add_person(body.name)
    if not ok:
        raise HTTPException(400, "Nome já existe")
    return {"ok": True}

@app.delete("/api/persons/{pid}")
def delete_person(pid: int):
    ok, msg = db_core.delete_person(pid)
    if not ok:
        raise HTTPException(400, msg)
    return {"ok": True}

# ---------- CARDS ----------
@app.get("/api/cards")
def get_cards():
    return [{"id": c.id, "name": c.name, "closing_day": c.closing_day}
            for c in db_core.get_cards()]

# ---------- PURCHASES ----------
class PurchaseCreate(BaseModel):
    description: str
    total_amount: float
    purchase_date: str
    installments_count: int
    person_id: int
    card_id: int

@app.get("/api/purchases")
def get_purchases():
    return db_core.get_recent_purchases(limit=20)

@app.post("/api/purchases")
def create_purchase(body: PurchaseCreate):
    ok = db_core.process_purchase(
        body.description, body.total_amount, body.purchase_date,
        body.installments_count, body.person_id, body.card_id
    )
    if not ok:
        raise HTTPException(400, "Erro ao salvar compra")
    return {"ok": True}

@app.delete("/api/purchases/{pid}")
def delete_purchase(pid: int):
    ok = db_core.delete_purchase(pid)
    if not ok:
        raise HTTPException(400, "Erro ao excluir")
    return {"ok": True}

# ---------- INVOICES ----------
@app.get("/api/invoices")
def get_invoices(card_id: int, year: int, month: int):
    return db_core.get_invoice_items(card_id, year, month)

# ---------- PAYMENTS ----------
@app.get("/api/payments")
def get_payments(person: str, month: int, year: int):
    return db_core.get_installments_for_payment(person, month, year)

@app.post("/api/payments/{iid}/toggle")
def toggle_payment(iid: int):
    db_core.toggle_payment(iid)
    return {"ok": True}

# ---------- HISTORY ----------
@app.get("/api/history")
def get_history():
    return db_core.get_paid_history()

# ---------- ANALYTICS ----------
@app.get("/api/analytics/ranking")
def get_ranking():
    return [{"name": r[0], "total": r[1]} for r in db_core.get_ranking_data()]

# ---------- LOANS ----------
@app.get("/api/loans")
def get_loans():
    loans = db_core.get_active_loans()
    return [{
        "id": l.id, "description": l.description,
        "total_amount": l.total_amount, "remaining_amount": l.remaining_amount,
        "loan_date": str(l.loan_date), "debtor_name": l.debtor_name
    } for l in loans]

class LoanCreate(BaseModel):
    description: str
    total_amount: float
    debtor_name: Optional[str] = None

@app.post("/api/loans")
def create_loan(body: LoanCreate):
    ok = db_core.add_loan(body.description, body.total_amount, body.debtor_name)
    if not ok:
        raise HTTPException(400, "Erro ao salvar")
    return {"ok": True}

class LoanUpdate(BaseModel):
    description: str
    total_amount: float
    debtor_name: Optional[str] = None

@app.put("/api/loans/{lid}")
def update_loan(lid: int, body: LoanUpdate):
    ok = db_core.update_loan(lid, body.description, body.total_amount, body.debtor_name)
    if not ok:
        raise HTTPException(400, "Erro ao atualizar")
    return {"ok": True}

@app.delete("/api/loans/{lid}")
def delete_loan(lid: int):
    ok = db_core.delete_loan(lid)
    if not ok:
        raise HTTPException(400, "Erro ao excluir")
    return {"ok": True}

class AbateBody(BaseModel):
    value: float

@app.post("/api/loans/{lid}/abate")
def abate_loan(lid: int, body: AbateBody):
    ok = db_core.abate_loan(lid, body.value)
    if not ok:
        raise HTTPException(400, "Erro ao abater")
    return {"ok": True}
