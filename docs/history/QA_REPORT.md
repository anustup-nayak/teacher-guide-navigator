# QA–QC execution report

30 October 2026 · release candidate after version 14 audit.

The two main routes now converge on summary cards with one direct link to the full lesson. Topic selection plus card selection takes two taps, after choosing class. Week selection shows six named day cards. Teaching instructions render immediately; preparation is an optional disclosure and cannot reset teaching position.

Verified in browser at 360/390/768px: Hindi/English UI, topic/day cards, actual I do/We do/You do content, preparation, section selector, workbook reader, correct original PDF page labels, reader zoom and return, review weeks 13/20, search, saved lessons, notes, completion/reload/undo, continuation and missing-link recovery. Existing skip-link defect repaired and keyboard activation retains lesson. English narrow-screen search overflow found and repaired. No app-origin runtime errors captured.

21 regression checks cover all 366 identities/mappings, grade boundaries, six source stages, source LO definitions, missing data rejection, persistence/escaping, stale-note merges, worksheet header matching, real practice support, threshold/encoding defects, all reader assets, template status and offline-cache success/failure/network-loss behavior. All 990 WebP originals decoded successfully. Text contrast checked for six principal semantic pairs, each above 4.5:1; no full accessibility certification is claimed.

Content: 159 direct lesson plans have matching original worksheets; the 24 early Grade 2/3 direct plans without supplied worksheets use explicitly adapted practice from their guide activities. In total 318 day plans have matching worksheets. Eight daily image-only records and 12 weekly records have source-compared replacements for badly recovered text. All known 0%→70% corruption instances repaired against source pages. Original resources remain the fidelity reference. A complete independent academic review has not occurred.

Limits: Grade 1/2 textbook PDFs exceed the connected-file fetch size limit, so references use the printed books rather than a broken login handoff. All three guides/workbooks and Grade 3 textbook are in-app. No physical-device, teacher field study, screen-reader speech, physical printer or actual airplane-mode phone run was performed. Offline UI must be smoke-tested on the HTTPS publication; the HTTP internal preview correctly gives an unsupported-state message.

Release outcome and deployed link are recorded in the final handoff. No claim that the site is error-free in every possible environment or that the complete corpus has academic sign-off.
