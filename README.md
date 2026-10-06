# hello-print-e2e

End-to-end test suite for the [Helloprint](https://www.helloprint.com) storefront, built with [Playwright](https://playwright.dev) and TypeScript.

It covers the purchase funnel up to the cart: choosing a product, configuring it on the product page, adding it to the cart, reviewing the mini cart and checking the cart page. Every scenario runs against each configured locale (`en-ie` and `en-gb`), on both desktop Chrome and a mobile iPhone 15 Pro Max (Safari/WebKit).

> **Scope note:** the suite deliberately stops at the cart and never places an order. Helloprint environments are connected to the production order backend, so going further would create real orders.

---

## Architecture

```
hello-print-e2e/
├── .github/workflows/playwright.yml   # CI pipeline (GitHub Actions)
├── .husky/pre-commit                  # Git hook: type check + lint before every commit
├── playwright.config.ts               # Runner config: projects per site and device, headers, reporters, traces
├── tsconfig.json                      # TypeScript config (strict, type check only)
├── eslint.config.mjs                  # ESLint config (typescript-eslint + eslint-plugin-playwright)
├── fixtures/
│   └── base.ts                        # Custom `test` with a `base` fixture exposing every page object
├── pages/                             # Page Object Model
│   ├── base.ts                        # Shared base class (page handle, common elements like breadcrumb)
│   ├── landing.ts                     # Landing page / product grid
│   ├── product.ts                     # Product detail page (option selection, price, add to cart)
│   ├── mini-cart.ts                   # Mini cart modal shown after adding a product
│   └── cart.ts                        # Cart page (line items and summary)
├── support/
│   ├── constants.ts                   # Target host and site/locale matrix
│   ├── types.ts                       # `ProductDetails` test data model
│   └── utils.ts                       # Helpers (e.g. price sanitising)
└── tests/
    └── checkout.spec.ts               # Scenarios
```

The suite has four layers, each depending only on the layer below it:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Specs | `tests/` | Describe *what* is being verified, as readable steps |
| Fixtures | `fixtures/` | Build and inject page objects, and open the landing page |
| Page objects | `pages/` | Know *how* to find and interact with elements |
| Support | `support/`, `playwright.config.ts` | Configuration, test data types and utilities |

### Test flow

```
Landing ──select product──▶ Product page ──configure + add to cart──▶ Mini cart ──proceed──▶ Cart
   ▲                             │
   └────── continue shopping ────┘              Cart ──edit item──▶ Product page (pre-filled)
```

### Multi-site and multi-device execution

`support/constants.ts` defines the list of sites. `playwright.config.ts` turns each site into two Playwright **projects** with its own `baseURL`, one per device, so the same spec runs once per locale and device:

| Project | Device | Browser engine |
| --- | --- | --- |
| `CHROME_ENGLISH_DESKTOP`, `CHROME_UK_DESKTOP` | Desktop Chrome (1280x720) | Chromium |
| `SAFARI_ENGLISH_MOBILE`, `SAFARI_UK_MOBILE` | iPhone 15 Pro Max (430x739, touch, mobile user agent) | WebKit |

The mobile projects use Playwright's built-in `iPhone 15 Pro Max` device descriptor, which emulates the viewport, pixel ratio, touch and user agent on WebKit (Safari's engine). It is an emulation, not a real device.

To add a market, add one entry to `sites`; it automatically gets both a desktop and a mobile project. To add a device, add another entry to the array returned by `sites.flatMap(...)` in `playwright.config.ts`.

Navigation always uses **relative paths without a leading slash** (`page.goto('')`), so the locale prefix (`/en-ie/`) is kept.

---

## Design

- **Stable selectors first.** Elements are located by `data-testid` (configured as `testIdAttribute`), then by `data-attr` or ARIA roles and labels when no test id exists. Nothing depends on CSS layout or text that changes per locale, except for product names that are passed in as data.
- **No hard waits.** Page objects expose `waitFor...ToBeVisible()` methods that wait for the elements the page actually needs. Assertions use Playwright's auto-retrying `expect`.
- **Data-driven scenarios.** Each test describes its product configuration as a `ProductDetails` object. The same object flows through the test and collects values read from the UI (price, total) so they can be compared later: what the product page shows must match the mini cart, and the mini cart must match the cart.
- **Readable reports.** Reusable flows in the spec (`addProductToCart`, `proceedToCheckout`, `verifyCart`, `verifyCartSummary`) are wrapped in `test.step`, so the HTML report and traces read like the scenario description.
- **Debuggable failures.** Traces and screenshots are kept for failing tests and attached to the HTML report. CI retries twice to separate flaky failures from real ones.
- **Environment-agnostic.** The host and the Cloudflare bypass header come from environment variables, so the same code runs locally, in CI, or against staging or preview environments without changes.

## Patterns

