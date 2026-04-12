import sys

file_path = r'C:/Users/Nive/Desktop/New folder/src/components/Button.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Standardize colors
content = content.replace('#4B0082', 'var(--accent-purple)')
content = content.replace('#2E0854', 'color-mix(in srgb, var(--accent-purple), black 20%)')
content = content.replace('#D4AF37', 'var(--accent)')
content = content.replace('#B8962E', 'color-mix(in srgb, var(--accent), black 15%)')

# Ensure standard transitions by ensuring transition-all is used (which it is)
# but check for specific transition overrides.
# The global.css handles *, so removing transition-all from button might be cleaner, 
# but keeping it is safer for specificity.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

