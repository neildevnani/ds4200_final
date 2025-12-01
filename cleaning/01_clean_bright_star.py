import pandas as pd
import numpy as np

# load raw data
raw_path = "data/bright_star_raw.txt"

# HEASARC "Excel-compatible" output is actually pipe-separated text
df = pd.read_csv(raw_path, sep="|", skiprows=2)

print("Raw shape:", df.shape)

# tidy column names and drop junk columns
df.columns = df.columns.str.strip()               # remove spaces
junk_cols = [c for c in df.columns if c.startswith("Unnamed")]
df = df.drop(columns=junk_cols)

print("After dropping junk cols:", df.shape)
print("Columns:", df.columns.tolist()[:15])

# keep only rows that look like real stars (have RA, Dec, Vmag)
essential = ["name", "ra", "dec", "vmag"]
df = df.dropna(subset=essential)

# convert numeric columns (leave string-like ones alone)
string_cols = [
    "name", "alt_name", "ra", "dec", "class", "m_id", "note",
    "par_code", "radvel_comm", "spect_code", "spect_type",
    "var_id", "vmag_code"
]
numeric_cols = [c for c in df.columns if c not in string_cols]

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# convert sexagesimal RA/Dec into degrees
def ra_to_deg(s):
    try:
        h, m, sec = map(float, str(s).split())
        return (h + m/60.0 + sec/3600.0) * 15.0
    except Exception:
        return np.nan

def dec_to_deg(s):
    try:
        parts = str(s).split()
        d = float(parts[0])
        m = float(parts[1])
        sec = float(parts[2])
        sign = -1.0 if d < 0 else 1.0
        d = abs(d)
        return sign * (d + m/60.0 + sec/3600.0)
    except Exception:
        return np.nan

df["ra_deg"] = df["ra"].apply(ra_to_deg)
df["dec_deg"] = df["dec"].apply(dec_to_deg)

# keep rows with valid positions and parallax
if "parallax" in df.columns:
    df = df[df["parallax"] > 0]
df = df.dropna(subset=["ra_deg", "dec_deg", "vmag"])

# add distance & 3D coordinates
if "parallax" in df.columns:
    df["distance_pc"] = 1000.0 / df["parallax"]
    df["distance_ly"] = df["distance_pc"] * 3.26156

    df["ra_rad"] = np.radians(df["ra_deg"])
    df["dec_rad"] = np.radians(df["dec_deg"])

    df["x"] = df["distance_pc"] * np.cos(df["dec_rad"]) * np.cos(df["ra_rad"])
    df["y"] = df["distance_pc"] * np.cos(df["dec_rad"]) * np.sin(df["ra_rad"])
    df["z"] = df["distance_pc"] * np.sin(df["dec_rad"])

# brightness and spectral classes
df["brightness_class"] = pd.cut(
    df["vmag"],
    bins=[-10, 2, 4, 6, 8, 20],
    labels=["Very bright", "Bright", "Moderate", "Faint", "Very faint"]
)
if "spect_type" in df.columns:
    df["spectral_main"] = df["spect_type"].astype(str).str.strip().str[0]

print("Cleaned shape:", df.shape)

# downsample for web visualizations
df_sample = df.sample(min(10000, len(df)), random_state=42)

# save to CSV
out_path = "data/bright_star_clean.csv"
df_sample.to_csv(out_path, index=False)

print("Saved cleaned sample to", out_path)