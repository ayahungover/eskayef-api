"""
FastAPI application entry point.
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import db, items, products, requisitions

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    debug=settings.debug,
)

# Allow the Vite dev server (and preview) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(db.router)
app.include_router(requisitions.router)
app.include_router(items.router)
app.include_router(products.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
