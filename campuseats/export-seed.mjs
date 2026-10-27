import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const base = path.resolve(process.argv[2]);
const load = (f) => import(pathToFileURL(path.join(base, "src/data", f)).href);

const { categories } = await load("categories.js");
const { restaurants } = await load("restaurants.js");
const { foods } = await load("foods.js");
const { reviews } = await load("reviews.js");
const { initialRiders } = await load("riders.js");
const { initialAddresses } = await load("addresses.js");

const out = { categories, restaurants, foods, reviews, riders: initialRiders, addresses: initialAddresses };
writeFileSync(process.argv[3], JSON.stringify(out, null, 2));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])));