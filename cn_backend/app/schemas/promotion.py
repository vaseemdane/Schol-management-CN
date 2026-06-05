from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PromotionRequest(BaseModel):
    from_academic_year: str
    to_academic_year: str
    final_class_names: List[str]


class PromotionHistoryOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    from_class_id: int
    from_class_name: Optional[str] = None
    to_class_id: Optional[int] = None
    to_class_name: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PromotionLogOut(BaseModel):
    id: int
    from_academic_year: str
    to_academic_year: str
    promoted_count: int
    passed_out_count: int
    promoted_by: int
    promoted_by_name: Optional[str] = None
    created_at: datetime
    histories: Optional[List[PromotionHistoryOut]] = None

    class Config:
        from_attributes = True
