import type { Locator, Page } from "@playwright/test";

export class Base {
    readonly page: Page;
    readonly breadcrumb: Locator;

    constructor(page: Page) {
        this.page = page;
        this.breadcrumb = page.getByTestId('breadcrumb-item');
    }

    async waitForBreadcrumbToBeVisible(): Promise<void> {
        await this.breadcrumb.waitFor({ state: 'visible' });
    }

    getBreadcrumb(productName: string): Locator {
        return this.breadcrumb.filter({ hasText: productName });
    }
}