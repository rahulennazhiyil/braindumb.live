# CLAUDE.md — rahul-dev

Context for Claude Code sessions on this repo.

## Stack

- Nx 22.6.5 monorepo
- Angular 21.2.x with SSR (standalone components, zoneless-ready)
- Tailwind CSS 3.x
- TypeScript 5.9 (path-alias linking — Angular does NOT support TS project references)
- vitest-angular for unit tests (uses @angular/build:unit-test executor)
- Playwright for e2e
- ESLint flat config (@angular-eslint)
- Prettier (singleQuote: true)

Target hosting: Vercel. Backend: Supabase (added Phase 6).

## Workspace layout

- apps/web — Angular SSR app (port 4200 dev, prerender at build)
- apps/web-e2e — Playwright e2e
- libs/ — populated in Phase 2: core/*, shared/*, features/*

## Non-negotiable rules for Phase 2+ library generation

Every @nx/angular:lib invocation MUST use ALL of these flags:

    --buildable=true
    --unitTestRunner=vitest-angular
    --style=css
    --standalone=true
    --prefix=app
    --no-interactive

Reasons:
- vitest-angular schema REQUIRES buildable (or publishable) libs — audited.
  Non-buildable libs fail schema validation in Nx 22.6.5.
- Buildable emits ng-package.json, which is the standard Angular library
  shape and what Phase 6's Supabase lib + Phase 10's D3 libs depend on.
- standalone=true matches the app architecture.

After EVERY lib generator call, run:

    git diff tsconfig.base.json

and reject the generator's changes if any of these keys were re-introduced:
composite, emitDeclarationOnly, declarationMap, customConditions,
"module": "nodenext", "moduleResolution": "nodenext", top-level "references"
array. Path aliases being added to compilerOptions.paths is EXPECTED and OK.

If a re-introduction happens, revert tsconfig.base.json with:

    git checkout tsconfig.base.json

and either re-apply the path alias manually, or raise it as a blocker.

## TypeScript setup — what NOT to touch

tsconfig.base.json was manually rewritten to strip the TS-project-references
config that Nx 22's `--preset=apps` injects. DO NOT add any of these keys
back: composite, emitDeclarationOnly, declarationMap, customConditions,
"module": "nodenext", top-level "references". Angular's compiler rejects
them outright.

If you see an error "generator doesn't yet support the existing TypeScript
setup", the fix is NOT to set NX_IGNORE_UNSUPPORTED_TS_SETUP=true (that's
obsolete here). The fix is to re-verify tsconfig.base.json is clean.

## Scaffolding notes

- apps/web/src/app/ uses Angular 21's new convention: app.ts / app.html /
  app.css (no .component. suffix). Spec is app.spec.ts. All imports and
  paths follow this.
- SSR entry is apps/web/src/server.ts using @angular/ssr/node + Express.
- Prerender runs at build time (outputMode: "server" in project.json).
- Static hosts (Vercel) serve dist/apps/web/browser/index.html directly.

## Known quirks

- Nx Cloud config (nxCloudId) was written despite --nxCloud=skip. Harmless,
  not connected. Leave alone.
- apps/web/tsconfig.json uses solution-style references to tsconfig.app.json
  and tsconfig.spec.json. Harmless without composite:true. Do not touch.

## Typecheck target — app-specific override

`apps/web/project.json` defines an explicit `typecheck` target that shadows
the @nx/js/typescript plugin's inferred target. Required because:

- The plugin runs `tsc --build --emitDeclarationOnly`, which requires
  `composite: true` in every referenced tsconfig.
- Angular's `@angular/build:application` executor rejects `composite: true`
  and `emitDeclarationOnly` in any tsconfig it inherits from.
- Those two requirements are structurally incompatible for the app.

The override uses `tsc --noEmit` against both `tsconfig.app.json` and
`tsconfig.spec.json`. Do not delete this target. Do not remove its
`commands` array entries. If you see a typecheck failure referencing
`--emitDeclarationOnly`, the override was clobbered — restore it.

Libs are buildable with `ng-package.json` and use the plugin's inferred
typecheck target as-is (no conflict there). Do not add a `typecheck`
override to any lib's project.json unless that specific lib hits the same
compiler conflict.
