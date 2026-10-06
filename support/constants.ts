/**
 * Host the suite runs against. Override with BASE_URL to target another
 * environment (e.g. staging or a preview branch).
 */
export const baseHost = process.env.BASE_URL || 'https://www.helloprint.com/'; // CI exports unset vars as ''

/**
 * Same scenarios run once per site.
 * The trailing slash on the path matters: tests must navigate with relative
 * paths WITHOUT a leading slash (e.g. `page.goto('')`, `page.goto('flyer-printing')`),
 * otherwise the `/en-ie/` path prefix would be dropped.
 */
export const sites = [
    { name: 'ENGLISH', path: 'en-ie/' },
    { name: 'UK', path: 'en-gb/' },
].map((site) => ({ ...site, baseURL: new URL(site.path, baseHost).toString() }));