- **Page Object Model.** One class per page or component in `pages/`. Static elements are `readonly Locator` fields set in the constructor. Dynamic elements are created by `get...(value)` methods (for example `getProductSize('a5')`), and user actions are `async` methods (`selectSize`, `clickAddToCart`). Specs never use raw selectors.
- **Inheritance for shared behaviour.** Every page object extends `Base`, which holds the `page` handle and elements shared across pages.
- **Fixture-based dependency injection.** `fixtures/base.ts` extends Playwright's `test` with a `base` fixture. It opens the landing page and exposes a `Pages` container whose getters create page objects lazily (`??=`), so a test only builds what it uses and every test gets a fresh, isolated set.
- **Steps as building blocks.** Scenarios are composed from small step functions instead of being copy-pasted, which keeps each test focused on what makes it different.

---

## Cloudflare / bot protection

The Helloprint storefront sits behind Cloudflare bot management which block automated browsers. **Without access, a run is expected to be blocked** and the tests fail at the first page. This is a property of the environment, not of the tests.

The suite does **not** try to get around this protection. Instead, trusted runs can send a bypass header, read from the environment:

| Variable | Required | Description |
| --- | --- | --- |
| `BASE_URL` | No | Host to test. Defaults to `https://www.helloprint.com/`. Locale paths are appended to it. |
| `WAF_BYPASS_HEADER` | No | Name of the header that lets the run through Cloudflare. |
| `WAF_BYPASS_VALUE` | No | Secret value for that header. Never commit it. |

The header is only added to requests when **both** `WAF_BYPASS_HEADER` and `WAF_BYPASS_VALUE` are set (through Playwright's `extraHTTPHeaders`).

---

## Setup

Requirements: Node.js LTS (20 or newer) and npm.

```bash
npm ci
npx playwright install chromium webkit
```

Chromium is used by the desktop projects and WebKit by the mobile (iPhone) projects. `npm ci` also installs the Git pre-commit hook (through the `prepare` script).

## Running the tests

```bash
# All scenarios on all sites (headless)
npm test

# A single site and device
npx playwright test --project CHROME_UK_DESKTOP
npx playwright test --project SAFARI_UK_MOBILE

# Only desktop, or only mobile (iPhone 15 Pro Max)
npx playwright test --project "*_DESKTOP"
npx playwright test --project "*_MOBILE"

# A single scenario
npx playwright test -g "Add two products to cart"

# Headed, or in Playwright's interactive UI mode
npm run test:headed
npm run test:ui

# Open the last HTML report (includes traces and screenshots of failures)
npm run report
```

With Cloudflare access, or against another environment:

```bash
WAF_BYPASS_HEADER=<header-name> WAF_BYPASS_VALUE=<secret> npm test

BASE_URL=https://<staging-host>/ WAF_BYPASS_HEADER=<header-name> WAF_BYPASS_VALUE=<secret> npm test
```

### CI (GitHub Actions)

`.github/workflows/playwright.yml` runs on pushes and pull requests to `main`/`master`, and can be started manually (`workflow_dispatch`). It installs Chromium and WebKit and runs every project (desktop and mobile). It reads its configuration from repository settings:

- `vars.BASE_URL` (optional)
- `vars.WAF_BYPASS_HEADER` (optional)
- `secrets.WAF_BYPASS_VALUE` (optional, stored as a secret)

The HTML report is uploaded as the `playwright-report` artifact after every run, including failed ones.

## Code quality

```bash
# Type check the whole project (no output files)
npm run typecheck

# Lint, or lint and apply automatic fixes
npm run lint
npm run lint:fix
```

- **TypeScript** runs in `strict` mode and also reports unused variables and parameters.
- **ESLint** uses the type-aware `typescript-eslint` rules (for example, a missing `await` on a promise is an error, which matters a lot with Playwright) and requires `import type` for type-only imports. Files in `tests/` and `fixtures/` also get the recommended `eslint-plugin-playwright` rules. `verifyCart` and `verifyCartSummary` are registered as assertion helpers, so tests that only assert through them are not flagged as having no assertions.
- **Pre-commit hook.** [Husky](https://typicode.github.io/husky/) runs `npm run typecheck` and `npm run lint` before every commit. The commit is aborted if either one reports an error; warnings do not block it. To skip it in an emergency, use `git commit --no-verify`.

---

## Scenarios

| Test | What it verifies |
| --- | --- |
| Add product to cart | A configured product reaches the cart with a consistent price, quantity and total across the product page, mini cart and cart. |
| Edit added product | Editing a cart item re-opens the product page with the saved configuration, and the updated quantity and price are reflected in the cart. |
| Add two products to cart | Two different configurations can coexist in the cart, each keeping its own price and quantity. |

The reasons behind the last two scenarios are in [TEST-NOTES.md](./TEST-NOTES.md).
