"""
Business logic for purchase requisitions.
"""

from sqlalchemy.orm import Session
from app.bme.requisitions import repository


def get_requisitions_page(
    db: Session,
    *,
    page: int = 1,
    size: int = 20,
    indent_no: str | None = None,
    sort_by: str = "IndentDate",
    sort_order: str = "desc",
) -> tuple[list[dict], int, int]:
    return repository.get_requisitions_page(
        db,
        page=page,
        size=size,
        indent_no=indent_no,
        sort_by=sort_by,
        sort_order=sort_order,
    )