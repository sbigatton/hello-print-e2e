/**
 * Host the suite runs against. Override with BASE_URL to target another
 * environment (e.g. staging or a preview branch).
 */
export const baseHost = process.env.BASE_URL ?? 'https://www.helloprint.com/';

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

export const productDetailsGroupsTestIds = {
    size: 'pdp-option-group-size',
    materialAppearance: 'pdp-option-group-materialappearance',
    paperType: 'pdp-option-group-material',
    cover: 'pdp-option-group-cover',
    paperWeight: 'pdp-option-group-paper-weight',
    paperColor: 'pdp-option-group-paper-color',
    paperFinish: 'pdp-option-group-paper-finish',
    paperGloss: 'pdp-option-group-paper-gloss',
    paperTexture: 'pdp-option-group-paper-texture',
    paperThickness: 'pdp-option-group-paper-thickness',
};