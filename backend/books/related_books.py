import re


def standardize_title(title: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', title).lower()