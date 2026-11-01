# Branches, versions and releases

Adopted 31 October 2026 (Phase 0 of the [content architecture plan](CONTENT_ARCHITECTURE_PLAN.md)).
The v2 cutover completed on 1 November 2026; preserve the frozen v1 fallback.

## Branches

| Branch | Purpose | Deploys |
|---|---|---|
| `main` | Production (v2 after the owner-approved cutover) | GitHub Pages site root (`pages.yml`, `main` only) |
| `release/v1` | Frozen v1.0.4 rollback line | `/v1/`, staged from immutable tag `v1.0.4` |
| `next` | v2 integration: content model, compiler, app v2 | Integration only; optional separate preview (see below) |
| `task/<name>` | One task per agent, in its own worktree | Nothing |

**Normal production work:** `task/*` from `next` → reviewed PR to `next` → reviewed release PR from `next` to `main`. Run the full gate and verify the actual Pages deployment. The original cutover is approved and complete; future changes still respect content and protected-design approvals.

**Frozen v1:** do not advance `release/v1` or move tag `v1.0.4` to a v2 commit. Any separately authorized legacy maintenance needs its own plan; the old pre-cutover practice of mirroring `main` no longer applies.

**Keep `next` current:** merge or fast-forward `main` into `next` after production-only release records or fixes, preserving concurrent work. Documentation-only release corrections may go by reviewed PR directly to `main`, then synchronize `next`; app/content changes use the normal integration path. Resolve conflicts on an isolated branch; never force-push shared branches.

## Tags

- `v1.0.0` = `main` @ `5ae263b`, release r57 (UP Math + Hindi, Grades 1–3), live on 31 Oct 2026.
- v1 patches: `v1.0.1`, `v1.0.2` … (each still bumps the rNN release with `npm run release:assets`).
- `v1.0.1` = `main` @ `181a840`, release r58 (source repair of Hindi `g2-hindi-w19-d03`).
- `v1.0.2` = `main` @ `cb6075b`, release r59 (Hindi grid crops on the step printed in the same column).
- `v1.0.3` = `main` @ `4be3376`, release r60 (restored quoted vowel signs in 13 Hindi lessons).
- `v1.0.4` = `main` @ `49f873c`, release r61 (lesson links find their subject from the lesson id).
- `v2.1.0` = `main` @ `9259ec8`, release r70 (design system v2, journey fixes; content 1.3.3 unchanged), 1 Nov 2026.
- v2 previews: `v2.0.0-alpha.N`; release candidates `v2.0.0-rc.N`; cutover `v2.0.0`.
- `v2.0.0` identifies the owner-approved v2 cutover, release r69, content 1.3.3 (owner, 1 Nov 2026: “Publish … make it clean production ready”). Tag `v2.0.0` points to verified cutover commit `edd31db543ef9eceee39e97f69d5bd3f7cc6bbda`. The Pages artifact stages frozen `v1.0.4` at `/v1/`; rollback is by reverting the cutover merge.

Rollback at any time: revert the offending merge on `main` by PR (Pages redeploys the
previous build). No data migration is needed because every version keeps the v1 lesson IDs
and storage keys.

## Checks

`check.yml` runs on every push and pull request, on all branches. `next` must also pass the
model, compiler, site and parity gates. A PR into `main` must pass the full current gate in `DEVELOPMENT.md` and `AGENTS.md`.

## Optional preview site (not configured)

The following is the original separate-preview proposal, not an existing deployed site. A separate origin would isolate preview service workers and browser storage from production. The proposal uses a free GitHub organisation owned by the project owner, with a user-site repository
`<org>.github.io`. Its only content is a Pages workflow that checks out the public `next`
branch of `anustup-nayak/teacher-guide-navigator` and publishes its build, on a schedule and
on manual dispatch. No tokens or secrets. The template workflow lives in
[`docs/preview/pages-preview.yml`](preview/pages-preview.yml).

## Teacher-data contract (all versions)

- Lesson IDs (`g1-math-w09-d01`, `g1-hindi-w09-d02` …) and storage namespaces
  (`up-sandarshika-2026-v1`, `up-hindi-sandarshika-2026-v1`) never change.
- New versions only add fields; they never clear, rename or reshape existing keys.
- Every release that touches storage replays recorded v1 storage snapshots in tests.

## Cutover record (completed with owner approval)

1. Tag the last v1 release; `release/v1` stays at it.
2. Merge `next` into `main` by PR; the Pages workflow publishes v2 at the root and the v1
   build from immutable tag `v1.0.4` (the frozen `release/v1` state) at `/v1/`.
3. Keep `/v1/` and the rollback path for at least one school term.
