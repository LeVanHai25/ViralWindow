$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc1Path = "d:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\2025-phu-luc-quy-dinh-lam-da-kltn.doc"
    $doc1 = $word.Documents.Open($doc1Path)
    $doc1.Content.Text | Out-File -FilePath "d:\ViralWindow_Phan_Mem_Nhom_Kinh\regulations.txt" -Encoding UTF8
    $doc1.Close()
    Write-Host "Extracted regulations"

    $doc2Path = "d:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\LevanHai_2022605948_Bao_Cao.docx"
    $doc2 = $word.Documents.Open($doc2Path)
    $doc2.Content.Text | Out-File -FilePath "d:\ViralWindow_Phan_Mem_Nhom_Kinh\sample_report.txt" -Encoding UTF8
    $doc2.Close()
    Write-Host "Extracted sample report"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    $word.Quit()
}
