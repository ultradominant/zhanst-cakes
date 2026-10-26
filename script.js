'use strict';
(() => {
const $=s=>document.querySelector(s);
const config=window.CAKE_SITE||{products:[]};
const ui=window.CAKE_TEXTS||{};
const tr=(key,fallback)=>Object.hasOwn(ui,key)?ui[key]:fallback;
const categories=Object.freeze({cake:tr('cake','Торты'),mochi:tr('mochi','Моти'),bento:tr('bento','Бенто')});
const products=(Array.isArray(config.products)?config.products:[]).filter(p=>p&&Number.isSafeInteger(p.id)&&Object.hasOwn(categories,p.category));
const moneyNumber=n=>new Intl.NumberFormat(tr('locale','ru-RU'),{maximumFractionDigits:2}).formatToParts(n).map(part=>part.type==='group'?'\u00a0':part.type==='decimal'?',':part.value).join('');
const price=p=>typeof p.price==='number'&&Number.isFinite(p.price)&&p.price>=0?moneyNumber(p.price)+(p.unit==='piece'?tr('pieceUnit',' ₸ / шт.'):p.unit==='item'?tr('itemUnit',' ₸ / торт'):tr('kgUnit',' ₸ / кг')):tr('priceRequest','Цена по запросу');
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n}
function btn(text,cls,fn){const b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b}
function safeImage(value){return typeof value==='string'&&/^images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g|avif)$/i.test(value)?value:null}
function photo(p){const wrap=el('div','photo-slot photo-'+(Object.hasOwn(categories,p.category)?p.category:'default')),img=el('img');const path=safeImage(p.image);img.src=path||'images/placeholder.svg';img.alt=path?String(p.alt||p.name):'';img.width=Number.isSafeInteger(p.imageWidth)&&p.imageWidth>0?p.imageWidth:800;img.height=Number.isSafeInteger(p.imageHeight)&&p.imageHeight>0?p.imageHeight:1000;img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{if(img.getAttribute('src')!=='images/placeholder.svg'){img.src='images/placeholder.svg';img.alt=tr('photoUnavailable','Фотография пока недоступна')}});wrap.append(img);if(!path){wrap.classList.add('is-placeholder');wrap.append(el('span','',p.placeholder||tr('photoSoon','Фото скоро появится')));}return wrap}
function contactUrl(kind,p){const value=kind==='phone'?config.phone:kind==='whatsapp'?config.whatsapp:config.instagram;
 if(kind==='instagram')return typeof value==='string'&&/^[a-zA-Z0-9_.]{1,30}$/.test(value)?'https://www.instagram.com/'+value+'/':null;
 if(typeof value!=='string'||!/^\+?[1-9]\d{7,14}$/.test(value))return null;
 if(kind==='phone')return 'tel:+'+value.replace(/^\+/,'');
 const message=ui.locale==='kk-KZ'?(p?`Сәлеметсіз бе! «${p.name}» десертіне тапсырыс бергім келеді. Толығырақ білсем деп едім.`:'Сәлеметсіз бе! Мерекеге тортқа тапсырыс бергім келеді.'):(p?`Здравствуйте! Меня интересует «${p.name}». Хочу обсудить детали.`:'Здравствуйте! Хочу обсудить торт для моего праздника.');
 return 'https://wa.me/'+value.replace(/^\+/,'')+'?text='+encodeURIComponent(message);
}
function show(dialog){dialog.showModal();document.body.classList.add('dialog-open')}
function hide(dialog){dialog.close();if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open')}
function detail(p){const content=$('#dialog-content');if(!content)return;
 const heading=el('h2','',p.name);heading.id='dialog-title';
 const link=el('a','button',tr('askWhatsapp','Обсудить в WhatsApp ↗'));const url=contactUrl('whatsapp',p);link.href=url||tr('contactsPage','contacts.html');const instagram=el('a','button secondary',tr('askInstagram','Написать в Instagram ↗'));instagram.href=contactUrl('instagram',p)||tr('contactsPage','contacts.html');
 content.replaceChildren(photo(p),el('p','eyebrow',categories[p.category]),heading,el('p','product-price',price(p)),el('p','dialog-size',p.size||''),el('p','',p.description||''),link,instagram);show($('#product-dialog'));
}
function card(p){const node=el('article','product-card'),imageButton=btn('','photo-button',()=>detail(p));imageButton.setAttribute('aria-label',tr('detailsLabel','Подробнее: ')+p.name);imageButton.append(photo(p));node.append(imageButton,el('p','product-category',categories[p.category]),el('h3','',p.name),el('p','product-price',price(p)),el('p','product-size',p.size||''),btn(tr('details','Подробнее ↗'),'product-link',()=>detail(p)));return node}
const featured=$('#featured-products');if(featured)featured.replaceChildren(...products.filter(p=>p.featured).slice(0,3).map(card));
const categoryNotes = ui.categoryNotes || Object.freeze({
 all: 'Торты - цена за 1 кг, бенто - за торт, моти - за штуку. Выберите категорию, чтобы узнать условия заказа. Доставка оплачивается отдельно.',
 cake: 'Цены тортов указаны за 1 кг. Молочная девочка, Кофейная девочка и Вупи пай - от 1 кг, остальные начинки - от 1,5 кг. Оформление и итоговую стоимость согласуем при заказе. Доставка оплачивается отдельно и не входит в стоимость торта.',
 mochi: 'Моти - 1 000 ₸ за штуку. Наличие вкусов и количество уточняйте при заказе. Доставка оплачивается отдельно и не входит в стоимость моти.',
 bento: 'Цена указана за бенто-торт с выбранным типом декора. Фотографии - примеры оформления. Пришлите свою картинку, надпись или идею: декор, начинку, вес и итоговую стоимость согласуем при заказе. Доставка оплачивается отдельно и не входит в стоимость бенто.'
});
let category='all',sort='default',page=1;const perPage=6;
const requested=new URLSearchParams(window.location.search).get('category');if(Object.hasOwn(categories,requested))category=requested;
function render(){const target=$('#products');if(!target)return;const note=$('#category-note');if(note)note.textContent=categoryNotes[category];document.querySelectorAll('[data-language-link]').forEach(a=>{const path=a.dataset.languageLink;if(/^(?:catalog|catalog-kk)\.html$/.test(path))a.href=path+(category==='all'?'':'?category='+category);});const list=products.filter(p=>category==='all'||p.category===category);
 if(sort!=='default')list.sort((a,b)=>{const av=typeof a.price==='number'&&Number.isFinite(a.price)?a.price:null,bv=typeof b.price==='number'&&Number.isFinite(b.price)?b.price:null;if(av===null)return bv===null?0:1;if(bv===null)return -1;return sort==='asc'?av-bv:bv-av});
 const pages=Math.ceil(list.length/perPage);page=Math.max(1,Math.min(page,pages||1));target.replaceChildren(...list.slice((page-1)*perPage,page*perPage).map(card));
 $('#catalog-status').textContent=list.length?(ui.locale==='kk-KZ'?`Өнім саны: ${list.length} · ${pages>1?pages+' беттің '+page+'-беті':categories[category]||'барлық өнімдер'}`:`Позиций: ${list.length} · ${pages>1?'страница '+page+' из '+pages:categories[category]||'вся коллекция'}`):tr('emptyCategory','В этой категории пока нет десертов.');
 const pagination=[];if(pages>1)for(let i=1;i<=pages;i++){const b=btn(String(i),i===page?'active':'',()=>{page=i;render();$('.toolbar').scrollIntoView({block:'start'})});b.setAttribute('aria-label',ui.locale==='kk-KZ'?i+'-бет':'Страница '+i);if(i===page)b.setAttribute('aria-current','page');pagination.push(b)}$('.pagination').replaceChildren(...pagination);
 document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.filter!=='all'&&!Object.hasOwn(categories,b.dataset.filter))return;category=b.dataset.filter;page=1;render()}));
$('#sort')?.addEventListener('change',e=>{if(!['default','asc','desc'].includes(e.target.value))return;sort=e.target.value;page=1;render()});
document.querySelectorAll('[data-contact]').forEach(a=>{const kind=a.dataset.contact;if(!['phone','whatsapp','instagram'].includes(kind))return;const url=contactUrl(kind);if(url){a.href=url;const label=a.querySelector('small');if(label)label.textContent=kind==='instagram'?'@'+config.instagram:kind==='phone'?config.phone:config.whatsapp}else a.addEventListener('click',e=>{e.preventDefault();show($('#contact-dialog'))})});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close').addEventListener('click',()=>hide(d));d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open')});d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)hide(d)})});
const menu=$('.menu-toggle'),nav=$('#navigation');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?tr('closeMenu','Закрыть меню'):tr('openMenu','Открыть меню'))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',tr('openMenu','Открыть меню'))}});
render();document.documentElement.classList.add('js');
})();
