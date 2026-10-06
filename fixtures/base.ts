import type { Page } from '@playwright/test';
import { test as baseTest } from '@playwright/test';
import { Landing } from '../pages/landing';
import { Product } from '../pages/product';
import { MiniCart } from '../pages/mini-cart';
import { Cart } from '../pages/cart';

export class Pages {
    private _landingPage?: Landing;
    private _productPage?: Product;
    private _miniCartPage?: MiniCart;
    private _cartPage?: Cart;

    constructor(readonly page: Page) {}

    get landingPage(): Landing {
        return (this._landingPage ??= new Landing(this.page));
    }

    get productPage(): Product {
        return (this._productPage ??= new Product(this.page));
    }

    get miniCartPage(): MiniCart {
        return (this._miniCartPage ??= new MiniCart(this.page));
    }

    get cartPage(): Cart {
        return (this._cartPage ??= new Cart(this.page));
    }
}

export const test = baseTest.extend<{ base: Pages }>({
    base: async ({ page }, use) => {
        const pages = new Pages(page);
        await pages.landingPage.open();
        await use(pages);
    },
});

export { expect } from '@playwright/test';
