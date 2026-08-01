// Flat ESLint config (ESLint 9+), shared across all workspace packages.
// Per docs/contributing.md: strong typing everywhere, no unused code, no magic values left unexplained.
//
// Structure, deliberately: type-aware linting (anything requiring the
// TypeScript type checker — projectService, *TypeChecked rule sets, and
// any custom rule that needs type info, like restrict-template-expressions)
// lives in exactly ONE block, scoped to application TS/TSX source via
// `files` + `extends` together. JS tooling/config files get a SEPARATE
// block with only non-type-aware rule sets. These two blocks are not
// meant to overlap — a rule that needs type information has no business
// running on a file with no type information to check.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import vitestPlugin from "@vitest/eslint-plugin";

const JS_CONFIG_FILES = ["eslint.config.js", "**/eslint.config.js", "**/*.config.js", "**/*.config.mjs"];

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/.turbo/**", "**/node_modules/**", "**/coverage/**", "**/drizzle/**"],
  },
  js.configs.recommended,

  {
    // The ONLY block in this file that enables type-aware linting.
    // `files` + `extends` together (rather than spreading
    // `tseslint.configs.strictTypeChecked` at the top level, unscoped) is
    // what actually scopes every rule in these presets — including
    // type-aware rules like `@typescript-eslint/await-thenable` — to this
    // file pattern. A top-level spread has no `files` of its own; it
    // would apply everywhere regardless of what `parserOptions` a
    // different block sets elsewhere, which is exactly what caused
    // `await-thenable` to run (and throw, for lack of type information)
    // against eslint.config.js even after that file stopped requesting
    // `projectService`. Every file matched here is guaranteed to live
    // inside one of the project's tsconfig `include` arrays, so
    // `projectService` can always resolve a project for it.
    files: ["**/*.ts", "**/*.tsx"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // No magic numbers outside a small, obvious allowlist — forces named constants.
      "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          // Numeric literal unions used as TYPES (e.g. `err.httpStatus as
          // 400 | 401 | 403 | ...`) are a distinct case from runtime magic
          // numbers: the closed literal union itself is what documents and
          // constrains the valid values — TypeScript enforces it structurally,
          // a named constant would add nothing. Matches this rule's own
          // documented example (`type SmallPrimes = 2 | 3 | 5 | 7 | 11`).
          ignoreNumericLiteralTypes: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      // Numbers are intentionally allowed in template literals project-wide
      // — validation messages routinely interpolate a named min/max-length
      // constant (e.g. `Must be at least ${PASSWORD_MIN_LENGTH} characters`),
      // and numbers stringify predictably, unlike objects/booleans/etc.
      // (which is what this rule exists to guard against). Wrapping every
      // such interpolation in String() would hurt exactly the readability
      // named constants are meant to protect, for no real safety gain.
      // NOTE: this rule is itself type-aware (it inspects the type of each
      // interpolated expression) — it belongs only in this block, never in
      // the JS-config-files block below.
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "import/no-cycle": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/modules/*/repositories/*"],
              message:
                "Do not import another module's repository directly. Go through that module's service or the Activity Service event mechanism (see docs/core-services.md).",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.tsx"],
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      // eslint-plugin-react's rules are set individually below rather than
      // spreading a pre-built config object, deliberately — it's resilient
      // to the plugin restructuring its flat-config exports between
      // versions, unlike the reactHooks line just below.
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      // RISK FLAGGED (dependency audit, see docs/dependency-audit.md):
      // eslint-plugin-react-hooks was bumped 4.6.2 -> ^5.0.0 for ESLint 9
      // flat-config support. `configs.recommended.rules` is the v4 shape;
      // if v5 restructured this (e.g. to `configs["recommended-latest"]`
      // or a flat-config-native export), `pnpm lint` will surface it as a
      // config-loading error, not a silent no-op — check this plugin's
      // current docs for the right export name if that happens.
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    // Vitest unit/component test files specifically (not e2e — Playwright
    // uses a different `expect`, unrelated to this concern).
    //
    // `@typescript-eslint/unbound-method` false-positives on the extremely
    // common `expect(mock.method).toHaveBeenCalledWith(...)` /
    // `vi.mocked(mock.method).mockClear()` pattern: it flags any reference
    // to a method-shorthand interface member passed without being called,
    // with no way to know the reference is a vi.fn() mock being inspected,
    // not a real class method losing its `this` binding.
    //
    // The fix belongs here, not in the production interfaces it flags
    // (IdentityRepository, Cache) — those interfaces describe a real
    // calling contract for application code, and adding `this: void` to
    // satisfy a test-only false positive would be solving a test problem
    // by changing production types the test problem doesn't actually
    // apply to. `@vitest/eslint-plugin`'s own `vitest/unbound-method`
    // rule exists specifically for this: it extends the base rule with
    // knowledge of vitest's `expect`/`vi.mocked` call shapes, so it only
    // flags genuine unbound-method mistakes and lets the mock-assertion
    // pattern through. This mirrors the same swap typescript-eslint's own
    // docs recommend for Jest via eslint-plugin-jest's equivalent rule.
    files: ["**/*.test.ts", "**/*.test.tsx"],
    plugins: { vitest: vitestPlugin },
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/unbound-method": "off",
      "vitest/unbound-method": "error",
    },
  },
  {
    files: ["**/e2e/**"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
  {
    // Every numeric literal in a schema file is already the sole
    // initializer of an exported, descriptively-named validation constant
    // (PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, etc. — see
    // packages/shared/src/schemas/*.ts). That naming convention already
    // satisfies this rule's underlying goal (no unexplained numbers); the
    // rule itself has no way to distinguish "the entire value of a named
    // constant" from "an inline magic number" and flags both identically,
    // producing warnings with no real signal in exactly this file pattern.
    // Scoped to schema files specifically, not disabled project-wide.
    files: ["**/schemas/**/*.ts"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },

  {
    // JS configuration files: the root eslint.config.js, the per-package
    // re-export shims (apps/api, apps/web, packages/shared each have one),
    // and any other `*.config.js`/`*.config.mjs` tooling file. Plain
    // Node/ESM tooling, not application source, intentionally excluded
    // from every tsconfig's `include`. `extends: [...tseslint.configs.
    // recommended]` (the non-"TypeChecked" variant) gives these files
    // real linting — including TypeScript-aware syntax rules the plain
    // `@eslint/js` baseline doesn't cover — without requiring type
    // information: `recommended` (unlike `strictTypeChecked` above) does
    // not set `parserOptions.project`/`projectService` and contains no
    // rule that needs the type checker, so there's nothing here that can
    // throw for lack of a resolvable tsconfig project. This block and the
    // type-aware block above are deliberately mutually exclusive — no
    // rule appears in both.
    files: JS_CONFIG_FILES,
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      sourceType: "module",
    },
  },
);
