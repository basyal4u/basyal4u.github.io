#!/usr/bin/env python3
"""Create the captioned 75-second AI Lab quick-start video."""
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "video" / "ai-lab-quick-start.mp4"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SLIDES = [
    ("WELCOME TO BADM-201", "AI Lab Quick Start", "Explore. Change one variable.\nRecord evidence. Explain what changed."),
    ("STEP 1", "Choose an exercise", "Start with one of six graded labs.\nOpen Learn before touching the controls."),
    ("STEP 2", "Understand the idea", "Read the intuition and the math.\nKnow what the model is supposed to demonstrate."),
    ("STEP 3", "Change one variable", "Move a slider or choose a new setting.\nKeep other settings stable for a fair comparison."),
    ("STEP 4", "Run more than once", "A single result is not evidence.\nComplete the required sequence in the Assignment tab."),
    ("STEP 5", "Capture your work", "Record each run in the experiment notebook.\nDownload the evidence CSV and take supporting screenshots."),
    ("STEP 6", "Check before D2L", "Upload your draft to the Readiness Checker.\nUse the feedback to find missing rubric evidence."),
    ("FINAL REMINDER", "The report shows your thinking", "Use AI to explore only as allowed.\nYour evidence, explanation, and reflection must be your own."),
]


def escape(value):
    return value.replace("\\", r"\\").replace(":", r"\:").replace("'", r"\'").replace("%", r"\%")


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        segments = []
        for idx, (kicker, title, body) in enumerate(SLIDES, 1):
            seg = tmp_path / f"{idx:02d}.mp4"
            filters = ",".join([
                "format=yuv420p",
                "drawbox=x=70:y=70:w=1140:h=580:color=0x0d2949@0.94:t=fill",
                "drawbox=x=70:y=70:w=14:h=580:color=0x4c8df6:t=fill",
                f"drawtext=fontfile={FONT_BOLD}:text='{escape(kicker)}':fontcolor=0x72a7ff:fontsize=25:x=125:y=125",
                f"drawtext=fontfile={FONT_BOLD}:text='{escape(title)}':fontcolor=white:fontsize=58:x=125:y=205",
                f"drawtext=fontfile={FONT_REG}:text='{escape(body)}':fontcolor=0xdbeafe:fontsize=32:line_spacing=18:x=128:y=330",
                f"drawtext=fontfile={FONT_BOLD}:text='{idx} / {len(SLIDES)}':fontcolor=0x9fb9d7:fontsize=22:x=1080:y=590",
                f"drawbox=x=125:y=585:w={int(820*idx/len(SLIDES))}:h=8:color=0x4c8df6:t=fill",
                "fade=t=in:st=0:d=0.45,fade=t=out:st=8.55:d=0.45",
            ])
            subprocess.run([
                "ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
                "color=c=0x071b33:s=1280x720:r=24:d=9", "-vf", filters,
                "-an", "-c:v", "libx264", "-crf", "25", "-preset", "veryfast", str(seg)
            ], check=True)
            segments.append(seg)
        concat = tmp_path / "concat.txt"
        concat.write_text("\n".join(f"file '{p}'" for p in segments), encoding="utf-8")
        subprocess.run([
            "ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
            "-c", "copy", "-movflags", "+faststart", str(OUT)
        ], check=True)
    print(OUT)


if __name__ == "__main__":
    main()
