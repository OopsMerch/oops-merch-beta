// База данных товаров
const productsData = [
    { 
        id: 1, 
        name: "Футболка You Need Pain", 
        slug: "you-need-pain", 
        price: 2990, 
        category: "tshirt", 
        collection: "you-need",
        
        // ВАЖНО: Убираем / в начале. Путь теперь считается от index.html
        image: "images/you-need-pain.jpg", 

        description: "Премиальная футболка из плотного, 100% хлопка (250г/м²), оверсайз крой.", 
        sizes: ["S", "M", "L", "XL"],
        characteristics: [
            {"name": "Страна", "value": "Россия"},
            {"name": "Плотность", "value": "250 г/м²"},
            {"name": "Крой", "value": "Oversize"}
        ],
        // Галерея для страницы товара
        gallery: [
            "images/you-need-pain.jpg", 
            "images/photo-1.jpg", 
            "images/photo-2.jpg"
        ],
        
        isAvailable: true, 
        isPopular: true 
    }
];

// Версия сайта для сброса кэша (автоматизация)
window.SITE_VERSION = "2.0." + Date.now(); 
window.dataLoaded = true;

// Если страница уже готова, запускаем инициализацию
if (window.pageLoaded && window.initPage) {
    window.initPage();
}
