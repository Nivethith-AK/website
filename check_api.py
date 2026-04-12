import sys

file_path = r'C:/Users/Nive/Desktop/New folder/src/lib/api.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Just ensure API_URL is handled better, but it's already using NEXT_PUBLIC_API_URL.
# I will check if any placeholders like 'API_KEY' are in the project.

