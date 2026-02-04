---
active: true
iteration: 1
max_iterations: 40
completion_promise: "ALL 7 STEPS COMPLETE"
started_at: "2026-02-03T19:10:23Z"
---

Read spec.md and implementation_plan.md. Determine which step is the next incomplete one by checking which files from the plan already exist. Create any missing directories first. Build that step fully, creating or modifying every file listed for it. After writing all files for the step, run npm run build. If there are TypeScript errors, fix them. Do not move to the next step until the build is clean. Once the current step compiles, move to the next step. Repeat until all 7 steps compile cleanly. Remember: verbatimModuleSyntax is on so use import type for type-only imports. noUnusedLocals and noUnusedParameters are on so zero unused vars. React Router v7 uses layout routes, see the pattern in implementation_plan.md. Output the promise tag ALL 7 STEPS COMPLETE only when every step is written and the build passes with zero errors.
