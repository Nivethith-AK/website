import sys

file_path = r'C:/Users/Nive/Desktop/New folder/src/app/globals.css'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix h1 mobile font size and line height
content = content.replace('font-size: clamp(2.5rem, 8vw, 4rem) !important;', 'font-size: clamp(2rem, 10vw, 6rem) !important;')
content = content.replace('line-height: 0.9 !important;', 'line-height: 0.8 !important;')

# Fix text-7xl and text-8xl mobile overrides
content = content.replace('.text-7xl {\n    font-size: 3.5rem !important;\n  }', '.text-7xl {\n    font-size: 3rem !important;\n    line-height: 0.9 !important;\n  }')
content = content.replace('.text-8xl {\n    font-size: 4rem !important;\n  }', '.text-8xl {\n    font-size: 3.5rem !important;\n    line-height: 0.9 !important;\n  }')

# Set standard transition
content = content.replace('transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),', 'transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),\n              outline 0.4s cubic-bezier(0.16, 1, 0.3, 1),')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

