import { defineConfig, devices } from '@playwright/test';
import { sites } from './support/constants';

/**
 * The storefront sits behind Cloudflare bot management, which blocks automated browsers.
 * Trusted runs can pass a WAF bypass header through the environment; nothing is sent otherwise.
 */
const { WAF_BYPASS_HEADER, WAF_BYPASS_VALUE } = process.env;
const extraHTTPHeaders = WAF_BYPASS_HEADER && WAF_BYPASS_VALUE
  ? { [WAF_BYPASS_HEADER]: WAF_BYPASS_VALUE }
  : undefined;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* baseURL is set per project (see `sites`). */
    extraHTTPHeaders,
    testIdAttribute: 'data-testid', // Playwright uses this attribute to find elements in the DOM

    /* Keep the trace of failed tests; it's attached to the HTML report. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  /* One project per site and device, so every scenario runs against each locale on desktop and mobile */
  projects: sites.flatMap((site) => [
    {
      name: `CHROME_${site.name}_DESKTOP`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: site.baseURL,
      },
    },
    {
      name: `SAFARI_${site.name}_MOBILE`,
      use: {
        ...devices['iPhone 15 Pro Max'], // WebKit, 430x739 viewport, touch, mobile user agent
        baseURL: site.baseURL,
      },
    },
  ]),
});
