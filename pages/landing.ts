import type { Locator, Page } from "@playwright/test";
import { Base } from "./base";

export class Landing extends Base {
    readonly productItem: Locator;
    
    constructor(page: Page) {
        super(page);
        this.productItem = page.getByTestId('product-grid-item');
    }

    async open(): Promise<void> {
        await this.page.goto('');
    }

    getProductByName(productName: string): Locator {
        return this.productItem.filter({ hasText: productName });
    }

    async selectProduct(productName: string): Promise<void> {
        await this.getProductByName(productName).click();
    }
}