export function sanitizePrice(price: string): string {
    return price ? price.replace(/[^\d.,-]/g, '') : '0';
}

/** Matches an element whose whole text is `value`, ignoring surrounding whitespace. */
export function exactText(value: string): RegExp {
    return new RegExp(`^\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}
