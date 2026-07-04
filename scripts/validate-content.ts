import { products } from "../app/content/products/registry";
import { validateProducts } from "../app/content/products/validate";

const errors = validateProducts(products);

if (errors.length > 0) {
  console.error("Content validation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Content validation passed.");
