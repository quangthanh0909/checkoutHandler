export const RULE_NAME = {
  DISCOUNT_ITEM: "discountItem",
  DISCOUNT_PRICE: "discountPrice",
};
export const PRODUCT_ID = {
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
};

export const PRICES = {
  smallPizza: 269.99,
  mediumPizza: 322.99,
  largePizza: 394.99,
};

export const PRODUCTS = {
  smallPizza: {
    productId: PRODUCT_ID.SMALL,
    description: '10" pizza for one person',
    price: PRICES.smallPizza,
  },
  mediumPizza: {
    productId: PRODUCT_ID.MEDIUM,
    description: '12" pizza for one person',
    price: PRICES.mediumPizza,
  },
  largePizza: {
    productId: PRODUCT_ID.LARGE,
    description: '15" pizza for one person',
    price: PRICES.largePizza,
  },
};
