
const API_BASE_URL = 'https://api.oops-merch.ru';
const API_INIT_AUTH_PATH = '/init-auth';

if (typeof window.pageLoaded === 'undefined') window.pageLoaded = false;
window.dataLoaded = true;
let ITEMS_TOTAL_PRICE = 0;

window.formatPrice = (price) => {
    if (typeof price !== 'number') return '0 ₽';
    return price.toLocaleString('ru-RU') + ' ₽';
};

window.resolveImagePath = (rawPath) => {
    if (!rawPath) return '';
    if (rawPath.startsWith('http')) return rawPath;
    let cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    if (!cleanPath.startsWith('images/') && !cleanPath.includes('/')) {
        cleanPath = 'images/' + cleanPath;
    }
    return '/' + cleanPath; 
};

window.renderProductCardHTML = (product, productUrl) => {
    const priceFormatted = window.formatPrice(product.price);
    const imagePath = window.resolveImagePath(product.image);
    return `
        <article class="product-card">
            <a href="${productUrl}" class="product-card__link" data-no-copy> 
                <div class="product-card__image-block" style="background-image: url('${imagePath}');"></div>
                <div class="product-card__info">
                    <h3 class="product-card__name">${product.name}</h3>
                    <p class="product-card__price">${priceFormatted}</p>
                </div>
            </a>
            <a href="${productUrl}" class="product-card__add-to-cart" data-no-copy>
                <i class="fas fa-info-circle"></i><span>Подробнее</span>
            </a>
        </article>
    `;
};

window.removeNavigation = () => {
    const existing = document.querySelector('.nav-header-wrapper');
    if (existing) existing.remove();
    const title = document.querySelector('.section-title');
    if (title) { title.style.marginTop = ''; title.style.paddingTop = ''; }
};

