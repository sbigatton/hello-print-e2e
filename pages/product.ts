import type { Locator, Page } from "@playwright/test";
import { Base } from "./base";
import { sanitizePrice } from "../support/utils";

export class Product extends Base {

    readonly productTitle: Locator;
    readonly productSize: Locator;
    readonly productMaterialAppearance: Locator;
    readonly productPaperType: Locator;
    readonly productCover: Locator;
    readonly productQuantity: Locator;
    readonly productPagesDropdownButton: Locator;
    readonly productPagesDropdownOption: Locator;
    readonly totalPrice: Locator;
    readonly addToCartButton: Locator;
    readonly activeOptionClass: string = 'option-tile--active';
    readonly selectedPages: Locator;

    constructor(page: Page) {
        super(page);
        this.productTitle = page.getByTestId('product-title');
        this.productSize = page.locator('[data-attr="size"]');
        this.productMaterialAppearance = page.locator('[data-attr="materialappearance"]');
        this.productPaperType = page.locator('[data-attr="material"]');
        this.productCover = page.locator('[data-attr="cover"]');
        this.productQuantity = page.getByTestId('pdp-quantity-tile');
        this.productPagesDropdownButton = page.locator('[data-attr="pages"]').getByLabel('option-select-label-pages');
        this.productPagesDropdownOption = page.getByLabel('Pages').getByRole('button');
        this.totalPrice = page.getByTestId('pdp-price-total');
        this.addToCartButton = page.getByTestId('pdp-action-cta');
        this.selectedPages = this.productQuantity.locator('span#option-select-value-pages');
    }

    async goBackToLandingPage(): Promise<void> {
        await this.page.goto('');
    }

    async waitForProductToBeVisible(): Promise<void> {
        await this.productTitle.waitFor({ state: 'visible' });
        await this.totalPrice.waitFor({ state: 'visible' });
        await this.addToCartButton.waitFor({ state: 'visible' });
    }    

    async selectQuantity(quantity: string): Promise<void> {
        await this.productQuantity.locator('span', { hasText: quantity }).click();
    }

    getDeliveryOptionByName(deliveryOptionName: string): Locator {
        return this.page.getByTestId(`pdp-delivery-tier-${deliveryOptionName}`);
    }
    
    async selectDeliberyOptionByName(deliveryOptionName: string): Promise<void> {
        await this.getDeliveryOptionByName(deliveryOptionName).click();
    }

    async selectPages(pages: string): Promise<void> {
        await this.productPagesDropdownButton.click();
        await this.productPagesDropdownOption.filter({ hasText: pages }).click();
    }

    getProductSize(size: string): Locator {
        return this.productSize.getByTestId(`pdp-option-size-${size}`);
    }

    async selectSize(size: string): Promise<void> {
        await this.getProductSize(size).click();
    }

    getProductMaterialAppearance(materialAppearance: string): Locator {
        return this.productMaterialAppearance.getByTestId(`pdp-option-materialappearance-${materialAppearance}`);
    }

    async selectMaterialAppearance(materialAppearance: string): Promise<void> {
        await this.getProductMaterialAppearance(materialAppearance).click();
    }

    getProductPaperType(paperType: string): Locator {
        return this.productPaperType.getByTestId(`pdp-option-material-${paperType}`);
    }

    async selectPaperType(paperType: string): Promise<void> {
        await this.getProductPaperType(paperType).click();
    }

    getProductCover(cover: string): Locator {
        return this.productCover.getByTestId(`pdp-option-cover-${cover}`);
    }

    async selectCover(cover: string): Promise<void> {
        await this.getProductCover(cover).click();
    }

    async getTotalPrice(): Promise<string> {
        return sanitizePrice(await this.totalPrice.textContent() ?? '0');
    }

    async clickAddToCart(): Promise<void> {
        await this.addToCartButton.click();
    }
}

