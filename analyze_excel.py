import pandas as pd
import sys

file_path = r'd:\ViralWindow_Phan_Mem_Nhom_Kinh\Tài liệu\CT-Mr Mậu Yên Nghĩa.xlsx'

try:
    # Read all sheets
    xlsx = pd.ExcelFile(file_path, engine='openpyxl')
    print(f"File: {file_path}")
    print(f"Number of sheets: {len(xlsx.sheet_names)}")
    print(f"Sheet names: {xlsx.sheet_names}")
    print("=" * 80)
    
    for sheet_name in xlsx.sheet_names:
        df = pd.read_excel(xlsx, sheet_name=sheet_name, header=None)
        print(f"\n{'=' * 80}")
        print(f"SHEET: {sheet_name}")
        print(f"Dimensions: {df.shape[0]} rows x {df.shape[1]} columns")
        print("=" * 80)
        
        # Print first 80 rows
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', None)
        pd.set_option('display.max_colwidth', 50)
        print(df.head(80).to_string())
        print("\n")
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
