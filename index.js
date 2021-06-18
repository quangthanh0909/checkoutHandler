import { PRODUCT_ID, RULE_NAME, PRODUCTS, PRICES } from "./constants.js";
import { expect, test } from "./helper.js";
class Checkout {
  /** quantities to save product properties and quantity */
  #quantities;
  #pricingRuleObject;
  #afterDiscountList;
  constructor(pricingRule = []) {
    this.#pricingRuleObject = this.convertPricingRuleByProductId(pricingRule);
    /* using Map to save product Item as a key*/
    this.#quantities = new Map();
    this.#afterDiscountList = [];
  }
  convertPricingRuleByProductId(pricingRule = []) {
    return pricingRule.reduce((pre, cur) => {
      const { applyForProductId } = cur;
      pre[applyForProductId] = (pre[applyForProductId] || []).concat(cur);
      return pre;
    }, {});
  }
  add(product, quantity = 1) {
    const currentQuantity = this.#quantities.get(product) || 0;
    this.#quantities.set(product, currentQuantity + quantity);
  }
  reCalculatePrice() {
    this.#afterDiscountList = [];
    this.#quantities.forEach((quantity, product, map) => {
      const productId = product?.productId;
      // check if there is a discount applied for this product
      const discountOffers = this.#pricingRuleObject[productId];
      if (!discountOffers)
        return this.#afterDiscountList.push({ ...product, quantity });
      // there are discount offer applied
      let newOffer = { ...product, quantity };
      discountOffers.forEach((rule) => {
        const ruleName = rule?.name;
        if (ruleName === RULE_NAME.DISCOUNT_PRICE) {
          const newPrice = rule?.newPrice || product?.price || 0;
          newOffer = { ...newOffer, newPrice };
        }
        if (ruleName === RULE_NAME.DISCOUNT_ITEM) {
          const numBuy = rule?.numBuy || 1;
          const getFree = rule?.getFree || 0;
          const numberOfFreeBaseOnTotal =
            Math.floor(quantity / numBuy) * getFree;
          newOffer = {
            ...newOffer,
            newQuantity: quantity - numberOfFreeBaseOnTotal,
          };
        }
      });
      this.#afterDiscountList.push(newOffer);
    });
  }
  total() {
    this.reCalculatePrice();
    return this.#afterDiscountList.reduce((pre, cur) => {
      const { newPrice, newQuantity, price, quantity } = cur;
      pre = pre + (newPrice || price || 0) * (newQuantity || quantity || 0);
      return pre;
    }, 0);
  }
}

// --------------------------------------------------
test("Test default customer", () => {
  const defaultCustomer = new Checkout();
  defaultCustomer.add(PRODUCTS.smallPizza);
  defaultCustomer.add(PRODUCTS.mediumPizza);
  defaultCustomer.add(PRODUCTS.largePizza);
  const expectResult =
    PRICES.smallPizza + PRICES.mediumPizza + PRICES.largePizza;
  expect(defaultCustomer.total()).toEqual(expectResult);
});

// --------------------------------------------------
const infoSysPriceRule = [
  {
    name: RULE_NAME.DISCOUNT_ITEM,
    numBuy: 3,
    getFree: 1,
    applyForProductId: PRODUCT_ID.SMALL,
  },
];
test("Test for infoSys - add product one  by one ", () => {
  const infoSysCustomer = new Checkout(infoSysPriceRule);
  infoSysCustomer.add(PRODUCTS.smallPizza);
  infoSysCustomer.add(PRODUCTS.smallPizza);
  infoSysCustomer.add(PRODUCTS.smallPizza);
  infoSysCustomer.add(PRODUCTS.largePizza);
  const expectResult = PRICES.smallPizza * (3 - 1) + PRICES.largePizza;
  expect(infoSysCustomer.total()).toEqual(expectResult);
});

test("Test for infoSys -- add same PRODUCTS with quantity arg ", () => {
  const infoSysCustomer = new Checkout(infoSysPriceRule);
  infoSysCustomer.add(PRODUCTS.smallPizza, 3);
  infoSysCustomer.add(PRODUCTS.largePizza);
  const expectResult = PRICES.smallPizza * (3 - 1) + PRICES.largePizza;
  expect(infoSysCustomer.total()).toEqual(expectResult);
});

