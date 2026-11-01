# Branches, versions and releases

Adopted 31 October 2026 (Phase 0 of the [content architecture plan](CONTENT_ARCHITECTURE_PLAN.md)).
The live app (v1) must keep working while v2 is built.

## Branches

| Branch | Purpose | Deploys |
|---|---|---|
| `main` | Production (v2 after the owner-approved cutover) | GitHub Pages site root (`pages.yml`, `main` only) |
| `release/v1` | Frozen v1.0.4 rollback line | `/v1/`, staged from immutable tag `v1.0.4` |
| `next` | v2 integration: content model, compiler, app v2 | Preview site only (see below) |
| `task/<name>` | One task per agent, in its own worktree | Nothing |

**v1 changes** (fixes, content repairs): `task/*` from `main` → PR to `main` → after merge,
fast-forward `release/v1` to `main`, tag `v1.0.N`, then merge `main` into `next`.

**v2 work**: `task/*` from `next` → PR to `next`. Never merge `next` into `main` before the
cutover is approved by the owner.

**Keep `next` current**: merge `main` into `next` after every v1 release. Resolve conflicts on
`next`, never on `main`.

## Tags

- `v1.0.0` = `main` @ `5ae263b`, release r57 (UP Math + Hindi, Grades 1–3), live on 31 Oct 2026.
- v1 patches: `v1.0.1`, `v1.0.2` … (each still bumps the rNN release with `npm run release:assets`).
- `v1.0.1` = `main` @ `181a840`, release r58 (source repair of Hindi `g2-hindi-w19-d03`).
- `v1.0.2` = `main` @ `cb6075b`, release r59 (Hindi grid crops on the step printed in the same column).
- `v1.0.3` = `main` @ `4be3376`, release r60 (restored quoted vowel signs in 13 Hindi lessons).
- `v1.0.4` = `main` @ `49f873c`, release r61 (lesson links find their subject from the lesson id).
- v2 previews: `v2.0.0-alpha.N`; release candidates `v2.0.0-rc.N`; cutover `v2.0.0`.
- `v2.0.0` identifies the owner-approved v2 cutover, release r69, content 1.3.3 (owner, 1 Nov 2026: “Publish … make it clean production ready”). Tag the verified cutover commit after deployment. The Pages artifact stages frozen `v1.0.4` at `/v1/`; rollback is by reverting the cutover merge.

Rollback at any time: revert the offending merge on `main` by PR (Pages redeploys the
previous build). No data migration is needed because every version keeps the v1 lesson IDs
and storage keys.

## Checks

`check.yml` runs on every push and pull request, on all branches. `next` must also pass the
new model, compiler and parity gates as Phase 3 adds them. A PR into `main` must pass the
full v1 gate described in `AGENTS.md`.

## Preview site (v2)

A separate origin so v2 can never share the live app's offline worker or browser storage:
a free GitHub organisation owned by the project owner, with a user-site repository
`<org>.github.io`. Its only content is a Pages workflow that checks out the public `next`
branch of `anustup-nayak/teacher-guide-navigator` and publishes its build, on a schedule and
on manual dispatch. No tokens or secrets. The template workflow lives in
[`docs/preview/pages-preview.yml`](preview/pages-preview.yml).

## Teacher-data contract (all versions)

- Lesson IDs (`g1-math-w09-d01`, `g1-hindi-w09-d02` …) and storage namespaces
  (`up-sandarshika-2026-v1`, `up-hindi-sandarshika-2026-v1`) never change.
- New versions only add fields; they never clear, rename or reshape existing keys.
- Every release that touches storage replays recorded v1 storage snapshots in tests.

## Cutover (Phase 9, owner approval required)

1. Tag the last v1 release; `release/v1` stays at it.
2. Merge `next` into `main` by PR; the Pages workflow publishes v2 at the root and the v1
   build from immutable tag `v1.0.4` (the frozen `release/v1` state) at `/v1/`.
3. Keep `/v1/` and the rollback path for at least one school term.
