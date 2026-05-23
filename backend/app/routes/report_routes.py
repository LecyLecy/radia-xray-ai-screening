from fastapi import APIRouter, Depends, HTTPException

from app.schemas.report_schema import ReportDownloadResponse
from app.schemas.user_schema import CurrentUserResponse
from app.services.report_service import ReportServiceError, get_report_download
from app.services.user_service import UserServiceError, get_current_user_with_role
from app.utils.security import get_current_auth_user


router = APIRouter(prefix="/reports", tags=["Reports"])


def require_authenticated_user(
    auth_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> CurrentUserResponse:
    try:
        return get_current_user_with_role(auth_user)
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.get("/{report_id}/download", response_model=ReportDownloadResponse)
def download_report(
    report_id: str,
    current_user: CurrentUserResponse = Depends(require_authenticated_user),
) -> ReportDownloadResponse:
    try:
        return get_report_download(report_id, current_user)
    except ReportServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