test("Test for infoSys -- buy less 3 small size ", () => {
  const infoSysCustomer = new Checkout(infoSysPriceRule);
  infoSysCustomer.add(PRODUCTS.smallPizza, 2);
  infoSysCustomer.add(PRODUCTS.largePizza);
  const expectResult = PRICES.smallPizza * 2 + PRICES.largePizza;
  expect(infoSysCustomer.total()).toEqual(expectResult);
});

test("Test for infoSys -- over 3 small size ", () => {
  const infoSysCustomer = new Checkout(infoSysPriceRule);
  infoSysCustomer.add(PRODUCTS.smallPizza, 5);
  infoSysCustomer.add(PRODUCTS.largePizza);
  const expectResult = PRICES.smallPizza * (5 - 1) + PRICES.largePizza;
  expect(infoSysCustomer.total()).toEqual(expectResult);
});

// ---------AMAZON-----------------------------------------
const amazonPriceRule = [
  {
    name: RULE_NAME.DISCOUNT_PRICE,
    applyForProductId: PRODUCT_ID.LARGE,
    newPrice: 299.99,
  },
];
test("Test for AMAZON with one largePizza ", () => {
  const amazonCustomer = new Checkout(amazonPriceRule);
  amazonCustomer.add(PRODUCTS.mediumPizza, 3);
  amazonCustomer.add(PRODUCTS.largePizza);
  const expectResult = PRICES.mediumPizza * 3 + amazonPriceRule[0].newPrice;
  expect(amazonCustomer.total()).toEqual(expectResult);
});

test("Test for AMAZON with more largePizza ", () => {
  const amazonCustomer = new Checkout(amazonPriceRule);
  amazonCustomer.add(PRODUCTS.mediumPizza, 3);
  amazonCustomer.add(PRODUCTS.largePizza, 3);
  const expectResult = PRICES.mediumPizza * 3 + amazonPriceRule[0].newPrice * 3;
  expect(amazonCustomer.total()).toEqual(expectResult);
});

// ----------FACEBOOK----------------------------------------
const facebookPriceRule = [
  {
    name: RULE_NAME.DISCOUNT_ITEM,
    numBuy: 5,
    getFree: 1,
    applyForProductId: PRODUCT_ID.MEDIUM,
  },
  {
    name: RULE_NAME.DISCOUNT_PRICE,
    applyForProductId: PRODUCT_ID.LARGE,
    newPrice: 389.99,
  },
];

test("Test for FACEBOOK with 5 medium and 1 large ", () => {
  const facebookCustomer = new Checkout(facebookPriceRule);
  facebookCustomer.add(PRODUCTS.mediumPizza, 5);
  facebookCustomer.add(PRODUCTS.largePizza, 1);
  const expectResult =
    PRICES.mediumPizza * (5 - 1) + facebookPriceRule[1].newPrice;
  expect(facebookCustomer.total()).toEqual(expectResult);
});

test("Test for FACEBOOK with only 5 medium", () => {
  const facebookCustomer = new Checkout(facebookPriceRule);
  facebookCustomer.add(PRODUCTS.mediumPizza, 5);
  const expectResult = PRICES.mediumPizza * (5 - 1);
  expect(facebookCustomer.total()).toEqual(expectResult);
});

test("Test for FACEBOOK with only 10 medium size", () => {
  const facebookCustomer = new Checkout(facebookPriceRule);
  facebookCustomer.add(PRODUCTS.mediumPizza, 10);
  const expectResult = PRICES.mediumPizza * (10 - 2);
  expect(facebookCustomer.total()).toEqual(expectResult);
});

test("Test for FACEBOOK with only large size", () => {
  const facebookCustomer = new Checkout(facebookPriceRule);
  facebookCustomer.add(PRODUCTS.largePizza, 2);
  const expectResult = facebookPriceRule[1].newPrice * 2;
  expect(facebookCustomer.total()).toEqual(expectResult);
});

/** will be enhance later
 *  using Typescript
 *  combine rule with and operator like: if you buy over 5 product, you will get 1 one free and price will discount 20%;
 *  define more rules : like discount by percent
 * */
