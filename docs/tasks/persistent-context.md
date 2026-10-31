# Prominent, persistent curriculum context

User wants selected grade/subject bold and current location always at top.
Plan: compact sticky identity/location bar; responsive selectors remain editable;
combine context and section-nav measurements for anchors; remove duplicated sticky
lesson context; verify all routes, sections, locales and narrow/large-text layouts.
One agent, no Git metadata in transfer. Existing content/keys remain untouched.

Result: local r56 has bold selected grade/subject in a compact pinned identity
bar, active screen/week/day/section location, clickable identity for changing the
selection, and no duplicated sticky lesson row. Combined header/chip measurements
keep section headings and keyboard focus clear. My list/offline collections are
scoped to the selected grade without deleting other records. Topic location tracks
opening/closing; a newly observed pending-navigation/old-scroll race is guarded.

Verified: 69 Node tests, syntax and prior-publication/config/page preservation;
4 ingestion and 4 skill-helper tests passed during this change. Browser checks:
Find/week/topic, My list, Help, grade changes, active lesson/Notes sections,
identity shortcut, Hindi/English, 320/390px, 200% instruction text, sticky bar at
viewport y=0 and headings below chips. Global and context return-to-list paths
passed after the race fix. No captured current-session console errors. Normal
reading size, Hindi and viewport restored; existing content/data identities intact.
PRD/architecture/skill design guidance now record the persistent-context contract.
