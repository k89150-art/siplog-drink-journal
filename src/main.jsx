import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, BookOpen, Heart, BarChart3, Tag, Settings, Search, MapPin, Bell, Plus, Store, CupSoda, ChevronRight, Check, X, Database, GitBranch, BadgeDollarSign, AlertCircle } from 'lucide-react';
import { brands, databaseMeta, formatPrice, priceChoices, searchBrands, searchProducts } from './data/drinkDatabase';
import './styles.css';
import './styles-extra.css';
import './data-styles.css';
import './mobile.css';

const navItems = [[Home, '首頁'], [BookOpen, '品飲日記'], [Store, '品牌門市'], [Heart, '我的最愛'], [BarChart3, '統計總覽'], [Tag, '標籤管理']];
const loadRecords = () => {
  try {
    const records = JSON.parse(localStorage.getItem('siplog-records'));
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
};
const statusClass = status => status?.includes('complete') ? 'complete' : status === 'partial' ? 'partial' : 'pending';
const firstAvailableProduct = brand => brand.products.find(product => product.available !== false) || brand.products[0] || null;

function App() {
  const [page, setPage] = useState('首頁');
  const [brandQuery, setBrandQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [district, setDistrict] = useState('全部地區');
  const [districtOpen, setDistrictOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [brand, setBrand] = useState(brands[0]);
  const [branch, setBranch] = useState(brands[0]?.branches[0] || null);
  const [product, setProduct] = useState(firstAvailableProduct(brands[0]));
  const [priceKey, setPriceKey] = useState(() => priceChoices(firstAvailableProduct(brands[0]))[0]?.key || '');
  const [sugar, setSugar] = useState('');
  const [ice, setIce] = useState('');
  const [toppings, setToppings] = useState([]);
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('');
  const [again, setAgain] = useState('yes');
  const [saved, setSaved] = useState(false);
  const [records, setRecords] = useState(loadRecords);

  const districts = useMemo(() => ['全部地區', ...new Set(brands.flatMap(item => item.branches.map(itemBranch => itemBranch.district)).filter(Boolean))], []);
  const filteredBrands = useMemo(() => searchBrands(brandQuery, district), [brandQuery, district]);
  const filteredProducts = useMemo(() => searchProducts(brand, productQuery), [brand, productQuery]);
  const selectedPrice = priceChoices(product).find(choice => choice.key === priceKey) || null;
  const average = records.length ? (records.reduce((sum, record) => sum + Number(record.rating || 0), 0) / records.length).toFixed(1) : '—';

  function go(nextPage) {
    setPage(nextPage);
    setNoticeOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectBrand(nextBrand) {
    const nextProduct = firstAvailableProduct(nextBrand);
    setBrand(nextBrand);
    setBranch(nextBrand.branches[0] || null);
    setProduct(nextProduct);
    setPriceKey(priceChoices(nextProduct)[0]?.key || '');
    setProductQuery('');
    setSugar('');
    setIce('');
    setToppings([]);
  }

  function selectProduct(nextProduct) {
    setProduct(nextProduct);
    setPriceKey(priceChoices(nextProduct)[0]?.key || '');
  }

  function toggleTopping(option) {
    setToppings(current => current.some(item => item.name === option.name)
      ? current.filter(item => item.name !== option.name)
      : current.length < 3 ? [...current, option] : current);
  }

  function saveRecord() {
    if (!product || product.available === false) return;
    const record = {
      id: Date.now(),
      brandId: brand.id,
      branchId: branch?.id || null,
      productId: product.id,
      shop: brand.name,
      branch: branch?.name || null,
      drink: product.name,
      category: product.category || null,
      priceKey: selectedPrice?.key || null,
      price: selectedPrice?.value ?? null,
      sugar: sugar || null,
      ice: ice || null,
      toppings: toppings.map(item => ({ name: item.name, price: item.price })),
      rating,
      note,
      repurchase: again,
      date: '剛剛',
      databaseVersion: databaseMeta.databaseVersion,
    };
    const nextRecords = [record, ...records];
    setRecords(nextRecords);
    localStorage.setItem('siplog-records', JSON.stringify(nextRecords));
    setSaved(true);
    setUnread(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return <div className="app">
    <aside>
      <div className="brand"><span>🧋</span><b>SipLog</b><small>喝飲誌</small></div>
      <nav>{navItems.map(([Icon, label]) => <button onClick={() => go(label)} className={page === label ? 'active' : ''} key={label}><Icon size={19}/>{label}</button>)}</nav>
      <div className="asideBottom"><button onClick={() => go('設定')} className={page === '設定' ? 'active' : ''}><Settings size={19}/>設定</button><div className="profile"><span>嘉</span><div><b>嘉義飲料地圖</b><small>資料庫 {databaseMeta.databaseVersion}</small></div></div></div>
    </aside>
    <main>
      <header><div><p className="eyebrow">CHIAYI DRINK JOURNAL</p><h1>{page === '首頁' ? '今天想喝什麼？ 🧋' : page}</h1><p>{page === '首頁' ? `${databaseMeta.brandCount} 個品牌、${databaseMeta.productCount} 項飲品等你探索。` : '你的 SipLog 個人品飲空間'}</p></div><div className="headActions"><div className="noticeWrap"><button aria-label="通知" className="icon" onClick={() => { setNoticeOpen(value => !value); setUnread(false); }}><Bell size={20}/>{unread && <i/>}</button>{noticeOpen && <Notice close={() => setNoticeOpen(false)} records={records}/>}</div><button className="primary" onClick={() => go('首頁')}><Plus size={18}/>快速記錄</button></div></header>
      {page === '首頁'
        ? <Builder {...{ brandQuery, setBrandQuery, productQuery, setProductQuery, district, setDistrict, districtOpen, setDistrictOpen, districts, filteredBrands, brand, selectBrand, branch, setBranch, filteredProducts, product, selectProduct, priceKey, setPriceKey, sugar, setSugar, ice, setIce, toppings, toggleTopping, rating, setRating, note, setNote, again, setAgain, saved, saveRecord }}/>
        : <DashboardPage page={page} records={records} average={average} goHome={() => go('首頁')}/>}
    </main>
    <RightPanel records={records} average={average} go={go}/>
  </div>;
}

function Builder(props) {
  const { brand, branch, product } = props;
  const productPrices = priceChoices(product);
  const [mobileStep, setMobileStep] = useState(0);
  const stepLabels = ['搜尋品牌', '選擇飲品', '價格客製', '評分備註'];
  return <section className={`builder mobile-step-${mobileStep}`}>
    <div className="steps">{stepLabels.map((label, index) => <button aria-label={`步驟 ${index + 1}：${label}`} onClick={() => setMobileStep(index)} className={`step ${mobileStep === index ? 'current' : ''}`} key={label}><span>{index + 1}</span><b>{label}</b>{index < 3 && <em/>}</button>)}</div>
    <div className="databaseStrip"><Database size={15}/><span>嘉義市飲料資料庫</span><b>v12</b><small>{databaseMeta.schemaVersion} schema</small></div>
    <div className="columns">
      <div className="panel shopPanel">
        <div className="panelTitle"><span><Store size={17}/>品牌與分店</span><small>{props.filteredBrands.length} 個品牌</small></div>
        <label className="search"><Search size={17}/><input aria-label="搜尋品牌或分店" value={props.brandQuery} onChange={event => props.setBrandQuery(event.target.value)} placeholder="品牌、分店、地址"/>{props.brandQuery && <button aria-label="清除品牌搜尋" onClick={() => props.setBrandQuery('')}><X size={14}/></button>}</label>
        <div className="chips"><div className="locationPicker"><button onClick={() => props.setDistrictOpen(value => !value)}><MapPin size={14}/>{props.district}⌄</button>{props.districtOpen && <div className="areaMenu">{props.districts.map(item => <button onClick={() => { props.setDistrict(item); props.setDistrictOpen(false); }} key={item}>{item}{props.district === item && <Check size={13}/>}</button>)}</div>}</div></div>
        <div className="shopList brandList">{props.filteredBrands.length ? props.filteredBrands.map(item => <button onClick={() => { props.selectBrand(item); setMobileStep(1); }} className={brand.id === item.id ? 'selected' : ''} key={item.id}><i>{item.name.slice(0, 1)}</i><div><b>{item.name}</b><small>{item.branches.length ? `${item.branches.length} 間已知分店` : '分店資料未提供'}</small><span className={`menuBadge ${statusClass(item.menuStatus)}`}>{item.menuLabel}</span></div>{brand.id === item.id && <Check size={16}/>}</button>) : <Empty title="找不到符合的品牌"/>}</div>
      </div>
      <div className="panel drinkPanel">
        <div className="panelTitle"><span><CupSoda size={17}/>分店與飲品</span><small>{brand.products.length} 項</small></div>
        <label className="selectLabel"><GitBranch size={15}/><span>分店</span><select aria-label="選擇分店" value={branch?.id || ''} onChange={event => props.setBranch(brand.branches.find(item => item.id === event.target.value) || null)} disabled={!brand.branches.length}><option value="">{brand.branches.length ? '選擇分店' : '分店資料未提供'}</option>{brand.branches.map(item => <option value={item.id} key={item.id}>{item.name}｜{item.district}</option>)}</select></label>
        {branch && <div className="branchInfo"><MapPin size={13}/><span>{branch.address || `${branch.district}（地址未提供）`}</span>{branch.phone && <small>{branch.phone}</small>}</div>}
        <label className="search"><Search size={17}/><input aria-label="搜尋飲品" value={props.productQuery} onChange={event => props.setProductQuery(event.target.value)} placeholder="飲品名稱或分類"/>{props.productQuery && <button aria-label="清除飲品搜尋" onClick={() => props.setProductQuery('')}><X size={14}/></button>}</label>
        <div className="drinkList productList">{props.filteredProducts.length ? props.filteredProducts.map(item => <button disabled={item.available === false} onClick={() => { props.selectProduct(item); setMobileStep(2); }} className={product?.id === item.id ? 'selected' : ''} key={item.id}><span className="drinkEmoji">{item.available === false ? '暫' : '飲'}</span><div><b>{item.name}</b><small>{item.category || '未分類'} · {formatPrice(item)}</small>{item.available === false && <em>{item.notes || '目前未供應'}</em>}</div>{product?.id === item.id && <Check size={16}/>}</button>) : <Empty title={brand.menuStatus === 'pending' ? '此品牌菜單待補' : '找不到符合的飲品'}/>}</div>
      </div>
      <div className="panel customPanel">
        <div className="panelTitle"><span><BadgeDollarSign size={17}/>價格與客製</span><small className={`menuBadge ${statusClass(brand.menuStatus)}`}>{brand.menuLabel}</small></div>
        {!product ? <Empty title="此品牌尚無飲品資料"/> : <>
          <div className="selectedProduct"><small>原始品名</small><b>{product.name}</b><span>{formatPrice(product)}</span>{product.seasonal && <em>季節限定{product.season ? ` · ${product.season}` : ''}</em>}</div>
          <Option title="價格／容量" items={productPrices.map(choice => ({ name: `${choice.label} $${choice.value}`, key: choice.key }))} value={props.priceKey} set={props.setPriceKey} keyField empty="價格未提供"/>
          <Option title="甜度" items={brand.customization.sugarOptions} value={props.sugar} set={props.setSugar} empty="甜度選項未提供"/>
          <Option title="冰量" items={brand.customization.iceOptions} value={props.ice} set={props.setIce} empty="冰量選項未提供"/>
          <Option title="加料（最多 3 種）" items={brand.customization.toppings} value={props.toppings} set={props.toggleTopping} multi empty="加料選項未提供"/>
        </>}
      </div>
    </div>
    <div className="review"><div><p className="eyebrow">YOUR RATING</p><h2>這杯值得幾顆星？</h2><div className="stars">{[1, 2, 3, 4, 5].map(value => <button aria-label={`${value} 星`} onClick={() => props.setRating(value)} className={value <= props.rating ? 'on' : ''} key={value}>★</button>)}<b>{props.rating}.0</b></div></div><label className="note"><span>備註 <small>（選填）</small></span><textarea maxLength="200" value={props.note} onChange={event => props.setNote(event.target.value)} placeholder="記下風味、口感，或任何想法…"/><small>{props.note.length} / 200</small></label><div className="again"><span>下次還會點？</span><div>{[['yes', '♥ 會！很喜歡'], ['maybe', '☺ 可能會'], ['no', '○ 不會']].map(([value, label]) => <button className={props.again === value ? 'on' : ''} onClick={() => props.setAgain(value)} key={value}>{label}</button>)}</div><button className="save" disabled={!product || product.available === false} onClick={props.saveRecord}>{props.saved ? <><Check size={18}/>已儲存！</> : <><CupSoda size={18}/>儲存這杯</>}</button></div></div>
    <div className="mobileStepActions"><button disabled={mobileStep === 0} onClick={() => setMobileStep(step => Math.max(0, step - 1))}>上一步</button><span>{mobileStep + 1} / 4</span><button disabled={mobileStep === 3} onClick={() => setMobileStep(step => Math.min(3, step + 1))}>{mobileStep === 2 ? '前往評分' : '下一步'}</button></div>
  </section>;
}

function Option({ title, items, value, set, multi = false, keyField = false, empty }) {
  if (!items.length) return <div className="option unavailableOption"><b>{title}</b><span><AlertCircle size={13}/>{empty}</span></div>;
  return <div className="option"><b>{title}</b><div className="optionGrid">{items.map(item => {
    const optionKey = keyField ? item.key : item.name;
    const isSelected = multi ? value.some(selected => selected.name === item.name) : value === optionKey;
    const suffix = item.price != null ? ` +$${item.price}` : '';
    return <button className={isSelected ? 'on' : ''} onClick={() => set(keyField ? item.key : multi ? item : item.name)} key={optionKey}>{item.name}{suffix}</button>;
  })}</div></div>;
}

function Empty({ title }) { return <div className="empty"><Search size={20}/><b>{title}</b><small>資料庫不會自動補上未知內容</small></div>; }
function Notice({ close, records }) { return <div className="notificationPanel"><div><b>通知</b><button aria-label="關閉通知" onClick={close}><X size={16}/></button></div><article><span>✓</span><p><b>嘉義資料庫 v12 已載入</b><small>{databaseMeta.brandCount} 品牌 · {databaseMeta.productCount} 項飲品</small></p></article><article><span>★</span><p><b>品飲紀錄安全保留</b><small>目前共有 {records.length} 杯本機紀錄</small></p></article><button className="markRead" onClick={close}>全部標示為已讀</button></div>; }
function RecordList({ records }) { return <div className="pageList">{records.length ? records.map(record => <article key={record.id}><span>🧋</span><div><b>{record.drink}</b><small>{record.shop}{record.branch ? ` · ${record.branch}` : ''} · {record.sugar || '甜度未記錄'} / {record.ice || '冰量未記錄'}</small></div><strong>{'★'.repeat(Math.round(record.rating || 0))} {record.rating}</strong></article>) : <Empty title="尚無品飲紀錄"/>}</div>; }
function DashboardPage({ page, records, average, goHome }) {
  let content;
  if (page === '品飲日記') content = <RecordList records={records}/>;
  else if (page === '品牌門市') content = <div className="brandCards">{brands.map(item => <article key={item.id}><div><b>{item.name}</b><span className={`menuBadge ${statusClass(item.menuStatus)}`}>{item.menuLabel}</span></div><small>{item.branches.length} 間已知分店 · {item.products.length} 項飲品</small></article>)}</div>;
  else if (page === '我的最愛') content = <RecordList records={records.filter(record => record.repurchase === 'yes')}/>;
  else if (page === '統計總覽') content = <div className="bigStats"><article><b>{records.length}</b><small>品飲總數</small></article><article><b>{average}</b><small>平均評分</small></article><article><b>{databaseMeta.brandCount}</b><small>資料庫品牌</small></article><article><b>{databaseMeta.productCount}</b><small>資料庫飲品</small></article></div>;
  else if (page === '標籤管理') content = <div className="tagCloud">{[...new Set(records.flatMap(record => [record.sugar, record.ice, ...(record.toppings || []).map(item => typeof item === 'string' ? item : item.name)].filter(Boolean)))].map(item => <span key={item}># {item}</span>)}</div>;
  else content = <div className="settingsList"><label><span>資料庫版本</span><small>{databaseMeta.databaseVersion}</small></label><label><span>品牌／分店／飲品</span><small>{databaseMeta.brandCount}／{databaseMeta.branchCount}／{databaseMeta.productCount}</small></label><label><span>紀錄儲存</span><small>保存在此瀏覽器的 siplog-records</small></label><label><span>資料範圍</span><small>{databaseMeta.city}</small></label></div>;
  return <section className="contentPage"><div className="contentPageHead"><div><p className="eyebrow">SIPLOG COLLECTION</p><h2>{page}</h2></div><button onClick={goHome}><Plus size={16}/>新增品飲紀錄</button></div>{content}</section>;
}
function RightPanel({ records, average, go }) { return <section className="right"><div className="rightHead"><div><p className="eyebrow">TASTING LOG</p><h2>近期品飲</h2></div><button onClick={() => go('品飲日記')}>查看全部 <ChevronRight size={15}/></button></div><div className="recent">{records.length ? records.slice(0, 4).map(record => <article key={record.id}><span className="miniCup">🧋</span><div><b>{record.drink}</b><small>{record.shop} · {record.sugar || '—'} / {record.ice || '—'}</small><span className="miniStars">{'★'.repeat(Math.round(record.rating || 0))}<em>{record.rating}</em></span></div><time>{record.date}</time></article>) : <div className="rightEmpty">儲存第一杯後會顯示在這裡</div>}</div><div className="summary"><p className="eyebrow">DATABASE OVERVIEW</p><div><strong>{databaseMeta.brandCount}</strong><span><b>嘉義市飲料品牌</b><small>{databaseMeta.branchCount} 間已知分店</small></span></div><div className="dbCounts"><span><b>{databaseMeta.productCount}</b><small>飲品</small></span><span><b>{average}</b><small>你的均分</small></span></div></div><div className="stats"><div><Database/><b>v12</b><small>資料版本</small></div><div><Heart/><b>{records.filter(record => record.repurchase === 'yes').length}</b><small>願意再點</small></div></div></section>; }

createRoot(document.getElementById('root')).render(<App/>);
