#!/usr/bin/env python3
"""Basic consistency checks for SERRALE mobile UI tokens and core copy."""

from __future__ import annotations

import sys
from pathlib import Path

REQUIRED_COLOR_TOKENS = {
    "primary": "#2563EB",
    "primaryDark": "#0B2A5B",
    "primaryLight": "#EAF2FF",
    "background": "#F8FBFF",
    "surface": "#FFFFFF",
    "surfaceSoft": "#F3F7FF",
    "text": "#0B1F3A",
    "textMuted": "#64748B",
    "border": "#E2E8F0",
}

REQUIRED_HOME_COPY = [
    "Find trusted experts for your next project",
    "Search services or experts...",
    "Talents. Skills. Community.",
    "Post a Project",
]


def read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(str(path))
    return path.read_text(encoding="utf-8")


def validate_colors(repo_root: Path) -> list[str]:
    issues: list[str] = []
    colors_file = repo_root / "packages" / "ui" / "src" / "theme" / "colors.ts"
    content = read_text(colors_file)

    for key, value in REQUIRED_COLOR_TOKENS.items():
        marker = f'{key}: "{value}"'
        if marker not in content:
            issues.append(f"Missing or changed color token: {marker}")

    return issues


def validate_home_copy(repo_root: Path) -> list[str]:
    issues: list[str] = []
    source_paths = [
        repo_root / "apps" / "client-app" / "src" / "screens" / "ClientHomeScreen.tsx",
        repo_root / "apps" / "client-app" / "src" / "components" / "SearchFilterBar.tsx",
        repo_root / "apps" / "client-app" / "src" / "components" / "CommunityHeroBanner.tsx",
        repo_root / "apps" / "client-app" / "src" / "components" / "PostProjectCTA.tsx",
    ]
    content = "\n".join(read_text(path) for path in source_paths if path.exists())

    for copy in REQUIRED_HOME_COPY:
        if copy not in content:
            issues.append(f'Missing required client home copy: "{copy}"')

    return issues


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    issues = validate_colors(root) + validate_home_copy(root)

    if issues:
        print("SERRALE design consistency check failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("SERRALE design consistency check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
