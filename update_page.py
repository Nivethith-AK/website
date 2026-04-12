import sys

file_path = r'C:/Users/Nive/Desktop/New folder/src/app/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the CTA buttons which don't use the Button component
content = content.replace('bg-accent text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-105 active:scale-95 transition-all', 'bg-accent text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.02] active:scale-95 transition-all')

# Change h1 text-7xl md:text-[140px] to be more responsive
content = content.replace('text-7xl md:text-[140px]', 'text-5xl md:text-8xl lg:text-[140px]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

