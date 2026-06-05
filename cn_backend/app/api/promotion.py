import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.models.class_subject import Class
from app.models.promotion import PromotionLog, PromotionHistory
from app.models.user import User
from app.schemas.promotion import PromotionRequest, PromotionLogOut, PromotionHistoryOut
from app.core.deps import require_admin

router = APIRouter(prefix="/promotion", tags=["Promotion"])


def get_next_class_name(current_name: str) -> str:
    match = re.search(r'\d+', current_name)
    if not match:
        return ""
    num = int(match.group())
    next_num = num + 1
    start, end = match.span()
    return current_name[:start] + str(next_num) + current_name[end:]


@router.post("/promote", response_model=PromotionLogOut)
def promote_students(data: PromotionRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    # 1. Check if promotion to to_academic_year already exists
    existing_log = db.query(PromotionLog).filter(PromotionLog.to_academic_year == data.to_academic_year).first()
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Promotion to academic year {data.to_academic_year} has already been completed."
        )

    # 2. Get active students in from_academic_year
    students = db.query(Student).filter(
        Student.status == "active",
        Student.academic_year == data.from_academic_year
    ).all()

    if not students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active students found in academic year {data.from_academic_year}."
        )

    # 3. Validation Pass: Ensure target classes exist for non-final class students
    errors = []
    student_promotions = [] # list of tuples: (student, from_class, to_class, status)
    
    for s in students:
        from_class = db.query(Class).filter(Class.id == s.class_id).first()
        if not from_class:
            errors.append(f"Student {s.name} is assigned to an invalid class ID {s.class_id}.")
            continue

        is_final = False
        for final_name in data.final_class_names:
            if final_name.strip().lower() in from_class.name.lower():
                is_final = True
                break

        if is_final:
            student_promotions.append((s, from_class, None, "passed_out"))
        else:
            next_name = get_next_class_name(from_class.name)
            if not next_name:
                errors.append(f"Could not parse a next class level for class name '{from_class.name}' (student: {s.name}).")
                continue

            target_class = db.query(Class).filter(
                Class.name == next_name,
                Class.section == from_class.section,
                Class.medium == from_class.medium
            ).first()

            if not target_class:
                errors.append(
                    f"Target class '{next_name}' (Section: {from_class.section}, Medium: {from_class.medium}) "
                    f"does not exist. Please create it first (for student {s.name})."
                )
            else:
                student_promotions.append((s, from_class, target_class, "promoted"))

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validation failed:\n" + "\n".join(errors[:10]) + (f"\n...and {len(errors) - 10} more errors" if len(errors) > 10 else "")
        )

    # 4. Perform Promotion
    promoted_count = 0
    passed_out_count = 0

    log = PromotionLog(
        from_academic_year=data.from_academic_year,
        to_academic_year=data.to_academic_year,
        promoted_by=current_user.id
    )
    db.add(log)
    db.flush() # Get log.id

    for s, from_class, to_class, status_type in student_promotions:
        history = PromotionHistory(
            promotion_log_id=log.id,
            student_id=s.id,
            from_class_id=from_class.id,
            to_class_id=to_class.id if to_class else None,
            status=status_type
        )
        db.add(history)

        # Update student record
        s.academic_year = data.to_academic_year
        if status_type == "passed_out":
            s.status = "passed_out"
            passed_out_count += 1
        else:
            s.class_id = to_class.id
            promoted_count += 1

    log.promoted_count = promoted_count
    log.passed_out_count = passed_out_count
    db.commit()
    db.refresh(log)

    # Prepare response
    admin_user = db.query(User).filter(User.id == log.promoted_by).first()
    return PromotionLogOut(
        id=log.id,
        from_academic_year=log.from_academic_year,
        to_academic_year=log.to_academic_year,
        promoted_count=log.promoted_count,
        passed_out_count=log.passed_out_count,
        promoted_by=log.promoted_by,
        promoted_by_name=admin_user.mobile if admin_user else "Admin",
        created_at=log.created_at
    )


@router.get("/history", response_model=List[PromotionLogOut])
def list_promotion_history(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    logs = db.query(PromotionLog).order_by(PromotionLog.created_at.desc()).all()
    result = []
    for log in logs:
        admin_user = db.query(User).filter(User.id == log.promoted_by).first()
        result.append(PromotionLogOut(
            id=log.id,
            from_academic_year=log.from_academic_year,
            to_academic_year=log.to_academic_year,
            promoted_count=log.promoted_count,
            passed_out_count=log.passed_out_count,
            promoted_by=log.promoted_by,
            promoted_by_name=admin_user.mobile if admin_user else "Admin",
            created_at=log.created_at
        ))
    return result


@router.get("/history/{log_id}", response_model=PromotionLogOut)
def get_promotion_details(log_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    log = db.query(PromotionLog).filter(PromotionLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion log not found."
        )

    admin_user = db.query(User).filter(User.id == log.promoted_by).first()
    
    histories_out = []
    for hist in log.histories:
        student = db.query(Student).filter(Student.id == hist.student_id).first()
        from_cls = db.query(Class).filter(Class.id == hist.from_class_id).first()
        to_cls = db.query(Class).filter(Class.id == hist.to_class_id).first() if hist.to_class_id else None

        histories_out.append(PromotionHistoryOut(
            id=hist.id,
            student_id=hist.student_id,
            student_name=student.name if student else f"Student #{hist.student_id}",
            from_class_id=hist.from_class_id,
            from_class_name=f"{from_cls.name} ({from_cls.section})" if from_cls else "Unknown",
            to_class_id=hist.to_class_id,
            to_class_name=f"{to_cls.name} ({to_cls.section})" if to_cls else None,
            status=hist.status,
            created_at=hist.created_at
        ))

    return PromotionLogOut(
        id=log.id,
        from_academic_year=log.from_academic_year,
        to_academic_year=log.to_academic_year,
        promoted_count=log.promoted_count,
        passed_out_count=log.passed_out_count,
        promoted_by=log.promoted_by,
        promoted_by_name=admin_user.mobile if admin_user else "Admin",
        created_at=log.created_at,
        histories=histories_out
    )
