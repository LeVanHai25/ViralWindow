Option Explicit

Sub UpdateTOC_And_FixAbbreviation()
    Dim doc As Document
    Dim toc As TableOfContents
    Dim para As Paragraph
    Dim i As Integer
    
    Set doc = ActiveDocument
    
    ' =============================================
    ' 1. Cập nhật toàn bộ mục lục
    ' =============================================
    If doc.TablesOfContents.Count > 0 Then
        For Each toc In doc.TablesOfContents
            toc.Update
        Next toc
        MsgBox "✅ Đã cập nhật " & doc.TablesOfContents.Count & " mục lục!", vbInformation
    Else
        MsgBox "⚠️ Không tìm thấy mục lục tự động. Vui lòng tạo mục lục bằng: References > Table of Contents", vbExclamation
    End If
    
    ' =============================================
    ' 2. Đánh số trang
    ' =============================================
    Dim sec As Section
    For Each sec In doc.Sections
        With sec.Footers(wdHeaderFooterPrimary)
            .LinkToPrevious = False
            .Range.Text = ""
            ' Thêm số trang ở giữa chân trang
            With .Range
                .ParagraphFormat.Alignment = wdAlignParagraphCenter
                .Font.Name = "Times New Roman"
                .Font.Size = 13
            End With
            sec.Footers(wdHeaderFooterPrimary).PageNumbers.Add _
                PageNumberAlignment:=wdAlignPageNumberCenter, _
                FirstPage:=True
        End With
    Next sec
    
    ' =============================================
    ' 3. Kiểm tra DANH MỤC TỪ VIẾT TẮT đã có chưa
    ' =============================================
    Dim hasAbbr As Boolean
    hasAbbr = False
    For Each para In doc.Paragraphs
        If InStr(UCase(para.Range.Text), "DANH MỤC TỪ VIẾT TẮT") > 0 Then
            hasAbbr = True
            Exit For
        End If
    Next para
    
    If hasAbbr Then
        MsgBox "✅ DANH MỤC TỪ VIẾT TẮT đã có trong tài liệu!" & Chr(13) & _
               "Vui lòng cập nhật mục lục thủ công nếu chưa hiện.", vbInformation
    Else
        MsgBox "⚠️ Chưa tìm thấy DANH MỤC TỪ VIẾT TẮT", vbExclamation
    End If
    
    MsgBox "✅ Hoàn tất! Lưu file: Ctrl+S", vbInformation
End Sub

Sub FixLineSpacing_AllBody()
    '===============================================
    ' Sửa giãn dòng 1.5 cho toàn bộ thân văn
    '===============================================
    Dim para As Paragraph
    Dim count As Integer
    count = 0
    
    For Each para In ActiveDocument.Paragraphs
        Dim styleName As String
        styleName = LCase(para.Style.NameLocal)
        
        ' Bỏ qua heading
        If InStr(styleName, "heading") = 0 And _
           InStr(styleName, "tiêu đề") = 0 And _
           InStr(styleName, "caption") = 0 Then
            
            With para.Format
                .LineSpacingRule = wdLineSpaceMultiple
                .LineSpacing = LinesToPoints(1.5)
                .SpaceBefore = 0
                .SpaceAfter = 6
            End With
            count = count + 1
        End If
    Next para
    
    MsgBox "✅ Đã sửa giãn dòng 1.5 cho " & count & " đoạn văn!", vbInformation
End Sub

Sub AddPageNumbers()
    '===============================================
    ' Thêm số trang ở dưới giữa
    '===============================================
    Dim sec As Section
    Dim ftr As HeaderFooter
    
    For Each sec In ActiveDocument.Sections
        Set ftr = sec.Footers(wdHeaderFooterPrimary)
        ftr.LinkToPrevious = False
        
        ' Xóa nội dung cũ
        ftr.Range.Delete
        
        ' Format
        With ftr.Range
            .ParagraphFormat.Alignment = wdAlignParagraphCenter
            .Font.Name = "Times New Roman"
            .Font.Size = 13
            .Font.Bold = False
        End With
        
        ' Thêm field số trang
        ftr.PageNumbers.Add PageNumberAlignment:=wdAlignPageNumberCenter, _
                            FirstPage:=True
    Next sec
    
    MsgBox "✅ Đã thêm số trang ở dưới giữa!", vbInformation
End Sub

Sub RunAll()
    '===============================================
    ' Chạy tất cả các fix một lúc
    '===============================================
    Call FixLineSpacing_AllBody
    Call AddPageNumbers
    Call UpdateTOC_And_FixAbbreviation
    
    ' Lưu file
    ActiveDocument.Save
    MsgBox "🎉 Hoàn tất tất cả! File đã được lưu.", vbInformation
End Sub