window.renderNavigation = (slug, type, currentPageName) => {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.removeNavigation();
        return;
    }
    const main = document.querySelector('.main-content');
    if (!main) return;
    window.removeNavigation();

    const nameMap = { 
        'hoodie': 'Худи', 'zip-hoodie': 'Зип-худи', 'tshirt': 'Футболки', 
        'long-sleeve': 'Лонгсливы', 'sweatshirt': 'Свитшоты', 'you-need': 'You Need' 
    };
    
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-header-wrapper';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn-premium nav-btn-effect';
    backBtn.setAttribute('data-no-copy', '');
    backBtn.onclick = () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = '/';
    };
    backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> Назад`;

    const divider = document.createElement('div');
    divider.className = 'nav-divider';

    const breadcrumbs = document.createElement('div');
    breadcrumbs.className = 'breadcrumbs-premium';
    
    let crumbsHtml = '';
    const separator = '<i class="fas fa-chevron-right nav-separator" style="font-size: 0.65rem; opacity: 0.5; margin: 0 6px;"></i>';

    if (type === 'collection') {
         crumbsHtml += `<a href="/" onclick="sessionStorage.setItem('oopsMode', 'cols');" class="nav-btn-effect" data-no-copy>Коллекции</a>`;
         if (slug && nameMap[slug]) {
             crumbsHtml += separator;
             crumbsHtml += `<a href="/?filter=${slug}&type=collection" class="nav-btn-effect" data-no-copy>${nameMap[slug]}</a>`;
         }
    } 
    else if (type === 'category' && slug && slug !== 'all') {
         crumbsHtml += `<a href="/" onclick="sessionStorage.removeItem('oopsFilter'); sessionStorage.removeItem('oopsType');" class="nav-btn-effect" data-no-copy>Главная</a>`;
         if (nameMap[slug]) {
             crumbsHtml += separator;
             crumbsHtml += `<a href="/?filter=${slug}&type=category" class="nav-btn-effect" data-no-copy>${nameMap[slug]}</a>`;
         }
    }
    else {
         crumbsHtml += `<a href="/" onclick="sessionStorage.removeItem('oopsFilter'); sessionStorage.removeItem('oopsType');" class="nav-btn-effect" data-no-copy>Главная</a>`;
    }

    if (currentPageName) {
        crumbsHtml += separator;
        crumbsHtml += `<span class="nav-btn-static" data-no-copy>${currentPageName}</span>`;
    }
    
    breadcrumbs.innerHTML = crumbsHtml;
    wrapper.appendChild(backBtn);
    wrapper.appendChild(divider);
    wrapper.appendChild(breadcrumbs);
    main.insertBefore(wrapper, main.firstChild);
    
    const title = main.querySelector('.section-title');
    if (title) { title.style.marginTop = '0'; title.style.paddingTop = '0'; }
};

window.menuNavigate = (slug, type) => {
    if (type === 'collection') {
        window.switchCatalogMode('collections');
    } else {
        window.switchCatalogMode('categories');
    }
    window.filterProducts(slug, type, false);
    
    const menu = document.getElementById('menu');
    const overlay = document.querySelector('.menu-overlay');
    if (menu && menu.classList.contains('is-active')) {
        menu.classList.remove('is-active');
        if (overlay) overlay.classList.remove('is-active');
        document.body.classList.remove('menu-open');
        setTimeout(() => {
            document.querySelectorAll('.submenu').forEach(el => {
                el.classList.remove('submenu--open');
                el.style.maxHeight = null;
            });
            document.querySelectorAll('.submenu-icon').forEach(el => {
                el.style.transform = 'rotate(0deg)';
            });
        }, 300);
    }
    setTimeout(() => {
        const target = document.getElementById('home-category-title');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

window.switchCatalogMode = (mode) => {
    const container = document.querySelector('.catalog-header-toggle');
    if (!container) return; 
    const btnCats = document.getElementById('mode-btn-cats');
    const btnCols = document.getElementById('mode-btn-cols');
    const gridCats = document.getElementById('buttons-grid-cats');
    const gridCols = document.getElementById('buttons-grid-cols');
    if (mode === 'categories') {
        btnCats.classList.add('active'); btnCats.classList.remove('inactive');
        btnCols.classList.add('inactive'); btnCols.classList.remove('active');
        container.classList.remove('collections-mode');
        gridCats.style.display = 'flex';
        gridCols.style.display = 'none';
        window.filterProducts('all', 'category');
    } else {
        btnCols.classList.add('active'); btnCols.classList.remove('inactive');
        btnCats.classList.add('inactive'); btnCats.classList.remove('active');
        container.classList.add('collections-mode');
        gridCats.style.display = 'none';
        gridCols.style.display = 'flex';
        const firstCollectionBtn = gridCols.querySelector('.category-btn');
        if (firstCollectionBtn) {
            window.filterProducts(firstCollectionBtn.dataset.slug, 'collection');
        }
    }
};

window.filterProducts = (slug, type = 'category', fromHistory = false) => {
    const isHomePage = document.getElementById('products-grid');
    if (!isHomePage) {
        window.location.href = `/?filter=${slug}&type=${type}`;
        return;
    }
    sessionStorage.setItem('oopsFilter', slug);
    sessionStorage.setItem('oopsType', type);
    
    const gridId = type === 'category' ? 'buttons-grid-cats' : 'buttons-grid-cols';
    const grid = document.getElementById(gridId);
    if (grid) {
        grid.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.slug === slug);
        });
        const activeBtn = grid.querySelector(`.category-btn[data-slug="${slug}"]`);
        if(activeBtn) activeBtn.classList.add('active');
    }
    const titleEl = document.getElementById('products-list-title');
    const nameMap = { 
        'all': 'Популярные товары', 'hoodie': 'Худи', 'zip-hoodie': 'Зип-худи', 
        'tshirt': 'Футболки', 'long-sleeve': 'Лонгсливы', 'sweatshirt': 'Свитшоты',
        'you-need': 'Коллекция You Need'
    };
    if (titleEl) titleEl.textContent = nameMap[slug] || 'Товары';
    renderHomePageProducts(slug, type);
};

const renderHomePageProducts = (filterSlug = 'all', type = 'category') => {
    const productsContainer = document.getElementById('products-grid');
    if (!productsContainer) return;
    
    if (typeof window.productsData === 'undefined') {
        productsContainer.innerHTML = '<p class="no-goods">Ошибка загрузки данных</p>';
        return;
    }
    
    let filteredProducts = window.productsData.filter(p => p.isAvailable);
    
    if (type === 'category') {
        if (filterSlug !== 'all') filteredProducts = filteredProducts.filter(p => p.category === filterSlug);
    } else if (type === 'collection') {
        filteredProducts = filteredProducts.filter(p => p.collection === filterSlug);
    }
    
    productsContainer.innerHTML = ''; 
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p class="no-goods">В этом разделе пока нет товаров</p>';
        return;
    }

    filteredProducts.forEach(product => {
        let productUrl = `/${product.slug}/`; 
        const cardHTML = window.renderProductCardHTML(product, productUrl);
        productsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
};

const updateCartTotal = () => {
    const itemsPriceEl = document.getElementById('items-total-price');
    const grandTotalEl = document.getElementById('cart-grand-total-price');
    if (itemsPriceEl) itemsPriceEl.textContent = window.formatPrice(ITEMS_TOTAL_PRICE);
    if (grandTotalEl) grandTotalEl.textContent = window.formatPrice(ITEMS_TOTAL_PRICE);
};

const initOrderProcess = async () => {
    const cart = JSON.parse(localStorage.getItem('oopsCart')) || []; 
    const btn = document.getElementById('cart-action-btn');
    if (cart.length === 0) { alert('Корзина пуста'); return; }
    if (btn) { btn.textContent = 'Обработка...'; btn.disabled = true; }
    const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartData = { items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, size: item.size, quantity: item.quantity, image: item.imagePathRaw })), total_amount: totalAmount };
    try {
        const response = await fetch(API_BASE_URL + API_INIT_AUTH_PATH, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cartData) 
        });
        if (response.ok) {
            const result = await response.json();
            if (result.telegram_bot_url) { 
                localStorage.setItem('oopsCart', JSON.stringify([])); 
                window.updateCartUI(); 
                document.getElementById('cart-overlay')?.classList.remove('open');
                document.body.classList.remove('modal-open');
                window.location.href = result.telegram_bot_url; 
                return; 
            }
        }
        alert('Ошибка оформления. Напишите нам: @oopssupport');
    } catch (e) { alert('Ошибка соединения с сервером'); } 
    finally { if (btn) { btn.textContent = 'Оформить заказ в Telegram'; btn.disabled = false; } }
};

const initApp = () => {
    const isHomepage = document.getElementById('products-grid');
    if (isHomepage) {
        window.removeNavigation(); 
        
        const params = new URLSearchParams(window.location.search);
        const filter = params.get('filter');
        const type = params.get('type');
        if (filter && type) {
             if (type === 'collection') window.switchCatalogMode('collections');
             else window.switchCatalogMode('categories');
             window.filterProducts(filter, type, true);
        } else {
            window.filterProducts('all', 'category', true);
        }
        
        const heroSlidesData = [
            { img: "images/banner-01.jpg", title: "NEW COLLECTION", subtitle: "WINTER 2025" },
            { img: "images/banner-02.jpg", title: "BLACK EDITION", subtitle: "STRICT MINIMALISM" },
            { img: "images/banner-03.jpg", title: "YOU NEED PAIN", subtitle: "LIMITED DROP" }
        ];
        const heroContainer = document.getElementById('hero-slider-container');
        if (heroContainer) { 
            heroContainer.innerHTML = heroSlidesData.map((slide, index) => {
                const bgPath = window.resolveImagePath(slide.img);
                return `<div class="hero-slide ${index === 0 ? 'active' : ''}"><img src="${bgPath}" class="hero-image" alt="${slide.title}"><div class="hero-content"><h3 class="hero-subtitle">${slide.subtitle}</h3><h2 class="hero-title">${slide.title}</h2><button onclick="document.getElementById('home-category-title').scrollIntoView({behavior:'smooth'})" class="hero-btn">Каталог</button></div></div>`;
            }).join('');
            let currentIdx = 0;
            setInterval(() => {
                const slides = document.querySelectorAll('.hero-slide');
                if (slides.length > 0) {
                    slides[currentIdx].classList.remove('active');
                    currentIdx = (currentIdx + 1) % slides.length;
                    slides[currentIdx].classList.add('active');
                }
            }, 5000);
        }
    }

    const menu = document.getElementById('menu');
    const overlay = document.querySelector('.menu-overlay') || document.createElement('div');
    if (!document.querySelector('.menu-overlay')) {
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    const toggleMenu = (show) => { 
        menu?.classList.toggle('is-active', show); 
        overlay.classList.toggle('is-active', show); 
        document.body.classList.toggle('menu-open', show); 
    };
    document.querySelector('.header__burger-btn')?.addEventListener('click', () => toggleMenu(true));
    document.querySelector('.side-menu__close-btn')?.addEventListener('click', () => toggleMenu(false));
    overlay.addEventListener('click', () => toggleMenu(false));
    document.querySelectorAll('.menu-item__toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const sub = btn.nextElementSibling;
            const icon = btn.querySelector('.submenu-icon');
            if (sub) { 
                const isOpen = sub.classList.toggle('submenu--open'); 
                sub.style.maxHeight = isOpen ? sub.scrollHeight + "px" : null;
                if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    });

    let cart = JSON.parse(localStorage.getItem('oopsCart')) || []; 
    const headerCart = document.querySelector('.header__cart');
    let badge = document.querySelector('.cart-badge');
    if (headerCart && !badge) {
        badge = document.createElement('div'); 
        badge.className = 'cart-badge'; 
        badge.style.display = 'none'; 
        headerCart.appendChild(badge);
    }
    
    window.updateCartUI = () => {
        cart = JSON.parse(localStorage.getItem('oopsCart')) || [];
        const qty = cart.reduce((s, i) => s + i.quantity, 0); 
        if (badge) {
            badge.style.display = qty > 0 ? 'flex' : 'none'; 
            badge.textContent = qty > 9 ? '9+' : qty; 
        }
        const list = document.getElementById('cart-list'); 
        const btn = document.getElementById('cart-action-btn');
        if (cart.length === 0) { 
            ITEMS_TOTAL_PRICE = 0; 
            if (list) list.innerHTML = '<div class="cart-empty-msg">Корзина пуста</div>'; 
            if (btn) btn.disabled = true; 
        } else {
            if (btn) btn.disabled = false; 
            let total = 0; 
            if (list) {
                list.innerHTML = cart.map((item, i) => {
                    total += item.price * item.quantity;
                    const cleanImg = window.resolveImagePath(item.imagePathRaw);
                    return `<div class="cart-item"><div class="cart-item__img" style="background-image: url('${cleanImg}');"></div><div class="cart-item__details"><div class="cart-item__name">${item.name}</div><div class="cart-item__variant">Размер: ${item.size}</div><div class="cart-item__controls"><div class="qty-selector-small"><button class="qty-btn-small" onclick="window.changeCartQty(${i}, -1)">-</button><div class="qty-val-small">${item.quantity}</div><button class="qty-btn-small" onclick="window.changeCartQty(${i}, 1)">+</button></div><div class="cart-item__price">${window.formatPrice(item.price * item.quantity)}</div></div><div class="cart-item__remove" onclick="window.removeCartItem(${i})">Удалить</div></div></div>`;
                }).join(''); 
            }
            ITEMS_TOTAL_PRICE = total;
        } 
        updateCartTotal();
    };
    window.changeCartQty = (i, d) => { if (cart[i].quantity + d > 0) cart[i].quantity += d; else if (confirm('Удалить товар из корзины?')) cart.splice(i, 1); localStorage.setItem('oopsCart', JSON.stringify(cart)); updateCartUI(); };
    window.removeCartItem = (i) => { cart.splice(i, 1); localStorage.setItem('oopsCart', JSON.stringify(cart)); updateCartUI(); };
    window.addToCartGlobal = (obj) => { 
        cart = JSON.parse(localStorage.getItem('oopsCart')) || [];
        const item = { id: null, name: 'Товар', price: 0, size: '-', quantity: 1, productUrlRaw: '#', imagePathRaw: '', ...obj }; 
        const ex = cart.find(i => i.id === item.id && i.size === item.size); 
        if (ex) ex.quantity += item.quantity; else cart.push(item); 
        localStorage.setItem('oopsCart', JSON.stringify(cart)); window.updateCartUI(); 
        document.getElementById('cart-overlay')?.classList.add('open'); document.body.classList.add('modal-open'); 
    };
    document.querySelector('.header__cart')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('cart-overlay')?.classList.add('open'); document.body.classList.add('modal-open'); });
    document.getElementById('cart-close')?.addEventListener('click', () => { document.getElementById('cart-overlay')?.classList.remove('open'); document.body.classList.remove('modal-open'); });
    if (document.getElementById('cart-action-btn')) document.getElementById('cart-action-btn').onclick = initOrderProcess;

    const logo = document.querySelector('.header__logo');
    if(logo) {
        logo.addEventListener('click', () => {
             sessionStorage.removeItem('oopsFilter'); 
             sessionStorage.removeItem('oopsType');
        });
    }

    /* --- SEARCH LOGIC (FIXED) --- */
    const searchTrigger = document.getElementById('search-trigger');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');
    const searchResults = document.getElementById('search-results');
    const header = document.getElementById('main-header');

    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            header.classList.add('search-active');
            setTimeout(() => searchInput.focus(), 100);
        });
    }

    const closeSearch = () => {
        header.classList.remove('search-active');
        searchInput.value = '';
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        searchInput.blur();
    };

    if (searchClose) {
        searchClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSearch();
        });
    }

    document.addEventListener('click', (e) => {
        if (header.classList.contains('search-active')) {
            if (!searchContainer.contains(e.target) && !searchResults.contains(e.target) && e.target !== searchInput) {
                closeSearch();
            }
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length < 1) {
                searchResults.classList.remove('active');
                return;
            }
            const matches = window.productsData.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
            if (matches.length > 0) {
                searchResults.classList.add('active');
                searchResults.innerHTML = matches.map(product => {
                    const regex = new RegExp(`(${query})`, 'gi');
                    const highlightedName = product.name.replace(regex, '<span class="highlight-text">$1</span>');
                    const imgPath = window.resolveImagePath(product.image);
                    const link = `/${product.slug}/`;
                    return `
                        <a href="${link}" class="search-result-item" data-no-copy>
                            <div class="search-result-img" style="background-image: url('${imgPath}');"></div>
                            <div class="search-result-info">
                                <span class="search-result-name">${highlightedName}</span>
                                <span class="search-result-price">${window.formatPrice(product.price)}</span>
                            </div>
                        </a>
                    `;
                }).join('');
            } else {
                searchResults.classList.add('active');
                searchResults.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">Ничего не найдено</div>';
            }
        });
    }

    if (window.updateCartUI) window.updateCartUI();
};

document.addEventListener('astro:page-load', () => {
    initApp();
    setTimeout(() => { document.body.classList.remove('preload'); }, 150);
});
