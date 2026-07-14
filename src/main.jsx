import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Home, BookOpen, Heart, BarChart3, Tag, Settings, Search, MapPin, Bell, Plus, Store, CupSoda, ChevronRight, Check, RotateCcw} from 'lucide-react';
import './styles.css';

const shops=[
  {id:1,name:'春水堂',branch:'台北中山店',distance:'350 公尺',color:'#b98556',drinks:[['珍珠奶茶',75,'🧋'],['鐵觀音拿鐵',80,'🥤'],['翡翠檸檬',70,'🍋']]},
  {id:2,name:'五十嵐',branch:'中山店',distance:'450 公尺',color:'#2d73b9',drinks:[['四季春青茶',40,'🍵'],['波霸奶茶',60,'🧋'],['檸檬綠',55,'🍋']]},
  {id:3,name:'麻古茶坊',branch:'南京店',distance:'600 公尺',color:'#d94943',drinks:[['芝芝芒果果粒',95,'🥭'],['金萱雙Q',65,'🧋'],['翡翠柳橙',75,'🍊']]},
  {id:4,name:'可不可熟成紅茶',branch:'林森店',distance:'750 公尺',color:'#173d56',drinks:[['熟成紅茶',40,'🍂'],['胭脂多多',60,'🥤'],['春芽冷露',45,'🌱']]}
];
const sugars=['無糖','微糖','半糖','少糖','全糖'], ices=['去冰','微冰','少冰','正常冰','熱飲'], toppings=['珍珠','波霸','椰果','布丁','仙草','寒天'];
const seed=[
 {id:101,shop:'春水堂',drink:'珍珠奶茶',rating:4,sugar:'半糖',ice:'少冰',repurchase:'yes',date:'今天'},
 {id:102,shop:'五十嵐',drink:'鐵觀音拿鐵',rating:5,sugar:'微糖',ice:'少冰',repurchase:'yes',date:'昨天'},
 {id:103,shop:'麻古茶坊',drink:'翡翠檸檬',rating:3.5,sugar:'半糖',ice:'微冰',repurchase:'maybe',date:'2 天前'}
];

