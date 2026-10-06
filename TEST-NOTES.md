# Test notes: complementary scenarios

Besides the core "Add product to cart" flow, I added two scenarios that I consider essential for a print e-commerce site like Helloprint: **Edit added product** and **Add two products to cart**.

What sets Helloprint apart from a typical shop is that **a product is not a SKU, it's a configuration**. A single "Stapled Booklet" can be ordered with different sizes, papers, covers, page counts and quantities, and every combination has its own price. The core happy path proves that *one* configuration reaches the cart. It doesn't prove that the cart **keeps** configurations correctly once the customer starts behaving like a real customer: changing their mind, or ordering more than one thing. These two scenarios cover exactly that.

---

## 1. Edit added product

### What it does

1. Configures a Stapled Booklet (A5, recycled, 110CO paper, self cover, 8 pages, quantity 1) and adds it to the cart.
2. Opens the item from the cart with **Edit**.
3. Asserts that the product page comes back **pre-filled with the exact saved configuration** (size, material, paper, cover, pages).
4. Changes the quantity to 20, captures the new price and updates the cart.
5. Verifies that the mini cart and cart show the **new quantity and price**, and still contain **only one line item**.

### Why it matters

- **It's a very common customer action.** Print buyers often revise an order before paying: they adjust the quantity to reach a price break, or fix the size or paper. If editing is broken, the customer has to delete the item and configure it again from scratch, or gives up.
- **It tests that the configuration survives a round trip.** Going from the cart back to the product page requires the saved line item to be turned back into a selected configuration. If any option comes back wrong (for example the default paper instead of the chosen one) and the customer doesn't notice, they **pay for and receive a different product than the one they ordered**. In print that means a reprint, a refund and a complaint, because a custom-made product can't be resold.
- **It catches price errors.** Quantity is the main price driver in print. The test makes sure that the price after the edit is the one calculated for the new configuration, not a stale price from the original item.
- **It catches duplicated items.** A frequent bug in edit flows is that "update" adds a *second* line instead of replacing the first one. Asserting a single line item protects against customers being charged twice.
- **It covers integration that unit tests don't reach.** The edit flow crosses the product page, the cart state and the pricing engine. These are separate parts that each work in isolation and fail only when combined, which is the kind of problem E2E tests are meant to find.

### Risk if it's missing

Silent order errors (wrong specs or wrong price) that only show up after printing, when they are most expensive to fix.

---

## 2. Add two products to cart

### What it does

1. Configures a first Stapled Booklet (A5, 8 pages, quantity 1) and adds it to the cart.
2. Chooses **Continue shopping**, goes back to the product grid and configures a **second, different** booklet (A6, 16 pages, quantity 20).
3. Verifies that the mini cart shows **two products**.
4. Verifies on the cart page that **each line keeps its own** name, price and quantity.

### Why it matters

- **Multi-item orders are where the revenue is.** B2B and repeat print customers usually order several items at once (booklets plus flyers, or the same product in two sizes). The average order value depends on the cart handling more than one item correctly.
- **It tests that the cart is a list, not a single slot.** The single-product test would still pass if adding a product *replaced* the previous one, or if two configurations of the same product were *merged* into one line. Both are real bugs that this scenario catches.
- **Same product, different configuration is the hardest case.** Both items are deliberately the *same product* with different options. The cart has to identify lines by configuration, not by product name, otherwise prices and quantities get mixed up between lines. This edge case is specific to configurable products and easy to miss.
- **It covers navigation and state persistence.** "Continue shopping" and going back to the landing page must keep the cart (session or cookie state) while the customer moves around the site. A cart that empties itself during navigation is one of the most damaging bugs in e-commerce, and it's invisible in a single-product flow.
- **It checks prices per line.** Each line must keep the price calculated for its own configuration. The summary totals are aggregated, so the test checks each line individually instead of comparing the summary against a single product.

### Risk if it's missing

Lost or mixed-up items in multi-product orders, which affects exactly the largest and most valuable orders.

---

## Shared design decisions

- **Both scenarios stop at the cart.** Helloprint environments are connected to the production order backend, so placing an order from a test would create real orders. The cart is the last step that can be verified safely.
- **They run on every locale.** Like the rest of the suite, both run on `en-ie` and `en-gb`. Cart and pricing logic often differ per market (currency, VAT, formatting).
- **Values are compared across pages.** The price and quantity read on the product page are carried in the `ProductDetails` object and compared with what the mini cart and cart show. Instead of checking hard-coded prices that change over time, the test checks that **the price shown is consistent throughout the funnel**, which is what matters to the customer.
- **Lines are identified by product and quantity, not by position.** Since the same product can appear twice, mini cart and cart rows are found by product name *and* quantity. This also means the assertions don't depend on the order in which the cart lists items.
- **They reuse the core steps.** Both scenarios are built from the same `addProductToCart`, `proceedToCheckout` and `verifyCart` steps as the main test, so each one only contains what makes it different.
