# Historical UP Math pipeline

These adapters were moved from scripts/ when source-family tooling was isolated.
They retain their original historical I/O behavior and may overwrite dist/ files.
They are forensic reference, not normal ingestion/build entrypoints. Do not run
them on originals or production. Run from the repository root only in an explicit
isolated reproduction workspace after inspecting paths and source versions.

Reusable font conversion lives in scripts/ingestion/legacy_fonts.py. New sources
use staged pack tools, whole-program metadata and canonical model authoring; see
docs/REPOSITORY_LAYOUT.md, docs/PROGRAM_METADATA.md and the core skill.
