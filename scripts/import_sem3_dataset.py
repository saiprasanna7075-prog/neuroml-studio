import os
import shutil
import pandas as pd

source_dir = r"C:\Users\saipr\Downloads\SEM-3(PROJECTS)\AIML\wine+quality"
target_dir = r"data"

os.makedirs(target_dir, exist_ok=True)

# 1. Process Red Wine
red_src = os.path.join(source_dir, "winequality-red.csv")
red_dst = os.path.join(target_dir, "winequality-red.csv")

with open(red_src, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

# Clean header if it has malformed quotes
lines[0] = '"fixed acidity";"volatile acidity";"citric acid";"residual sugar";"chlorides";"free sulfur dioxide";"total sulfur dioxide";"density";"pH";"sulphates";"alcohol";"quality"\n'

with open(red_dst, "w", encoding="utf-8") as f:
    f.writelines(lines)

df_red = pd.read_csv(red_dst, sep=";")
print(f"[SUCCESS] Red Wine Dataset loaded: {df_red.shape} (1599 samples, 12 features)")

# 2. Process White Wine
white_src = os.path.join(source_dir, "winequality-white.csv")
white_dst = os.path.join(target_dir, "winequality-white.csv")
shutil.copy(white_src, white_dst)

df_white = pd.read_csv(white_dst, sep=";")
print(f"[SUCCESS] White Wine Dataset loaded: {df_white.shape} (4898 samples, 12 features)")

# 3. Create Combined Wine Dataset
df_comb = pd.concat([df_white, df_red], ignore_index=True)
comb_dst = os.path.join(target_dir, "winequality-combined.csv")
df_comb.to_csv(comb_dst, sep=";", index=False)
print(f"[SUCCESS] Combined Wine Dataset created: {df_comb.shape} (6497 samples, 12 features)")