function App(){
 const [shopQ,setShopQ]=useState(''),[drinkQ,setDrinkQ]=useState(''),[shop,setShop]=useState(shops[0]),[drink,setDrink]=useState(shops[0].drinks[0]);
 const [sugar,setSugar]=useState('半糖'),[ice,setIce]=useState('少冰'),[tops,setTops]=useState(['珍珠']),[rating,setRating]=useState(4),[note,setNote]=useState('茶香很順口，珍珠軟硬剛好。'),[again,setAgain]=useState('yes');
 const [saved,setSaved]=useState(false),[records,setRecords]=useState(()=>{try{return JSON.parse(localStorage.getItem('siplog-records'))||seed}catch{return seed}});
 const filtered=shops.filter(x=>(x.name+x.branch).includes(shopQ));
 const drinks=shop.drinks.filter(x=>x[0].includes(drinkQ));
 const average=(records.reduce((a,x)=>a+x.rating,0)/records.length).toFixed(1);
 function pickShop(s){setShop(s);setDrink(s.drinks[0]);setDrinkQ('')}
 function toggleTop(t){setTops(v=>v.includes(t)?v.filter(x=>x!==t):v.length<3?[...v,t]:v)}
 function save(){const r={id:Date.now(),shop:shop.name,drink:drink[0],rating,sugar,ice,toppings:tops,note,repurchase:again,date:'剛剛'};const next=[r,...records];setRecords(next);localStorage.setItem('siplog-records',JSON.stringify(next));setSaved(true);setTimeout(()=>setSaved(false),2200)}
 return <div className="app">
  <aside><div className="brand"><span>🧋</span><b>SipLog</b><small>喝飲誌</small></div><nav>{[[Home,'首頁'],[BookOpen,'品飲日記'],[Store,'收藏店家'],[Heart,'我的最愛'],[BarChart3,'統計總覽'],[Tag,'標籤管理']].map(([I,t],i)=><button className={i===0?'active':''} key={t}><I size={19}/>{t}</button>)}</nav><div className="asideBottom"><button><Settings size={19}/>設定</button><div className="profile"><span>小</span><div><b>小茶日常</b><small>熱愛每一杯好茶</small></div></div></div></aside>
  <main><header><div><p className="eyebrow">PERSONAL DRINK JOURNAL</p><h1>今天想喝什麼？ <span>🧋</span></h1><p>記錄每一杯，找到你的命定飲料。</p></div><div className="headActions"><button className="icon"><Bell size={20}/><i/></button><button className="primary" onClick={()=>document.querySelector('.builder').scrollIntoView({behavior:'smooth'})}><Plus size={18}/>快速記錄</button></div></header>
   <section className="builder">
    <div className="steps">{['搜尋店家','選擇飲料','甜度與冰量','評分與備註'].map((x,i)=><div className="step" key={x}><span>{i+1}</span><b>{x}</b>{i<3&&<em/>}</div>)}</div>
    <div className="columns">
     <div className="panel shopPanel"><div className="panelTitle"><span><Store size={17}/>搜尋店家</span><small>{filtered.length} 間店家</small></div><label className="search"><Search size={17}/><input value={shopQ} onChange={e=>setShopQ(e.target.value)} placeholder="輸入店名或分店"/></label><div className="chips"><span><MapPin size={14}/>附近店家</span><span>台北市⌄</span></div><div className="shopList">{filtered.map(s=><button onClick={()=>pickShop(s)} className={shop.id===s.id?'selected':''} key={s.id}><i style={{background:s.color}}>{s.name.slice(0,1)}</i><div><b>{s.name} · {s.branch}</b><small>中山區 · 距離 {s.distance}</small></div>{shop.id===s.id&&<Check size={16}/>}</button>)}</div></div>
     <div className="panel drinkPanel"><div className="panelTitle"><span><CupSoda size={17}/>選擇飲料</span><small>{shop.name}</small></div><label className="search"><Search size={17}/><input value={drinkQ} onChange={e=>setDrinkQ(e.target.value)} placeholder="搜尋飲料名稱"/></label><div className="drinkList">{drinks.map(d=><button onClick={()=>setDrink(d)} className={drink[0]===d[0]?'selected':''} key={d[0]}><span className="drinkEmoji">{d[2]}</span><div><b>{d[0]}</b><small>NT$ {d[1]}</small></div>{drink[0]===d[0]&&<Check size={16}/>}</button>)}</div></div>
     <div className="panel customPanel"><div className="panelTitle"><span>客製這一杯</span><small>最多 3 種配料</small></div><Option title="甜度" items={sugars} value={sugar} set={setSugar}/><Option title="冰量" items={ices} value={ice} set={setIce}/><div className="option"><b>加料</b><div className="optionGrid">{toppings.map(t=><button className={tops.includes(t)?'on':''} onClick={()=>toggleTop(t)} key={t}>{t}</button>)}</div></div></div>
    </div>
    <div className="review"><div><p className="eyebrow">YOUR RATING</p><h2>這杯值得幾顆星？</h2><div className="stars">{[1,2,3,4,5].map(n=><button onClick={()=>setRating(n)} className={n<=rating?'on':''} key={n}>★</button>)}<b>{rating}.0</b></div></div><label className="note"><span>備註 <small>（選填）</small></span><textarea maxLength="200" value={note} onChange={e=>setNote(e.target.value)} placeholder="記下風味、口感，或任何想法…"/><small>{note.length} / 200</small></label><div className="again"><span>下次還會點？</span><div>{[['yes','♥ 會！很喜歡'],['maybe','☺ 可能會'],['no','○ 不會']].map(([v,t])=><button className={again===v?'on':''} onClick={()=>setAgain(v)} key={v}>{t}</button>)}</div><button className="save" onClick={save}>{saved?<><Check size={18}/>已儲存！</>:<><CupSoda size={18}/>儲存這杯</>}</button></div></div>
   </section>
  </main>
  <section className="right"><div className="rightHead"><div><p className="eyebrow">TASTING LOG</p><h2>近期品飲</h2></div><button>查看全部 <ChevronRight size={15}/></button></div><div className="recent">{records.slice(0,4).map(r=><article key={r.id}><span className="miniCup">🧋</span><div><b>{r.drink}</b><small>{r.shop} · {r.sugar} / {r.ice}</small><span className="miniStars">{'★'.repeat(Math.round(r.rating))}<em>{r.rating}</em></span></div><time>{r.date}</time></article>)}</div><div className="summary"><p className="eyebrow">RATING OVERVIEW</p><div><strong>{average}</strong><span><b>平均評分</b><small>{records.length} 杯品飲紀錄</small></span></div><div className="bar"><i style={{width:`${Number(average)/5*100}%`}}/></div></div><div className="stats"><div><CupSoda/><b>{records.length}</b><small>品飲總數</small></div><div><Heart/><b>{records.filter(x=>x.repurchase==='yes').length}</b><small>願意再點</small></div></div><button className="reset" onClick={()=>{localStorage.removeItem('siplog-records');setRecords(seed)}}><RotateCcw size={14}/>重設示範資料</button></section>
 </div>
}
function Option({title,items,value,set}){return <div className="option"><b>{title}</b><div className="optionGrid">{items.map(x=><button className={value===x?'on':''} onClick={()=>set(x)} key={x}>{x}</button>)}</div></div>}
createRoot(document.getElementById('root')).render(<App/>);
