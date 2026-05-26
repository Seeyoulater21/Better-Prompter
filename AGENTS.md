# Agent Instructions

## Required Reading Before Work

Before editing files or planning implementation, agents must read:

1. `AGENTS.md`
2. Karpathy Guidelines section in this file
3. `PRD.md`
4. `ARCHITECTURE.md`
5. `CONTEXT.md`
6. `docs/superpowers/specs/2026-05-26-better-prompter-design.md`
7. `docs/superpowers/plans/2026-05-26-better-prompter.md`
8. Current GitHub issue
9. Linked dependency issues and previous PRs

Do not rely on prior chat memory. Re-read project docs and current issue every time.

## Required Superpowers

Before implementation, use one of these workflows:

- `superpowers:subagent-driven-development` for issue-by-issue agent work.
- `superpowers:executing-plans` for inline execution of the approved implementation plan.

For bugs or unexpected behavior, use `superpowers:systematic-debugging` before changing code.

Before claiming work is complete, use `superpowers:verification-before-completion`.

## Karpathy Guidelines

Always follow these rules:

- Surface assumptions before coding.
- Prefer the simplest useful solution.
- Make surgical changes only.
- Do not add speculative features.
- Define verifiable success criteria before implementation.
- Verify before claiming done.

## Work Size And Process Fit

Before planning or editing, classify work:

- `tiny`: one obvious fix or small workflow change, low blast radius, no risky trigger.
- `small`: limited feature across a few files, normal tests/manual QA enough.
- `risky`: trading/money execution, data loss, auth, secrets, production/shared deployment, paid AI/API cost, schema migration, new host-app integration, risky file/media processing, or performance-sensitive paths.

Use the lightest process that fits risk. Tiny work should use a lightweight path such as `light-issue-implementer` or direct Karpathy-guided edits. Risky work should use full issue/branch/PR orchestration, stronger review, and explicit manual QA.

Do not create docs, issues, branches, abstractions, or review ceremony larger than the change itself.

## Project Risk Classification

Better Prompter is `risky small`.

Risk reasons:

- Script text loss would hurt real recording work.
- Browser multi-screen behavior depends on Brave, macOS, permissions, and Elgato display mode.
- Preview/output drift would make the app unreliable.

## Cross-Issue Handoff

Agents must not rely on memory from previous chats.

Before starting an issue:

1. Read this file, `PRD.md`, `ARCHITECTURE.md`, and `CONTEXT.md`.
2. Read the current GitHub issue.
3. Read linked dependency issues and previous PRs listed in the issue body.
4. If the issue depends on behavior from a previous PR, inspect merged code, not only the PR summary.
5. If dependency context is missing or ambiguous, stop and ask.

Each PR must include `Handoff to next issue` when it creates behavior, contracts, limitations, or follow-up work that later issues need.

## Implementation Boundaries

- Build the MVP from `docs/superpowers/plans/2026-05-26-better-prompter.md`.
- Keep the app client-only unless an approved issue changes that.
- Target Brave on macOS first.
- Keep the UI black and utilitarian.
- Do not add instructional text, tutorial overlays, or tooltips in MVP.
- Use the shared teleprompter renderer for both Teleprompt View and Prompter Output.
- Preserve script text across refresh, tab close, browser close, and app relaunch.
- Keep JSON import/export compatible with the project schema in the design spec.
- Keep launcher bash 3.2-compatible.

## Verification Baseline

Before opening a PR or claiming done:

- Run `npm test` when dependencies exist.
- Run `npm run build` when dependencies exist.
- Run `bash -n "Better Prompter.command"` after launcher changes.
- Manually verify Brave behavior for user-facing issues.

If a command cannot run because setup is not complete yet, state that clearly in the PR and handoff.
