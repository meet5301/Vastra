// ─── VASTRA SEED SCRIPT ────────────────────────────────────────────
// Run: node seed.js
// Adds sample products and admin user to MongoDB

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Product = require("./models/Product");
const User = require("./models/User");

// Helper function to generate fashion-specific image URLs for products
function getProductImage(index, category) {
  const fashionImages = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506629905607-0b5b8b5b4b4b?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470309864661-68328b2cd0be?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506629905607-0b5b8b5b4b4b?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470309864661-68328b2cd0be?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506629905607-0b5b8b5b4b4b?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=750&fit=crop&q=80",
  ];
  return fashionImages[index % fashionImages.length];
}

// Color image pools per category
const colorImagePools = {
  Men: [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=533&fit=crop",
  ],
  Women: [
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=533&fit=crop",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=400&h=533&fit=crop",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=533&fit=crop",
  ],
};

// Build colorImages array for a product
function getColorImages(colors, category) {
  const pool = colorImagePools[category] || colorImagePools.Men;
  return colors.map((color, i) => ({
    color,
    image: pool[i % pool.length],
  }));
}

const products = [
  // ─── MEN'S COLLECTION (35+ items) ───────────────────────────────────────────
  { name: "Classic Blue Blazer", price: 149, image: getProductImage(0, "Men"), category: "Men", subCategory: "Blazers", colors: ["#1a47b8", "#111111", "#6b7280"], stock: 30, isFeatured: true, description: "Timeless blue blazer for modern professionals.", externalOffers: [{ site: "Myntra", price: 18999, productName: "Classic Blue Blazer", productUrl: "https://www.myntra.com/", notes: "Admin entered competitor listing" }, { site: "Ajio", price: 17999, productName: "Classic Blue Blazer", productUrl: "https://www.ajio.com/", notes: "Admin entered competitor listing" }] },
  { name: "Black Cotton Shirt", price: 55, image: getProductImage(1, "Men"), category: "Men", subCategory: "Shirts", colors: ["#111111", "#ffffff", "#1a47b8"], stock: 80, isFeatured: false, description: "Premium black cotton shirt with modern slim fit.", externalOffers: [{ site: "Myntra", price: 2499, productName: "Black Cotton Shirt", productUrl: "https://www.myntra.com/", notes: "Admin entered competitor listing" }, { site: "Flipkart", price: 2299, productName: "Black Cotton Shirt", productUrl: "https://www.flipkart.com/", notes: "Admin entered competitor listing" }] },
  { name: "Denim Jacket", price: 89, image: getProductImage(2, "Men"), category: "Men", subCategory: "Jackets", colors: ["#3b5998", "#111111", "#6b7280"], stock: 35, isFeatured: false, description: "Classic denim jacket with modern cut.", externalOffers: [{ site: "Myntra", price: 3299, productName: "Denim Jacket", productUrl: "https://www.myntra.com/", notes: "Admin entered competitor listing" }] },
  { name: "White Linen Shirt", price: 59, image: getProductImage(3, "Men"), category: "Men", subCategory: "Shirts", colors: ["#ffffff", "#f5f0e8", "#d4c5a9"], stock: 70, isFeatured: false, description: "Breathable white linen shirt for warm days.", externalOffers: [{ site: "Ajio", price: 1999, productName: "White Linen Shirt", productUrl: "https://www.ajio.com/", notes: "Admin entered competitor listing" }] },
  { name: "Gray Wool Blazer", price: 165, image: getProductImage(4, "Men"), category: "Men", subCategory: "Blazers", colors: ["#6b7280", "#111111", "#4b5563"], stock: 25, isFeatured: true, description: "Sophisticated gray wool blazer.", externalOffers: [{ site: "Amazon", price: 4599, productName: "Gray Wool Blazer", productUrl: "https://www.amazon.in/", notes: "Admin entered competitor listing" }] },
  { name: "Navy Blue Chinos", price: 78, image: getProductImage(5, "Men"), category: "Men", subCategory: "Trousers", colors: ["#1e3a5f", "#6b7280", "#8B4513"], stock: 50, isFeatured: false, description: "Comfortable navy blue chinos for everyday wear.", externalOffers: [{ site: "Flipkart", price: 2799, productName: "Navy Blue Chinos", productUrl: "https://www.flipkart.com/", notes: "Admin entered competitor listing" }] },
  { name: "Leather Jacket Brown", price: 199, image: getProductImage(6, "Men"), category: "Men", subCategory: "Jackets", colors: ["#8B4513", "#111111", "#4a3728"], stock: 20, isFeatured: true, description: "Premium leather jacket in rich brown.", externalOffers: [{ site: "Myntra", price: 6999, productName: "Leather Jacket Brown", productUrl: "https://www.myntra.com/", notes: "Admin entered competitor listing" }] },
  { name: "Striped Dress Shirt", price: 65, image: getProductImage(7, "Men"), category: "Men", subCategory: "Shirts", colors: ["#1a47b8", "#ffffff", "#6b7280"], stock: 45, isFeatured: false, description: "Elegant striped shirt for formal occasions.", externalOffers: [{ site: "Ajio", price: 2199, productName: "Striped Dress Shirt", productUrl: "https://www.ajio.com/", notes: "Admin entered competitor listing" }] },
  { name: "Black Wool Trousers", price: 95, image: getProductImage(8, "Men"), category: "Men", subCategory: "Trousers", colors: ["#111111", "#4b5563", "#1e3a5f"], stock: 40, isFeatured: false, description: "Classic black wool trousers.", externalOffers: [{ site: "Flipkart", price: 3199, productName: "Black Wool Trousers", productUrl: "https://www.flipkart.com/", notes: "Admin entered competitor listing" }] },
  { name: "Olive Green Shirt", price: 62, image: getProductImage(9, "Men"), category: "Men", subCategory: "Shirts", colors: ["#556b2f", "#8B4513", "#111111"], stock: 35, isFeatured: false, description: "Casual olive green shirt perfect for weekends.", externalOffers: [{ site: "Myntra", price: 2399, productName: "Olive Green Shirt", productUrl: "https://www.myntra.com/", notes: "Admin entered competitor listing" }] },
  { name: "Beige Linen Jacket", price: 120, image: getProductImage(0, "Men"), category: "Men", subCategory: "Blazers", colors: ["#d4c5a9", "#ffffff", "#8B4513"], stock: 28, isFeatured: false, description: "Light beige linen jacket for summer." },
  { name: "Dark Denim Jeans", price: 85, image: getProductImage(1, "Men"), category: "Men", subCategory: "Trousers", colors: ["#1e3a5f", "#111111", "#6b7280"], stock: 60, isFeatured: false, description: "Durable dark denim jeans." },
  { name: "Burgundy Polo Shirt", price: 52, image: getProductImage(2, "Men"), category: "Men", subCategory: "Shirts", colors: ["#800020", "#1a47b8", "#111111"], stock: 55, isFeatured: false, description: "Classic burgundy polo shirt." },
  { name: "Charcoal Three-Piece Suit", price: 299, image: getProductImage(3, "Men"), category: "Men", subCategory: "Blazers", colors: ["#36454f", "#1e3a5f", "#111111"], stock: 15, isFeatured: true, description: "Premium charcoal three-piece suit." },
  { name: "Light Blue Oxford Shirt", price: 68, image: getProductImage(4, "Men"), category: "Men", subCategory: "Shirts", colors: ["#add8e6", "#ffffff", "#1a47b8"], stock: 42, isFeatured: false, description: "Crisp light blue oxford shirt." },
  { name: "Black Leather Belt", price: 35, image: getProductImage(5, "Men"), category: "Men", subCategory: "Accessories", colors: ["#111111", "#8B4513"], stock: 100, isFeatured: false, description: "Classic black leather belt." },
  { name: "Maroon Sweater", price: 78, image: getProductImage(6, "Men"), category: "Men", subCategory: "Sweaters", colors: ["#800020", "#1e3a5f", "#6b7280"], stock: 38, isFeatured: false, description: "Cozy maroon wool sweater." },
  { name: "Khaki Chinos", price: 72, image: getProductImage(7, "Men"), category: "Men", subCategory: "Trousers", colors: ["#c3b091", "#6b7280", "#111111"], stock: 55, isFeatured: false, description: "Comfortable khaki chinos." },
  { name: "Navy Cardigan", price: 95, image: getProductImage(8, "Men"), category: "Men", subCategory: "Sweaters", colors: ["#1e3a5f", "#6b7280", "#111111"], stock: 30, isFeatured: false, description: "Elegant navy cardigan." },
  { name: "Red Flannel Shirt", price: 65, image: getProductImage(9, "Men"), category: "Men", subCategory: "Shirts", colors: ["#cc0000", "#111111", "#556b2f"], stock: 48, isFeatured: false, description: "Classic red flannel shirt." },
  { name: "White Blazer", price: 155, image: getProductImage(0, "Men"), category: "Men", subCategory: "Blazers", colors: ["#ffffff", "#f5f0e8", "#6b7280"], stock: 22, isFeatured: false, description: "Crisp white blazer." },
  { name: "Black T-Shirt Premium", price: 42, image: getProductImage(1, "Men"), category: "Men", subCategory: "T-Shirts", colors: ["#111111", "#ffffff", "#6b7280"], stock: 120, isFeatured: false, description: "Premium quality black t-shirt." },
  { name: "Wool Coat Charcoal", price: 220, image: getProductImage(2, "Men"), category: "Men", subCategory: "Coats", colors: ["#36454f", "#111111", "#8B4513"], stock: 18, isFeatured: true, description: "Warm charcoal wool coat." },
  { name: "Cashmere Sweater Beige", price: 185, image: getProductImage(3, "Men"), category: "Men", subCategory: "Sweaters", colors: ["#d4c5a9", "#c3b091", "#6b7280"], stock: 12, isFeatured: true, description: "Luxurious beige cashmere sweater." },
  { name: "Corduroy Jacket Tan", price: 125, image: getProductImage(4, "Men"), category: "Men", subCategory: "Jackets", colors: ["#d2b48c", "#8B4513", "#556b2f"], stock: 28, isFeatured: false, description: "Stylish tan corduroy jacket." },
  { name: "Gray Joggers", price: 65, image: getProductImage(5, "Men"), category: "Men", subCategory: "Trousers", colors: ["#6b7280", "#111111", "#1e3a5f"], stock: 70, isFeatured: false, description: "Comfortable gray joggers." },
  { name: "Turtleneck Charcoal", price: 72, image: getProductImage(6, "Men"), category: "Men", subCategory: "Sweaters", colors: ["#36454f", "#111111", "#800020"], stock: 40, isFeatured: false, description: "Sleek charcoal turtleneck." },
  { name: "Plaid Dress Shirt", price: 62, image: getProductImage(7, "Men"), category: "Men", subCategory: "Shirts", colors: ["#800020", "#1e3a5f", "#556b2f"], stock: 35, isFeatured: false, description: "Sophisticated plaid dress shirt." },
  { name: "Wool Peacoat Navy", price: 199, image: getProductImage(8, "Men"), category: "Men", subCategory: "Coats", colors: ["#1e3a5f", "#111111", "#36454f"], stock: 20, isFeatured: true, description: "Classic navy wool peacoat." },
  { name: "Festival Shirt Tie-Dye", price: 48, image: getProductImage(9, "Men"), category: "Men", subCategory: "T-Shirts", colors: ["#cc0000", "#1a47b8", "#556b2f"], stock: 50, isFeatured: false, description: "Colorful tie-dye festival shirt." },
  { name: "Winter Gloves Leather", price: 55, image: getProductImage(0, "Men"), category: "Men", subCategory: "Accessories", colors: ["#111111", "#8B4513"], stock: 60, isFeatured: false, description: "Premium leather winter gloves." },
  { name: "Henley Shirt Coffee", price: 52, image: getProductImage(1, "Men"), category: "Men", subCategory: "Shirts", colors: ["#6f4e37", "#111111", "#d4c5a9"], stock: 45, isFeatured: false, description: "Casual coffee-colored henley shirt." },
  { name: "Wool Blend Trousers Gray", price: 98, image: getProductImage(2, "Men"), category: "Men", subCategory: "Trousers", colors: ["#6b7280", "#111111", "#1e3a5f"], stock: 35, isFeatured: false, description: "Premium gray wool blend trousers." },
  { name: "Linen Shorts Cream", price: 58, image: getProductImage(3, "Men"), category: "Men", subCategory: "Shorts", colors: ["#f5f0e8", "#d4c5a9", "#6b7280"], stock: 65, isFeatured: false, description: "Lightweight cream linen shorts." },

  // ─── WOMEN'S COLLECTION (35+ items) ───────────────────────────────────────────
  { name: "Purple Midi Dress", price: 85, image: getProductImage(4, "Women"), category: "Women", subCategory: "Dresses", colors: ["#800080", "#1a47b8", "#cc0000"], stock: 40, isFeatured: true, description: "Flowing purple midi dress for any occasion." },
  { name: "Elegant Long Coat", price: 199, image: getProductImage(5, "Women"), category: "Women", subCategory: "Coats", colors: ["#111111", "#8B4513", "#36454f"], stock: 25, isFeatured: true, description: "Sophisticated long coat." },
  { name: "Floral Summer Dress", price: 65, image: getProductImage(6, "Women"), category: "Women", subCategory: "Dresses", colors: ["#ff69b4", "#ffffff", "#add8e6"], stock: 45, isFeatured: true, description: "Light floral dress perfect for summer." },
  { name: "Black Blazer Women", price: 145, image: getProductImage(7, "Women"), category: "Women", subCategory: "Blazers", colors: ["#111111", "#1e3a5f", "#800020"], stock: 32, isFeatured: false, description: "Classic black blazer for women." },
  { name: "White Blouse Silk", price: 75, image: getProductImage(8, "Women"), category: "Women", subCategory: "Blouses", colors: ["#ffffff", "#f5f0e8", "#add8e6"], stock: 50, isFeatured: false, description: "Elegant white silk blouse." },
  { name: "Denim Skirt Blue", price: 62, image: getProductImage(9, "Women"), category: "Women", subCategory: "Skirts", colors: ["#3b5998", "#1e3a5f", "#111111"], stock: 55, isFeatured: false, description: "Classic blue denim skirt." },
  { name: "Pink Cardigan", price: 88, image: getProductImage(0, "Women"), category: "Women", subCategory: "Sweaters", colors: ["#ff69b4", "#ffffff", "#d4c5a9"], stock: 40, isFeatured: false, description: "Soft pink cardigan." },
  { name: "Red Evening Gown", price: 249, image: getProductImage(1, "Women"), category: "Women", subCategory: "Dresses", colors: ["#cc0000", "#800020", "#111111"], stock: 18, isFeatured: true, description: "Stunning red evening gown." },
  { name: "Casual White T-Shirt", price: 38, image: getProductImage(2, "Women"), category: "Women", subCategory: "T-Shirts", colors: ["#ffffff", "#111111", "#6b7280"], stock: 100, isFeatured: false, description: "Comfortable white t-shirt." },
  { name: "Leather Jacket Black", price: 179, image: getProductImage(3, "Women"), category: "Women", subCategory: "Jackets", colors: ["#111111", "#8B4513", "#36454f"], stock: 22, isFeatured: true, description: "Sleek black leather jacket." },
  { name: "Maxi Skirt Teal", price: 72, image: getProductImage(4, "Women"), category: "Women", subCategory: "Skirts", colors: ["#008080", "#1e3a5f", "#800080"], stock: 35, isFeatured: false, description: "Beautiful teal maxi skirt." },
  { name: "Sweater Dress Cream", price: 95, image: getProductImage(5, "Women"), category: "Women", subCategory: "Dresses", colors: ["#f5f0e8", "#d4c5a9", "#6b7280"], stock: 30, isFeatured: false, description: "Cozy cream sweater dress." },
  { name: "Linen Pants Beige", price: 85, image: getProductImage(6, "Women"), category: "Women", subCategory: "Trousers", colors: ["#d4c5a9", "#ffffff", "#111111"], stock: 42, isFeatured: false, description: "Comfortable beige linen pants." },
  { name: "Peplum Blouse Pink", price: 68, image: getProductImage(7, "Women"), category: "Women", subCategory: "Blouses", colors: ["#ff69b4", "#ffffff", "#800080"], stock: 38, isFeatured: false, description: "Stylish pink peplum blouse." },
  { name: "Wool Coat Burgundy", price: 215, image: getProductImage(8, "Women"), category: "Women", subCategory: "Coats", colors: ["#800020", "#111111", "#36454f"], stock: 20, isFeatured: true, description: "Warm burgundy wool coat." },
  { name: "Pencil Skirt Black", price: 65, image: getProductImage(9, "Women"), category: "Women", subCategory: "Skirts", colors: ["#111111", "#36454f", "#1e3a5f"], stock: 48, isFeatured: false, description: "Classic black pencil skirt." },
  { name: "Striped Shirt Blue", price: 58, image: getProductImage(0, "Women"), category: "Women", subCategory: "Blouses", colors: ["#1a47b8", "#ffffff", "#cc0000"], stock: 52, isFeatured: false, description: "Nautical blue striped shirt." },
  { name: "Chiffon Blouse White", price: 72, image: getProductImage(1, "Women"), category: "Women", subCategory: "Blouses", colors: ["#ffffff", "#ff69b4", "#add8e6"], stock: 45, isFeatured: false, description: "Flowing white chiffon blouse." },
  { name: "Denim Jacket Oversized", price: 92, image: getProductImage(2, "Women"), category: "Women", subCategory: "Jackets", colors: ["#3b5998", "#111111", "#6b7280"], stock: 35, isFeatured: false, description: "Trendy oversized denim jacket." },
  { name: "Polka Dot Dress", price: 78, image: getProductImage(3, "Women"), category: "Women", subCategory: "Dresses", colors: ["#ffffff", "#111111", "#cc0000"], stock: 40, isFeatured: false, description: "Fun polka dot dress." },
  { name: "Cashmere Turtleneck Cream", price: 165, image: getProductImage(4, "Women"), category: "Women", subCategory: "Sweaters", colors: ["#f5f0e8", "#d4c5a9", "#800080"], stock: 15, isFeatured: true, description: "Luxurious cream cashmere turtleneck." },
  { name: "Bodycon Dress Black", price: 82, image: getProductImage(5, "Women"), category: "Women", subCategory: "Dresses", colors: ["#111111", "#800020", "#1e3a5f"], stock: 32, isFeatured: false, description: "Sleek black bodycon dress." },
  { name: "Vintage Blouse Mustard", price: 65, image: getProductImage(6, "Women"), category: "Women", subCategory: "Blouses", colors: ["#e3a020", "#ffffff", "#8B4513"], stock: 42, isFeatured: false, description: "Stylish mustard vintage blouse." },
  { name: "Off-Shoulder Dress Rose", price: 89, image: getProductImage(7, "Women"), category: "Women", subCategory: "Dresses", colors: ["#ff69b4", "#ffffff", "#800080"], stock: 28, isFeatured: false, description: "Romantic rose off-shoulder dress." },
  { name: "Wool Blend Trousers Navy", price: 95, image: getProductImage(8, "Women"), category: "Women", subCategory: "Trousers", colors: ["#1e3a5f", "#111111", "#6b7280"], stock: 38, isFeatured: false, description: "Navy wool trousers." },
  { name: "Crochet Top White", price: 62, image: getProductImage(9, "Women"), category: "Women", subCategory: "Blouses", colors: ["#ffffff", "#f5f0e8", "#ff69b4"], stock: 30, isFeatured: false, description: "Delicate white crochet top." },
  { name: "Corduroy Jacket Rust", price: 118, image: getProductImage(0, "Women"), category: "Women", subCategory: "Jackets", colors: ["#b7410e", "#8B4513", "#556b2f"], stock: 25, isFeatured: false, description: "Rust-colored corduroy jacket." },
  { name: "Joggers Sweatpants Black", price: 68, image: getProductImage(1, "Women"), category: "Women", subCategory: "Trousers", colors: ["#111111", "#6b7280", "#1e3a5f"], stock: 60, isFeatured: false, description: "Comfortable black joggers." },
  { name: "Button-Up Shirt Cream", price: 55, image: getProductImage(2, "Women"), category: "Women", subCategory: "Blouses", colors: ["#f5f0e8", "#ffffff", "#add8e6"], stock: 45, isFeatured: false, description: "Classic cream button-up shirt." },
  { name: "Tulle Skirt Pink", price: 85, image: getProductImage(3, "Women"), category: "Women", subCategory: "Skirts", colors: ["#ff69b4", "#ffffff", "#800080"], stock: 32, isFeatured: false, description: "Whimsical pink tulle skirt." },
  { name: "Layering Tank White", price: 35, image: getProductImage(4, "Women"), category: "Women", subCategory: "T-Shirts", colors: ["#ffffff", "#111111", "#6b7280"], stock: 80, isFeatured: false, description: "Essential white tank top." },

  // ─── ACCESSORIES COLLECTION (30+ items) ───────────────────────────────────────────
  { name: "Printed Silk Scarf", price: 45, image: getProductImage(5, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#cc0000", "#1a47b8", "#556b2f"], stock: 50, isFeatured: true, description: "Elegant printed silk scarf." },
  { name: "Winter Wool Scarf", price: 39, image: getProductImage(6, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#6b7280", "#1e3a5f", "#800020"], stock: 60, isFeatured: false, description: "Warm and cozy wool scarf." },
  { name: "Leather Crossbody Bag", price: 125, image: getProductImage(7, "Accessories"), category: "Accessories", subCategory: "Bags", colors: ["#8B4513", "#111111", "#d4c5a9"], stock: 30, isFeatured: true, description: "Premium leather crossbody bag." },
  { name: "Canvas Tote Bag Beige", price: 52, image: getProductImage(8, "Accessories"), category: "Accessories", subCategory: "Bags", colors: ["#d4c5a9", "#111111", "#1e3a5f"], stock: 70, isFeatured: false, description: "Sturdy beige canvas tote." },
  { name: "Metal Belt Gold", price: 48, image: getProductImage(9, "Accessories"), category: "Accessories", subCategory: "Belts", colors: ["#d4af37", "#c0c0c0", "#111111"], stock: 80, isFeatured: false, description: "Stylish gold metal belt." },
  { name: "Silk Headscarf Colorful", price: 42, image: getProductImage(0, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#cc0000", "#800080", "#1a47b8"], stock: 50, isFeatured: false, description: "Colorful silk headscarf." },
  { name: "Woven Shoulder Bag", price: 68, image: getProductImage(1, "Accessories"), category: "Accessories", subCategory: "Bags", colors: ["#d4c5a9", "#8B4513", "#111111"], stock: 45, isFeatured: false, description: "Trendy woven shoulder bag." },
  { name: "Wool Beanie Gray", price: 32, image: getProductImage(2, "Accessories"), category: "Accessories", subCategory: "Hats", colors: ["#6b7280", "#111111", "#1e3a5f"], stock: 100, isFeatured: false, description: "Cozy gray wool beanie." },
  { name: "Denim Tote Bag", price: 58, image: getProductImage(3, "Accessories"), category: "Accessories", subCategory: "Bags", colors: ["#3b5998", "#111111", "#6b7280"], stock: 55, isFeatured: false, description: "Casual denim tote bag." },
  { name: "Cotton Scarf Striped", price: 38, image: getProductImage(4, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#1a47b8", "#ffffff", "#cc0000"], stock: 65, isFeatured: false, description: "Light striped cotton scarf." },
  { name: "Leather Wallet Brown", price: 72, image: getProductImage(5, "Accessories"), category: "Accessories", subCategory: "Wallets", colors: ["#8B4513", "#111111", "#d4c5a9"], stock: 40, isFeatured: false, description: "Premium brown leather wallet." },
  { name: "Straw Hat Summer", price: 45, image: getProductImage(6, "Accessories"), category: "Accessories", subCategory: "Hats", colors: ["#d4c5a9", "#8B4513", "#ffffff"], stock: 50, isFeatured: false, description: "Lightweight summer straw hat." },
  { name: "Pearl Necklace", price: 89, image: getProductImage(7, "Accessories"), category: "Accessories", subCategory: "Jewelry", colors: ["#f5f0e8", "#c0c0c0", "#d4af37"], stock: 25, isFeatured: true, description: "Elegant pearl necklace." },
  { name: "Chain Belt Gold", price: 52, image: getProductImage(8, "Accessories"), category: "Accessories", subCategory: "Belts", colors: ["#d4af37", "#c0c0c0"], stock: 70, isFeatured: false, description: "Golden chain belt." },
  { name: "Leather Backoack", price: 135, image: getProductImage(9, "Accessories"), category: "Accessories", subCategory: "Bags", colors: ["#8B4513", "#111111", "#36454f"], stock: 28, isFeatured: false, description: "Stylish leather backpack." },
  { name: "Cashmere Scarf Navy", price: 62, image: getProductImage(0, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#1e3a5f", "#6b7280", "#800020"], stock: 35, isFeatured: false, description: "Luxurious navy cashmere scarf." },
  { name: "Baseball Cap Black", price: 35, image: getProductImage(1, "Accessories"), category: "Accessories", subCategory: "Hats", colors: ["#111111", "#1e3a5f", "#cc0000"], stock: 90, isFeatured: false, description: "Classic black baseball cap." },
  { name: "Silk Pillowcase White", price: 45, image: getProductImage(2, "Accessories"), category: "Accessories", subCategory: "Home", colors: ["#ffffff", "#ff69b4", "#add8e6"], stock: 60, isFeatured: false, description: "Gentle white silk pillowcase." },
  { name: "Golden Ring Cubic Zirconia", price: 65, image: getProductImage(3, "Accessories"), category: "Accessories", subCategory: "Jewelry", colors: ["#d4af37", "#c0c0c0"], stock: 55, isFeatured: false, description: "Sparkling cubic zirconia ring." },
  { name: "Vintage Brooch Silver", price: 48, image: getProductImage(4, "Accessories"), category: "Accessories", subCategory: "Jewelry", colors: ["#c0c0c0", "#d4af37"], stock: 30, isFeatured: false, description: "Antique silver brooch." },
  { name: "Linen Scarf Beige", price: 42, image: getProductImage(5, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#d4c5a9", "#ffffff", "#8B4513"], stock: 50, isFeatured: false, description: "Light beige linen scarf." },
  { name: "Sunglasses UV Protection", price: 85, image: getProductImage(6, "Accessories"), category: "Accessories", subCategory: "Eyewear", colors: ["#111111", "#8B4513", "#d4af37"], stock: 40, isFeatured: false, description: "Stylish UV protective sunglasses." },
  { name: "Ankle Socks Pack", price: 25, image: getProductImage(7, "Accessories"), category: "Accessories", subCategory: "Socks", colors: ["#ffffff", "#111111", "#6b7280"], stock: 150, isFeatured: false, description: "Comfortable ankle socks pack." },
  { name: "Leather Gloves Brown", price: 68, image: getProductImage(8, "Accessories"), category: "Accessories", subCategory: "Gloves", colors: ["#8B4513", "#111111", "#d4c5a9"], stock: 45, isFeatured: false, description: "Premium brown leather gloves." },
  { name: "Silk Eye Mask Black", price: 38, image: getProductImage(9, "Accessories"), category: "Accessories", subCategory: "Home", colors: ["#111111", "#800080", "#1e3a5f"], stock: 70, isFeatured: false, description: "Gentle black silk eye mask." },
  { name: "Fabric Bag Multicolor", price: 55, image: getProductImage(0, "Accessories"), category: "Accessories", subCategory: "Bags", colors: ["#cc0000", "#1a47b8", "#556b2f"], stock: 50, isFeatured: false, description: "Vibrant multicolor fabric bag." },
  { name: "Woolen Mittens Red", price: 32, image: getProductImage(1, "Accessories"), category: "Accessories", subCategory: "Gloves", colors: ["#cc0000", "#1e3a5f", "#111111"], stock: 60, isFeatured: false, description: "Warm red woolen mittens." },
  { name: "Bohemian Bracelet", price: 48, image: getProductImage(2, "Accessories"), category: "Accessories", subCategory: "Jewelry", colors: ["#d4af37", "#cc0000", "#1a47b8"], stock: 50, isFeatured: false, description: "Colorful bohemian bracelet." },
  { name: "Pashmina Wrap Cream", price: 72, image: getProductImage(3, "Accessories"), category: "Accessories", subCategory: "Scarves", colors: ["#f5f0e8", "#d4c5a9", "#ff69b4"], stock: 35, isFeatured: true, description: "Luxurious cream pashmina wrap." },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing
  await Product.deleteMany({});
  console.log("Existing products cleared");

  // Insert products with auto-generated colorImages
  const productsWithColorImages = products.map((p) => ({
    ...p,
    colorImages: getColorImages(p.colors || [], p.category),
  }));
  await Product.insertMany(productsWithColorImages);
  console.log(`${products.length} products inserted`);

  // Create admin if not exists
const adminEmail = process.env.ADMIN_EMAIL || "admin@vastra.com";

const adminExists = await User.findOne({ email: adminEmail });

if (!adminExists) {
  await User.create({
    username: "Admin",
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
  });

  console.log("✅ Admin created: admin@vastra.com / admin123");
} else {
  console.log("⚠️ Admin already exists (no duplicate created)");
}

  console.log("\n✅ Seed complete!");
  console.log("Start server: npm start");
  console.log("User site: http://localhost:5000");
  console.log("Admin panel: http://localhost:5000/admin");
  console.log("Admin login: admin@vastra.com / admin123");

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
