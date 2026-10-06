import type { Locator, Page } from "@playwright/test";
import { Base } from "./base";
import { exactText } from "../support/utils";

export class MiniCart extends Base {

    readonly miniCartContainer: Locator;
    readonly miniCartProduct: Locator;
    readonly miniCartProducts: Locator;
    readonly proceedToCheckoutButton: Locator;
    readonly miniCartDesignCheck: Locator;
    readonly miniCartShipping: Locator;
    readonly miniCartVat: Locator;
    readonly miniCartTotal: Locator;
    readonly miniCartSubTotal: Locator;
    readonly miniCartContinueShoppingButton: Locator;

    constructor(page: Page) {
        super(page);
        this.miniCartContainer = page.locator('[data-modal="mini-cart"]');
        this.miniCartProduct = page.getByTestId('minicart-item-row');
        this.miniCartProducts = page.getByTestId('minicart-products');
        this.proceedToCheckoutButton = page.getByTestId('minicart-checkout');
        this.miniCartDesignCheck = page.getByTestId('minicart-artwork');
        this.miniCartShipping = page.getByTestId('minicart-shipping');
        this.miniCartVat = page.getByTestId('minicart-vat');
        this.miniCartTotal = page.getByTestId('minicart-total');
        this.miniCartSubTotal = page.getByTestId('minicart-subtotal');
        this.miniCartContinueShoppingButton = page.getByTestId('minicart-continue');
    }

    async waitForMiniCartToBeVisible(): Promise<void> {
        await this.miniCartContainer.waitFor({ state: 'visible' });
        await this.miniCartProducts.waitFor({ state: 'visible' });
        await this.miniCartDesignCheck.waitFor({ state: 'visible' });
        await this.miniCartShipping.waitFor({ state: 'visible' });
        await this.miniCartVat.waitFor({ state: 'visible' });
        await this.miniCartTotal.waitFor({ state: 'visible' });
        await this.miniCartSubTotal.waitFor({ state: 'visible' });
        await this.proceedToCheckoutButton.waitFor({ state: 'visible' });
    }

    /**
     * The same product can be in the cart more than once with different configurations,
     * so pass the quantity to tell those rows apart.
     */
    getMiniCartProduct(productName: string, quantity?: string): Locator {
        const rows = this.miniCartProduct.filter({ hasText: productName });
        if (!quantity) return rows;
        return rows.filter({
            has: this.page.getByTestId('minicart-spec-quantity').filter({ hasText: exactText(quantity) }),
        });
    }

    getMiniCartProductPrice(productName: string, quantity?: string): Locator {
        return this.getMiniCartProduct(productName, quantity).getByTestId('minicart-item-price');
    }

    getMiniCartProductQuantity(productName: string, quantity?: string): Locator {
        return this.getMiniCartProduct(productName, quantity).getByTestId('minicart-spec-quantity');
    }

    getProductTotal(productName: string, quantity?: string): Locator {
        return this.getMiniCartProduct(productName, quantity).getByTestId('minicart-item-total');
    }

    async clickProceedToCheckout(): Promise<void> {
        await this.proceedToCheckoutButton.click();
    }

    async clickContinueShopping(): Promise<void> {
        await this.miniCartContinueShoppingButton.click();
    }
}