
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = "D:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\CNTT_2022605948_Lê Văn Hải_Baocao_Main.docx"
try {
    $doc = $word.Documents.Open($docPath)
    $text = $doc.Content.Text
    $doc.Close($false)
    $word.Quit()
    $outPath = "D:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\thesis_extracted.txt"
    [System.IO.File]::WriteAllText($outPath, $text, [System.Text.Encoding]::UTF8)
    Write-Output "SUCCESS: $($text.Length) chars"
} catch {
    $word.Quit()
    Write-Output "ERROR: $($_.Exception.Message)"
}
