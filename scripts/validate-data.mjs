import fs from 'node:fs';

const database = JSON.parse(fs.readFileSync(new URL('../src/data/chiayi-drink-codex-v12.json', import.meta.url), 'utf8'));
const expected = JSON.parse(fs.readFileSync(new URL('../src/data/validation-report-v12.json', import.meta.url), 'utf8'));
const duplicateIds = values => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const shopIds = database.shops.map(shop => shop.id);
const branchIds = database.branches.map(branch => branch.id);
const productIds = database.products.map(product => product.id);
const result = {
  databaseVersion: database.databaseVersion,
  shopBrandCount: database.shops.length,
  knownBranchCount: database.branches.length,
  productCount: database.products.length,
  dafaGoodTeaProductCount: database.products.filter(product => product.shopId === 'dafa-good-tea').length,
  dafaGoodTeaBranchCount: database.branches.filter(branch => branch.shopId === 'dafa-good-tea').length,
  dafaGoodTeaMenuStatus: database.shops.find(shop => shop.id === 'dafa-good-tea')?.menuStatus,
  duplicateShopIds: duplicateIds(shopIds),
  duplicateBranchIds: duplicateIds(branchIds),
  duplicateProductIds: duplicateIds(productIds),
  orphanBranches: database.branches.filter(branch => !shopIds.includes(branch.shopId)).map(branch => branch.id),
  orphanProducts: database.products.filter(product => !shopIds.includes(product.shopId)).map(product => product.id),
  unnamedProducts: database.products.filter(product => !product.name).map(product => product.id),
};
const failures = [];
for (const key of ['databaseVersion', 'shopBrandCount', 'knownBranchCount', 'productCount', 'dafaGoodTeaProductCount', 'dafaGoodTeaBranchCount', 'dafaGoodTeaMenuStatus']) {
  if (result[key] !== expected[key]) failures.push(`${key}: expected ${expected[key]}, received ${result[key]}`);
}
for (const key of ['duplicateShopIds', 'duplicateBranchIds', 'duplicateProductIds', 'orphanBranches', 'orphanProducts']) {
  if (result[key].length) failures.push(`${key}: ${result[key].join(', ')}`);
}
if (result.unnamedProducts.length) failures.push(`unnamedProducts: ${result.unnamedProducts.join(', ')}`);
console.log(JSON.stringify({ ...result, valid: failures.length === 0, failures }, null, 2));
if (failures.length) process.exitCode = 1;
