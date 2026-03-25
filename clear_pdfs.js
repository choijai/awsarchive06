// localStorage에서 mockExamPdfCreatedAt 삭제
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem("mockExamPdfCreatedAt");
  console.log("✅ 저장된 모든 PDF 생성 시간 삭제 완료");
}
