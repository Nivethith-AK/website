import sys

file_path = r'C:/Users/Nive/Desktop/New folder/src/app/globals.css'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix h1 mobile font size and line height
content = content.replace('font-size: clamp(2.5rem, 8vw, 4rem) !important;', 'font-size: clamp(2.5rem, 8vw, 4.5rem) !important;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

