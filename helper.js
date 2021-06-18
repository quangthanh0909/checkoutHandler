export const expect = (target) => ({
  toEqual: (expected) => {
    if (expected !== target)
      throw new Error(`${expected} is not equal ${target}`);
  },
});
export const test = (name, callback) => {
  try {
    callback();
    console.log(`Pass: ${name}`);
  } catch (error) {
    console.error(`Failed : ${name} : ${error.message}`);
  }
};
