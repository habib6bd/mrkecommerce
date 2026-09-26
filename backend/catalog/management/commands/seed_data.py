from django.core.management.base import BaseCommand
from django.utils.text import slugify

from catalog.models import Category, Product, ProductImage

CATEGORIES = [
    {"name": "Shoes", "slug": "shoes", "image": "/images/categories/SHoes_1.avif"},
    {"name": "Bags", "slug": "bags", "image": "/images/categories/Bags_1.avif"},
    {"name": "Jewelry", "slug": "jewelry", "image": "/images/categories/Jwelry_1.avif"},
    {"name": "Beauty & Care", "slug": "cosmetics", "image": "/images/categories/Beauty_11.avif"},
    {"name": "Men's Clothing", "slug": "mens-clothing", "image": "/images/categories/cat-5.svg"},
    {"name": "Baby Items", "slug": "baby", "image": "/images/categories/Baby_items1.avif"},
    {"name": "Eyewear", "slug": "eyewear", "image": "/images/categories/cat-7.svg"},
    {"name": "Watches", "slug": "watches", "image": "/images/categories/Watch_1.avif"},
    {"name": "Fishing Equipment", "slug": "fishing-equipment", "image": "/images/products/product-8.svg"},
    {"name": "Women's Dress", "slug": "womens-dress", "image": "/images/products/product-10.svg"},
    {"name": "Stationery", "slug": "stationery", "image": "/images/products/product-11.svg"},
    {"name": "Men's Shoes", "slug": "mens-shoes", "image": "/images/products/product-12.svg"},
]

DESC = (
    "A popular everyday product selected for quality, comfort, value and modern "
    "style. Perfect for regular use and gifting."
)

