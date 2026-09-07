"""
FastAPI application entry point.
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import health
from app.commercial.local.supplier.etender import endpoints as etender_endpoints
from app.commercial.import_.lc_item_register import endpoints as lc_item_endpoints
from app.bme.warehouse import endpoints as warehouse_endpoints
from app.bme.requisitions import endpoints as requisitions_endpoints
from app.bme.purchase_order import endpoints as po_endpoints

from app.auth.router import router as auth_router  
from app.auth.admin_router import router as admin_router


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    debug=settings.debug,
)

# Allow the Vite dev server (and preview) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(warehouse_endpoints.router)
app.include_router(requisitions_endpoints.router)
app.include_router(etender_endpoints.router)
app.include_router(lc_item_endpoints.router)
app.include_router(po_endpoints.router)
app.include_router(admin_router)
app.include_router(auth_router)  
app.include_router(health.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
