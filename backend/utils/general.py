def str2bool(v):
    if v: return v.lower() in ("true", "1")
    return False