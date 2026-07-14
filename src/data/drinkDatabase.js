import rawDatabase from './chiayi-drink-codex-v12.json';
import validationReport from './validation-report-v12.json';

const MENU_LABELS = {
  complete: '完整菜單',
  complete_reference_menu: '參考菜單',
  partial: '部分菜單',
  pending: '待補菜單',
};

const PRICE_LABELS = {
  price: '售價',
  single: '單一售價',
  M: '中杯',
  L: '大杯',
  bottle: '瓶裝',
  teaMorePrice: '茶類加價',
  milkMorePrice: '奶類加價',
};

const asArray = value => Array.isArray(value) ? value : [];

export function normalizeOption(option) {
  if (typeof option === 'string') return { name: option, price: null };
  if (option && typeof option === 'object') {
    return { ...option, name: option.name || '', price: Number.isFinite(option.price) ? option.price : null };
  }
  return null;
}

export function normalizeOptions(options) {
  return asArray(options).map(normalizeOption).filter(option => option?.name);
}

export function priceChoices(product) {
  if (!product?.prices || typeof product.prices !== 'object') return [];
  return Object.entries(product.prices)
    .filter(([, value]) => Number.isFinite(value))
    .map(([key, value]) => ({ key, label: PRICE_LABELS[key] || key, value }));
}

export function formatPrice(product) {
  const choices = priceChoices(product);
  if (!choices.length) return '價格未提供';
  if (choices.length === 1) return `NT$ ${choices[0].value}`;
  return choices.map(choice => `${choice.label} $${choice.value}`).join(' · ');
}

const branchesByShop = new Map();
for (const branch of asArray(rawDatabase.branches)) {
  if (!branchesByShop.has(branch.shopId)) branchesByShop.set(branch.shopId, []);
  branchesByShop.get(branch.shopId).push(branch);
}

const productsByShop = new Map();
for (const product of asArray(rawDatabase.products)) {
  if (!productsByShop.has(product.shopId)) productsByShop.set(product.shopId, []);
  productsByShop.get(product.shopId).push(product);
}

export const brands = asArray(rawDatabase.shops).map(shop => {
  const customization = rawDatabase.customizationByShop?.[shop.id] || {};
  return {
    ...shop,
    branches: branchesByShop.get(shop.id) || [],
    products: productsByShop.get(shop.id) || [],
    customization: {
      sugarOptions: normalizeOptions(customization.sugarOptions),
      iceOptions: normalizeOptions(customization.iceOptions),
      toppings: normalizeOptions(customization.toppings),
    },
    menuLabel: MENU_LABELS[shop.menuStatus] || shop.menuStatus || '狀態未提供',
  };
});

export const databaseMeta = {
  schemaVersion: rawDatabase.schemaVersion,
  databaseVersion: rawDatabase.databaseVersion,
  city: rawDatabase.city,
  scopeNotice: rawDatabase.scopeNotice,
  brandCount: brands.length,
  branchCount: asArray(rawDatabase.branches).length,
  productCount: asArray(rawDatabase.products).length,
  validationReport,
};

export function searchBrands(query, district = '全部地區') {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-Hant');
  return brands.filter(brand => {
    const branchText = brand.branches.map(branch => `${branch.name} ${branch.district} ${branch.address || ''}`).join(' ');
    const aliases = asArray(brand.aliases).join(' ');
    const matchesQuery = !normalizedQuery || `${brand.name} ${aliases} ${branchText}`.toLocaleLowerCase('zh-Hant').includes(normalizedQuery);
    const matchesDistrict = district === '全部地區' || brand.branches.some(branch => branch.district === district);
    return matchesQuery && matchesDistrict;
  });
}

export function searchProducts(brand, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-Hant');
  return brand.products.filter(product => !normalizedQuery || `${product.name} ${product.category || ''}`.toLocaleLowerCase('zh-Hant').includes(normalizedQuery));
}

export function validateDatabase() {
  const duplicateIds = values => values.filter((value, index) => values.indexOf(value) !== index).filter((value, index, all) => all.indexOf(value) === index);
  const shopIds = asArray(rawDatabase.shops).map(shop => shop.id);
  const branchIds = asArray(rawDatabase.branches).map(branch => branch.id);
  const productIds = asArray(rawDatabase.products).map(product => product.id);
  return {
    brandCount: shopIds.length,
    branchCount: branchIds.length,
    productCount: productIds.length,
    duplicateShopIds: duplicateIds(shopIds),
    duplicateBranchIds: duplicateIds(branchIds),
    duplicateProductIds: duplicateIds(productIds),
    orphanBranches: asArray(rawDatabase.branches).filter(branch => !shopIds.includes(branch.shopId)).map(branch => branch.id),
    orphanProducts: asArray(rawDatabase.products).filter(product => !shopIds.includes(product.shopId)).map(product => product.id),
    unnamedProducts: asArray(rawDatabase.products).filter(product => !product.name).map(product => product.id),
  };
}

export default rawDatabase;
