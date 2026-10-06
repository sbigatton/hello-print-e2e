import type { Pages } from '../fixtures/base';
import { test, expect } from '../fixtures/base';
import type { ProductDetails } from '../support/types';
import { sanitizePrice } from '../support/utils';

const addProductToCart = async (base: Pages, productDetails: ProductDetails) => {
  await test.step('Add product to cart', async () => {
    await base.productPage.waitForProductToBeVisible();
    await base.productPage.selectSize(productDetails.size as string);
    await base.productPage.selectMaterialAppearance(productDetails.materialAppearance as string);
    await base.productPage.selectPaperType(productDetails.paperType as string);
    await base.productPage.selectCover(productDetails.cover as string);
    await base.productPage.selectPages(productDetails.pages as string);
    await base.productPage.selectQuantity(productDetails.quantity as string);
    productDetails.price = await base.productPage.getTotalPrice();
    await base.productPage.clickAddToCart();
  });
};

const proceedToCheckout = async (base: Pages, productDetails: ProductDetails, expectedProductsCount = 1) => {
  await test.step('Proceed to checkout', async () => {
    await base.miniCartPage.waitForMiniCartToBeVisible();
    await expect(base.miniCartPage.miniCartProduct).toHaveCount(expectedProductsCount);
    const { name, quantity } = productDetails;
    const miniCartProductPrice = base.miniCartPage.getMiniCartProductPrice(name, quantity);
    await expect(miniCartProductPrice).toContainText(productDetails.price as string);
    const miniCartProductQuantity = base.miniCartPage.getMiniCartProductQuantity(name, quantity);
    await expect(miniCartProductQuantity).toHaveText(quantity as string);
    const miniCartProductTotal = await base.miniCartPage.getProductTotal(name, quantity).textContent() ?? '0';
    productDetails.total = sanitizePrice(miniCartProductTotal);
    await base.miniCartPage.clickProceedToCheckout();
  });
};

const addProductToCartAndCheckout = async (base: Pages, productDetails: ProductDetails) => {
  await test.step('Select product', async () => {
    await base.landingPage.selectProduct(productDetails.name);
  });

  await addProductToCart(base, productDetails);
  await proceedToCheckout(base, productDetails);
};

const verifyCart = async (base: Pages, productDetails: ProductDetails | ProductDetails[]) => {
  const products = Array.isArray(productDetails) ? productDetails : [productDetails];

  await test.step('Verify cart', async () => {
    await base.cartPage.waitForCartToBeVisible();
    await expect(base.cartPage.cartItem).toHaveCount(products.length);

    for (const product of products) {
      await expect(base.cartPage.getCartItem(product.name, product.quantity)).toHaveCount(1);
      await expect(base.cartPage.getCartItemPrice(product.name, product.quantity)).toContainText(product.price as string);
      await expect(base.cartPage.getCartItemQuantity(product.name, product.quantity)).toHaveText(product.quantity as string);
    }
  });
};

// The summary shows aggregated amounts, so it can only be compared directly against a single product
const verifyCartSummary = async (base: Pages, productDetails: ProductDetails) => {
  await test.step('Verify cart summary', async () => {
    await expect(base.cartPage.cartSummaryProductPrice.first()).toContainText(productDetails.price as string);
    await expect(base.cartPage.cartSummaryTotal.first()).toContainText(productDetails.total as string);
  });
};

test('Add product to cart', async ({ base }) => {
  const productDetails: ProductDetails = {
    name: 'Stapled Booklets',
    quantity: '1',
    size: 'a5',
    materialAppearance: 'recycled',
    paperType: '110CO',
    cover: 'selfcover',
    pages: '8',
  };

  await addProductToCartAndCheckout(base, productDetails);
  await verifyCart(base, productDetails);
  await verifyCartSummary(base, productDetails);
});

test('Edit added product', async ({ base }) => {
  const productDetails: ProductDetails = {
    name: 'Stapled Booklets',
    quantity: '1',
    size: 'a5',
    materialAppearance: 'recycled',
    paperType: '110CO',
    cover: 'selfcover',
    pages: '8',
  };

  await addProductToCartAndCheckout(base, productDetails);

  await test.step('Click on edit product', async () => {
    await base.cartPage.waitForCartToBeVisible();
    await base.cartPage.clickEditCartItem(productDetails.name);
    await base.productPage.waitForProductToBeVisible();
  });

  await test.step('Assert selected product options', async () => {
    await expect(base.productPage.getProductSize(productDetails.size as string)).toHaveClass(base.productPage.activeOptionClass);
    await expect(base.productPage.getProductMaterialAppearance(productDetails.materialAppearance as string)).toHaveClass(base.productPage.activeOptionClass);
    await expect(base.productPage.getProductPaperType(productDetails.paperType as string)).toHaveClass(base.productPage.activeOptionClass);
    await expect(base.productPage.getProductCover(productDetails.cover as string)).toHaveClass(base.productPage.activeOptionClass);
    await expect(base.productPage.selectedPages).toHaveText(productDetails.pages as string);
  });

  await test.step('Update product quantity', async () => {
    productDetails.quantity = '20';
    await base.productPage.selectQuantity(productDetails.quantity);
    const productTotalPrice = await base.productPage.getTotalPrice();
    productDetails.price = sanitizePrice(productTotalPrice);
    await base.productPage.clickAddToCart();
  });

  await proceedToCheckout(base, productDetails);
  await verifyCart(base, productDetails);
  await verifyCartSummary(base, productDetails);
});

test('Add two products to cart', async ({ base }) => {
  const productDetails1: ProductDetails = {
    name: 'Stapled Booklets',
    quantity: '1',
    size: 'a5',
    materialAppearance: 'recycled',
    paperType: '110CO',
    cover: 'selfcover',
    pages: '8',
  };

  const productDetails2: ProductDetails = {
    name: 'Stapled Booklets',
    quantity: '20',
    size: 'a6',
    materialAppearance: 'recycled',
    paperType: '110CO',
    cover: 'selfcover',
    pages: '16',
  };

  await test.step('Select product', async () => {
    await base.landingPage.selectProduct(productDetails1.name);
  });

  await addProductToCart(base, productDetails1);

  await test.step('Continue shopping', async () => {
    await base.miniCartPage.clickContinueShopping();
  });

  await test.step('Select second product', async () => {
    await base.productPage.goBackToLandingPage();
    await base.landingPage.selectProduct(productDetails2.name);
  });

  await addProductToCart(base, productDetails2);
  await proceedToCheckout(base, productDetails2, 2);
  await verifyCart(base, [productDetails1, productDetails2]);
});