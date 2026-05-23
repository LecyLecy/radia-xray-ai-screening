from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: str
    examination_id: str
    report_url: str
    generated_by_user_id: str


class ReportDownloadResponse(BaseModel):
    report_id: str
    report_url: str
    download_url: str