PRODUCTS = [
    {
        "name": "Premium Soft Cotton Casual T-Shirt",
        "slug": "premium-soft-cotton-casual-t-shirt",
        "category": "mens-clothing",
        "price": 850,
        "discount_price": 620,
        "rating": 4.8,
        "review_count": 187,
        "images": ["/images/products/men_tshirts.jpg"],
        "stock": 42,
        "short_description": "Soft cotton T-shirt.",
        "colors": ["White", "Black", "Gray"],
        "sizes": ["M", "L", "XL"],
        "sold_count": 1420,
    },
    {
        "name": "Lightweight Running Sneakers",
        "slug": "lightweight-running-sneakers",
        "category": "shoes",
        "price": 2350,
        "discount_price": 1890,
        "rating": 4.7,
        "review_count": 92,
        "images": ["/images/products/SHoes_1.avif"],
        "stock": 30,
        "short_description": "Comfortable running shoes.",
        "colors": ["White", "Green"],
        "sizes": ["40", "41", "42"],
        "sold_count": 890,
    },
    {
        "name": "Elegant Ladies Heel Shoes",
        "slug": "elegant-ladies-heel-shoes",
        "category": "shoes",
        "price": 1990,
        "discount_price": 1450,
        "rating": 4.6,
        "review_count": 64,
        "images": ["/images/products/product-2.svg"],
        "stock": 18,
        "short_description": "Stylish heel shoes.",
        "sizes": ["36", "37", "38"],
        "sold_count": 612,
    },
    {
        "name": "Classic Leather Hand Bag",
        "slug": "classic-leather-hand-bag",
        "category": "bags",
        "price": 1750,
        "discount_price": 1280,
        "rating": 4.9,
        "review_count": 131,
        "images": ["/images/products/Bags_1.avif"],
        "stock": 22,
        "short_description": "Premium handbag.",
        "colors": ["Brown", "Black"],
        "sold_count": 1180,
    },
    {
        "name": "Digital Smart Watch Series",
        "slug": "digital-smart-watch-series",
        "category": "watches",
        "price": 3200,
        "discount_price": 2490,
        "rating": 4.5,
        "review_count": 210,
        "images": ["/images/products/smart_watch.jpg"],
        "stock": 55,
        "short_description": "Smart display watch.",
        "colors": ["Black", "Silver"],
        "sold_count": 2100,
    },
    {
        "name": "Gold Plated Elegant Earrings",
        "slug": "gold-plated-elegant-earrings",
        "category": "jewelry",
        "price": 1250,
        "discount_price": 899,
        "rating": 4.7,
        "review_count": 77,
        "images": ["/images/products/Jwelry_1.avif"],
        "stock": 60,
        "short_description": "Elegant earrings.",
        "colors": ["Gold"],
        "sold_count": 956,
    },
    {
        "name": "Waterproof School Backpack",
        "slug": "waterproof-school-backpack",
        "category": "bags",
        "price": 1450,
        "discount_price": 1090,
        "rating": 4.4,
        "review_count": 58,
        "images": ["/images/products/product-7.svg"],
        "stock": 38,
        "short_description": "Durable backpack.",
        "colors": ["Navy", "Black"],
        "sold_count": 730,
    },
    {
        "name": "Professional Fishing Reel Kit",
        "slug": "professional-fishing-reel-kit",
        "category": "fishing-equipment",
        "price": 2850,
        "discount_price": 2190,
        "rating": 4.6,
        "review_count": 44,
        "images": ["/images/products/fishing_equipments.jpg"],
        "stock": 16,
        "short_description": "Fishing reel kit.",
        "sold_count": 410,
    },
    {
        "name": "Hydrating Face Cream Pack",
        "slug": "hydrating-face-cream-pack",
        "category": "cosmetics",
        "price": 980,
        "discount_price": 720,
        "rating": 4.3,
        "review_count": 120,
        "images": ["/images/products/Beauty_11.avif"],
        "stock": 75,
        "short_description": "Daily face cream.",
        "sold_count": 1680,
    },
    {
        "name": "Summer Long Dress Collection",
        "slug": "summer-long-dress-collection",
        "category": "womens-dress",
        "price": 2200,
        "discount_price": 1650,
        "rating": 4.8,
        "review_count": 98,
        "images": ["/images/products/womens_dress.jpg"],
        "stock": 25,
        "short_description": "Comfortable summer dress.",
        "colors": ["Green", "Yellow"],
        "sizes": ["S", "M", "L"],
        "sold_count": 870,
    },
    {
        "name": "Creative Color Pencil Set",
        "slug": "creative-color-pencil-set",
        "category": "stationery",
        "price": 420,
        "discount_price": 310,
        "rating": 4.9,
        "review_count": 48,
        "images": ["/images/products/stationary.jpg"],
        "stock": 80,
        "short_description": "Bright pencil set.",
        "sold_count": 1350,
    },
    {
        "name": "Men's Outdoor Leather Boots",
        "slug": "mens-outdoor-leather-boots",
        "category": "mens-shoes",
        "price": 3850,
        "discount_price": 2990,
        "rating": 4.5,
        "review_count": 33,
        "images": ["/images/products/SHoes_1.avif"],
        "stock": 14,
        "short_description": "Outdoor boots.",
        "colors": ["Black", "Brown"],
        "sizes": ["41", "42", "43"],
        "sold_count": 305,
    },
]


class Command(BaseCommand):
    help = "Seed the database with the storefront's dummy categories and products."

    def handle(self, *args, **options):
        category_map = {}
        for cat in CATEGORIES:
            obj, created = Category.objects.update_or_create(
                slug=cat["slug"],
                defaults={"name": cat["name"], "image": cat["image"]},
            )
            category_map[cat["slug"]] = obj
            self.stdout.write(
                f"{'Created' if created else 'Updated'} category: {obj.name}"
            )

        for prod in PRODUCTS:
            category = category_map.get(prod["category"])
            if category is None:
                category, _ = Category.objects.get_or_create(
                    slug=prod["category"],
                    defaults={"name": prod["category"].replace("-", " ").title()},
                )

            obj, created = Product.objects.update_or_create(
                slug=prod["slug"],
                defaults={
                    "name": prod["name"],
                    "category": category,
                    "price": prod["price"],
                    "discount_price": prod.get("discount_price"),
                    "rating": prod["rating"],
                    "review_count": prod["review_count"],
                    "stock": prod["stock"],
                    "short_description": prod["short_description"],
                    "description": DESC,
                    "colors": prod.get("colors", []),
                    "sizes": prod.get("sizes", []),
                    "sold_count": prod["sold_count"],
                    "is_featured": prod["sold_count"] > 1000,
                },
            )
            obj.images.all().delete()
            for order, image in enumerate(prod["images"]):
                ProductImage.objects.create(product=obj, image=image, order=order)

            self.stdout.write(
                f"{'Created' if created else 'Updated'} product: {obj.name}"
            )

        self.stdout.write(self.style.SUCCESS("Seed data imported successfully."))
