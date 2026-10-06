import type { Locator, Page } from "@playwright/test";
import { Base } from "./base";
import { exactText } from "../support/utils";

export class Cart extends Base {

    readonly cartContainer: Locator;
    readonly cartItem: Locator;
    readonly cartItemName: Locator;
    readonly cartItemPrice: Locator;
    readonly cartItemQuantity: Locator;
    readonly cartSummaryProductPrice: Locator;
    readonly cartDesignCheck: Locator;
    readonly cartShipping: Locator;
    readonly cartSummaryVat: Locator;
    readonly cartSummaryTotal: Locator;

    constructor(page: Page) {
        super(page);
        this.cartContainer = page.locator('[data-modal="cart"]');
        this.cartItem = page.getByTestId('cart-line-item');
        this.cartItemName = page.getByTestId('cart-item-name');
        this.cartItemPrice = page.getByTestId('cart-item-price');
        this.cartItemQuantity = page.getByTestId('cart-item-qty');
        this.cartSummaryProductPrice = page.getByTestId('cart-summary-products');        
        this.cartDesignCheck = page.getByTestId('cart-summary-artwork');
        this.cartShipping = page.getByTestId('cart-summary-shipping');
        this.cartSummaryVat = page.getByTestId('cart-summary-vat');
        this.cartSummaryTotal = page.getByTestId('cart-summary-incl-vat');
    }

    async waitForCartToBeVisible(): Promise<void> {
        await this.cartContainer.waitFor({ state: 'visible' });
        await this.cartItem.first().waitFor({ state: 'visible' });
        await this.cartSummaryProductPrice.waitFor({ state: 'visible' });
        await this.cartDesignCheck.waitFor({ state: 'visible' });
        await this.cartShipping.waitFor({ state: 'visible' });
        await this.cartSummaryVat.waitFor({ state: 'visible' });
        await this.cartSummaryTotal.waitFor({ state: 'visible' });
    }

    /**
     * The same product can be in the cart more than once with different configurations,
     * so pass the quantity to tell those lines apart.
     */
    getCartItem(productName: string, quantity?: string): Locator {
        const items = this.cartItem.filter({ has: this.cartItemName.filter({ hasText: productName }) });
        if (!quantity) return items;
        return items.filter({ has: this.cartItemQuantity.filter({ hasText: exactText(quantity) }) });
    }

    getCartItemPrice(productName: string, quantity?: string): Locator {
        return this.getCartItem(productName, quantity).getByTestId('cart-item-price');
    }

    getCartItemQuantity(productName: string, quantity?: string): Locator {
        return this.getCartItem(productName, quantity).getByTestId('cart-item-qty');
    }

    async clickEditCartItem(productName: string): Promise<void> {
        await this.getCartItem(productName).getByTestId('cart-item-edit-config').click();
    }
}