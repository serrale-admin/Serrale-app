---
name: serrale-design-guidelines
description: Enforce SERRALE mobile design consistency across React Native and Expo interfaces. Use when creating or reviewing client/provider app screens, shared UI components, copy, spacing, color usage, navigation patterns, and interaction hierarchy so the product remains premium, trustworthy, and role-correct.
---

# SERRALE Design Guidelines

## Overview

Use this skill to keep interface work aligned with SERRALE's visual identity, copy tone, and role-based UX boundaries. Apply it before building new UI and when reviewing existing screens for design drift.

## Workflow

1. Read `references/client-home-guideline.md` when implementing client-facing surfaces.
2. Use shared tokens from `packages/ui/src/theme` before introducing new colors or spacing values.
3. Prefer shared components in `packages/ui` and extend them only when necessary.
4. Run `scripts/check_theme_consistency.py <repo-root>` after major UI edits.
5. Reject provider-oriented language and workflows from client screens.

## Core Rules

### Brand and visual direction
- Keep base surfaces light (`background`, `surface`, `surfaceSoft`) with navy text hierarchy.
- Use `colors.primary` for primary actions only; avoid turning every element into primary blue.
- Keep cards soft and polished: low-radius (<= 10), thin borders, subtle depth.
- Apply glass-inspired layering principles (soft translucency feel, grouped elevation, calm contrast) without overusing blur effects.

### Copy and tone
- Client app voice: trustworthy, warm, premium, action-oriented.
- Use direct hiring language:
  - "Find trusted experts for your next project"
  - "Post a Project"
- Avoid provider workflow language on client surfaces (`jobs`, `earnings`, `proposals sent` metrics).

### Role separation
- Client app surfaces must focus on:
  - Service discovery
  - Provider trust signals
  - Project posting and tracking
- Provider app concerns stay out of client home and auth flows.

### Navigation and hierarchy
- Client bottom nav order must remain: `Home`, `Categories`, `Post`, `Messages`, `Profile`.
- Keep `Post` as the center-priority action.
- Home screen order must remain:
  - Header
  - Greeting
  - Search + filter
  - Community hero banner
  - Popular categories
  - Recommended providers
  - Your projects
  - Post-project CTA

## Implementation Checklist

- Confirm screen goal and user role before designing layout.
- Reuse `packages/ui` tokens/components first.
- Check text fits on compact mobile widths.
- Ensure every primary button has one clear next action.
- Validate role-gating copy for wrong-app handling.
- Run the consistency script before finalizing.

## References

- Client direction: `references/client-home-guideline.md`
- Checker: `scripts/check_theme_consistency.py`
