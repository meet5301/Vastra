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
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506629905607-0b5b8b5b4b4b?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470309864661-68328b2cd0be?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506629905607-0b5b8b5b4b4b?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470309864661-68328b2cd0be?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506629905607-0b5b8b5b4b4b?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop",
  ];
  return fashionImages[index % fashionImages.length];
}

const products = [
  // ─── MEN'S COLLECTION (35+ items) ───────────────────────────────────────────
  { name: "Classic Blue Blazer", price: 149, image: getProductImage(0, "Men"), category: "Men", subCategory: "Blazers", stock: 30, isFeatured: true, description: "Timeless blue blazer for modern professionals." },
  { name: "Black Cotton Shirt", price: 55, image: getProductImage(1, "Men"), category: "Men", subCategory: "Shirts", stock: 80, isFeatured: false, description: "Premium black cotton shirt with modern slim fit." },
  { name: "Denim Jacket", price: 89, image: getProductImage(2, "Men"), category: "Men", subCategory: "Jackets", stock: 35, isFeatured: false, description: "Classic denim jacket with modern cut." },
  { name: "White Linen Shirt", price: 59, image: getProductImage(3, "Men"), category: "Men", subCategory: "Shirts", stock: 70, isFeatured: false, description: "Breathable white linen shirt for warm days." },
  { name: "Gray Wool Blazer", price: 165, image: getProductImage(4, "Men"), category: "Men", subCategory: "Blazers", stock: 25, isFeatured: true, description: "Sophisticated gray wool blazer." },
  { name: "Navy Blue Chinos", price: 78, image: getProductImage(5, "Men"), category: "Men", subCategory: "Trousers", stock: 50, isFeatured: false, description: "Comfortable navy blue chinos for everyday wear." },
  { name: "Leather Jacket Brown", price: 199, image: getProductImage(6, "Men"), category: "Men", subCategory: "Jackets", stock: 20, isFeatured: true, description: "Premium leather jacket in rich brown." },
  { name: "Striped Dress Shirt", price: 65, image: getProductImage(7, "Men"), category: "Men", subCategory: "Shirts", stock: 45, isFeatured: false, description: "Elegant striped shirt for formal occasions." },
  { name: "Black Wool Trousers", price: 95, image: getProductImage(8, "Men"), category: "Men", subCategory: "Trousers", stock: 40, isFeatured: false, description: "Classic black wool trousers." },
  { name: "Olive Green Shirt", price: 62, image: getProductImage(9, "Men"), category: "Men", subCategory: "Shirts", stock: 35, isFeatured: false, description: "Casual olive green shirt perfect for weekends." },
  { name: "Beige Linen Jacket", price: 120, image: getProductImage(0, "Men"), category: "Men", subCategory: "Blazers", stock: 28, isFeatured: false, description: "Light beige linen jacket for summer." },
  { name: "Dark Denim Jeans", price: 85, image: getProductImage(1, "Men"), category: "Men", subCategory: "Trousers", stock: 60, isFeatured: false, description: "Durable dark denim jeans." },
  { name: "Burgundy Polo Shirt", price: 52, image: getProductImage(2, "Men"), category: "Men", subCategory: "Shirts", stock: 55, isFeatured: false, description: "Classic burgundy polo shirt." },
  { name: "Charcoal Three-Piece Suit", price: 299, image: getProductImage(3, "Men"), category: "Men", subCategory: "Blazers", stock: 15, isFeatured: true, description: "Premium charcoal three-piece suit." },
  { name: "Light Blue Oxford Shirt", price: 68, image: getProductImage(4, "Men"), category: "Men", subCategory: "Shirts", stock: 42, isFeatured: false, description: "Crisp light blue oxford shirt." },
  { name: "Black Leather Belt", price: 35, image: getProductImage(5, "Men"), category: "Men", subCategory: "Accessories", stock: 100, isFeatured: false, description: "Classic black leather belt." },
  { name: "Maroon Sweater", price: 78, image: getProductImage(6, "Men"), category: "Men", subCategory: "Sweaters", stock: 38, isFeatured: false, description: "Cozy maroon wool sweater." },
  { name: "Khaki Chinos", price: 72, image: getProductImage(7, "Men"), category: "Men", subCategory: "Trousers", stock: 55, isFeatured: false, description: "Comfortable khaki chinos." },
  { name: "Navy Cardigan", price: 95, image: getProductImage(8, "Men"), category: "Men", subCategory: "Sweaters", stock: 30, isFeatured: false, description: "Elegant navy cardigan." },
  { name: "Red Flannel Shirt", price: 65, image: getProductImage(9, "Men"), category: "Men", subCategory: "Shirts", stock: 48, isFeatured: false, description: "Classic red flannel shirt." },
  { name: "White Blazer", price: 155, image: getProductImage(0, "Men"), category: "Men", subCategory: "Blazers", stock: 22, isFeatured: false, description: "Crisp white blazer." },
  { name: "Black T-Shirt Premium", price: 42, image: getProductImage(1, "Men"), category: "Men", subCategory: "T-Shirts", stock: 120, isFeatured: false, description: "Premium quality black t-shirt." },
  { name: "Wool Coat Charcoal", price: 220, image: getProductImage(2, "Men"), category: "Men", subCategory: "Coats", stock: 18, isFeatured: true, description: "Warm charcoal wool coat." },
  { name: "Cashmere Sweater Beige", price: 185, image: getProductImage(3, "Men"), category: "Men", subCategory: "Sweaters", stock: 12, isFeatured: true, description: "Luxurious beige cashmere sweater." },
  { name: "Corduroy Jacket Tan", price: 125, image: getProductImage(4, "Men"), category: "Men", subCategory: "Jackets", stock: 28, isFeatured: false, description: "Stylish tan corduroy jacket." },
  { name: "Gray Joggers", price: 65, image: getProductImage(5, "Men"), category: "Men", subCategory: "Trousers", stock: 70, isFeatured: false, description: "Comfortable gray joggers." },
  { name: "Turtleneck Charcoal", price: 72, image: getProductImage(6, "Men"), category: "Men", subCategory: "Sweaters", stock: 40, isFeatured: false, description: "Sleek charcoal turtleneck." },
  { name: "Plaid Dress Shirt", price: 62, image: getProductImage(7, "Men"), category: "Men", subCategory: "Shirts", stock: 35, isFeatured: false, description: "Sophisticated plaid dress shirt." },
  { name: "Wool Peacoat Navy", price: 199, image: getProductImage(8, "Men"), category: "Men", subCategory: "Coats", stock: 20, isFeatured: true, description: "Classic navy wool peacoat." },
  { name: "Festival Shirt Tie-Dye", price: 48, image: getProductImage(9, "Men"), category: "Men", subCategory: "T-Shirts", stock: 50, isFeatured: false, description: "Colorful tie-dye festival shirt." },
  { name: "Winter Gloves Leather", price: 55, image: getProductImage(0, "Men"), category: "Men", subCategory: "Accessories", stock: 60, isFeatured: false, description: "Premium leather winter gloves." },
  { name: "Henley Shirt Coffee", price: 52, image: getProductImage(1, "Men"), category: "Men", subCategory: "Shirts", stock: 45, isFeatured: false, description: "Casual coffee-colored henley shirt." },
  { name: "Wool Blend Trousers Gray", price: 98, image: getProductImage(2, "Men"), category: "Men", subCategory: "Trousers", stock: 35, isFeatured: false, description: "Premium gray wool blend trousers." },
  { name: "Linen Shorts Cream", price: 58, image: getProductImage(3, "Men"), category: "Men", subCategory: "Shorts", stock: 65, isFeatured: false, description: "Lightweight cream linen shorts." },

  // ─── WOMEN'S COLLECTION (35+ items) ───────────────────────────────────────────
  { name: "Purple Midi Dress", price: 85, image: getProductImage(4, "Women"), category: "Women", subCategory: "Dresses", stock: 40, isFeatured: true, description: "Flowing purple midi dress for any occasion." },
  { name: "Elegant Long Coat", price: 199, image: getProductImage(5, "Women"), category: "Women", subCategory: "Coats", stock: 25, isFeatured: true, description: "Sophisticated long coat." },
  { name: "Floral Summer Dress", price: 65, image: getProductImage(6, "Women"), category: "Women", subCategory: "Dresses", stock: 45, isFeatured: true, description: "Light floral dress perfect for summer." },
  { name: "Black Blazer Women", price: 145, image: getProductImage(7, "Women"), category: "Women", subCategory: "Blazers", stock: 32, isFeatured: false, description: "Classic black blazer for women." },
  { name: "White Blouse Silk", price: 75, image: getProductImage(8, "Women"), category: "Women", subCategory: "Blouses", stock: 50, isFeatured: false, description: "Elegant white silk blouse." },
  { name: "Denim Skirt Blue", price: 62, image: getProductImage(9, "Women"), category: "Women", subCategory: "Skirts", stock: 55, isFeatured: false, description: "Classic blue denim skirt." },
  { name: "Pink Cardigan", price: 88, image: getProductImage(0, "Women"), category: "Women", subCategory: "Sweaters", stock: 40, isFeatured: false, description: "Soft pink cardigan." },
  { name: "Red Evening Gown", price: 249, image: getProductImage(1, "Women"), category: "Women", subCategory: "Dresses", stock: 18, isFeatured: true, description: "Stunning red evening gown." },
  { name: "Casual White T-Shirt", price: 38, image: getProductImage(2, "Women"), category: "Women", subCategory: "T-Shirts", stock: 100, isFeatured: false, description: "Comfortable white t-shirt." },
  { name: "Leather Jacket Black", price: 179, image: getProductImage(3, "Women"), category: "Women", subCategory: "Jackets", stock: 22, isFeatured: true, description: "Sleek black leather jacket." },
  { name: "Maxi Skirt Teal", price: 72, image: getProductImage(4, "Women"), category: "Women", subCategory: "Skirts", stock: 35, isFeatured: false, description: "Beautiful teal maxi skirt." },
  { name: "Sweater Dress Cream", price: 95, image: getProductImage(5, "Women"), category: "Women", subCategory: "Dresses", stock: 30, isFeatured: false, description: "Cozy cream sweater dress." },
  { name: "Linen Pants Beige", price: 85, image: getProductImage(6, "Women"), category: "Women", subCategory: "Trousers", stock: 42, isFeatured: false, description: "Comfortable beige linen pants." },
  { name: "Peplum Blouse Pink", price: 68, image: getProductImage(7, "Women"), category: "Women", subCategory: "Blouses", stock: 38, isFeatured: false, description: "Stylish pink peplum blouse." },
  { name: "Wool Coat Burgundy", price: 215, image: getProductImage(8, "Women"), category: "Women", subCategory: "Coats", stock: 20, isFeatured: true, description: "Warm burgundy wool coat." },
  { name: "Pencil Skirt Black", price: 65, image: getProductImage(9, "Women"), category: "Women", subCategory: "Skirts", stock: 48, isFeatured: false, description: "Classic black pencil skirt." },
  { name: "Striped Shirt Blue", price: 58, image: getProductImage(0, "Women"), category: "Women", subCategory: "Blouses", stock: 52, isFeatured: false, description: "Nautical blue striped shirt." },
  { name: "Chiffon Blouse White", price: 72, image: getProductImage(1, "Women"), category: "Women", subCategory: "Blouses", stock: 45, isFeatured: false, description: "Flowing white chiffon blouse." },
  { name: "Denim Jacket Oversized", price: 92, image: getProductImage(2, "Women"), category: "Women", subCategory: "Jackets", stock: 35, isFeatured: false, description: "Trendy oversized denim jacket." },
  { name: "Polka Dot Dress", price: 78, image: getProductImage(3, "Women"), category: "Women", subCategory: "Dresses", stock: 40, isFeatured: false, description: "Fun polka dot dress." },
  { name: "Cashmere Turtleneck Cream", price: 165, image: getProductImage(4, "Women"), category: "Women", subCategory: "Sweaters", stock: 15, isFeatured: true, description: "Luxurious cream cashmere turtleneck." },
  { name: "Bodycon Dress Black", price: 82, image: getProductImage(5, "Women"), category: "Women", subCategory: "Dresses", stock: 32, isFeatured: false, description: "Sleek black bodycon dress." },
  { name: "Vintage Blouse Mustard", price: 65, image: getProductImage(6, "Women"), category: "Women", subCategory: "Blouses", stock: 42, isFeatured: false, description: "Stylish mustard vintage blouse." },
  { name: "Off-Shoulder Dress Rose", price: 89, image: getProductImage(7, "Women"), category: "Women", subCategory: "Dresses", stock: 28, isFeatured: false, description: "Romantic rose off-shoulder dress." },
  { name: "Wool Blend Trousers Navy", price: 95, image: getProductImage(8, "Women"), category: "Women", subCategory: "Trousers", stock: 38, isFeatured: false, description: "Navy wool trousers." },
  { name: "Crochet Top White", price: 62, image: getProductImage(9, "Women"), category: "Women", subCategory: "Blouses", stock: 30, isFeatured: false, description: "Delicate white crochet top." },
  { name: "Corduroy Jacket Rust", price: 118, image: getProductImage(0, "Women"), category: "Women", subCategory: "Jackets", stock: 25, isFeatured: false, description: "Rust-colored corduroy jacket." },
  { name: "Joggers Sweatpants Black", price: 68, image: getProductImage(1, "Women"), category: "Women", subCategory: "Trousers", stock: 60, isFeatured: false, description: "Comfortable black joggers." },
  { name: "Button-Up Shirt Cream", price: 55, image: getProductImage(2, "Women"), category: "Women", subCategory: "Blouses", stock: 45, isFeatured: false, description: "Classic cream button-up shirt." },
  { name: "Tulle Skirt Pink", price: 85, image: getProductImage(3, "Women"), category: "Women", subCategory: "Skirts", stock: 32, isFeatured: false, description: "Whimsical pink tulle skirt." },
  { name: "Layering Tank White", price: 35, image: getProductImage(4, "Women"), category: "Women", subCategory: "T-Shirts", stock: 80, isFeatured: false, description: "Essential white tank top." },

  // ─── ACCESSORIES COLLECTION (30+ items) ───────────────────────────────────────────
  { name: "Printed Silk Scarf", price: 45, image: getProductImage(5, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 50, isFeatured: true, description: "Elegant printed silk scarf." },
  { name: "Winter Wool Scarf", price: 39, image: getProductImage(6, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 60, isFeatured: false, description: "Warm and cozy wool scarf." },
  { name: "Leather Crossbody Bag", price: 125, image: getProductImage(7, "Accessories"), category: "Accessories", subCategory: "Bags", stock: 30, isFeatured: true, description: "Premium leather crossbody bag." },
  { name: "Canvas Tote Bag Beige", price: 52, image: getProductImage(8, "Accessories"), category: "Accessories", subCategory: "Bags", stock: 70, isFeatured: false, description: "Sturdy beige canvas tote." },
  { name: "Metal Belt Gold", price: 48, image: getProductImage(9, "Accessories"), category: "Accessories", subCategory: "Belts", stock: 80, isFeatured: false, description: "Stylish gold metal belt." },
  { name: "Silk Headscarf Colorful", price: 42, image: getProductImage(0, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 50, isFeatured: false, description: "Colorful silk headscarf." },
  { name: "Woven Shoulder Bag", price: 68, image: getProductImage(1, "Accessories"), category: "Accessories", subCategory: "Bags", stock: 45, isFeatured: false, description: "Trendy woven shoulder bag." },
  { name: "Wool Beanie Gray", price: 32, image: getProductImage(2, "Accessories"), category: "Accessories", subCategory: "Hats", stock: 100, isFeatured: false, description: "Cozy gray wool beanie." },
  { name: "Denim Tote Bag", price: 58, image: getProductImage(3, "Accessories"), category: "Accessories", subCategory: "Bags", stock: 55, isFeatured: false, description: "Casual denim tote bag." },
  { name: "Cotton Scarf Striped", price: 38, image: getProductImage(4, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 65, isFeatured: false, description: "Light striped cotton scarf." },
  { name: "Leather Wallet Brown", price: 72, image: getProductImage(5, "Accessories"), category: "Accessories", subCategory: "Wallets", stock: 40, isFeatured: false, description: "Premium brown leather wallet." },
  { name: "Straw Hat Summer", price: 45, image: getProductImage(6, "Accessories"), category: "Accessories", subCategory: "Hats", stock: 50, isFeatured: false, description: "Lightweight summer straw hat." },
  { name: "Pearl Necklace", price: 89, image: getProductImage(7, "Accessories"), category: "Accessories", subCategory: "Jewelry", stock: 25, isFeatured: true, description: "Elegant pearl necklace." },
  { name: "Chain Belt Gold", price: 52, image: getProductImage(8, "Accessories"), category: "Accessories", subCategory: "Belts", stock: 70, isFeatured: false, description: "Golden chain belt." },
  { name: "Leather Backoack", price: 135, image: getProductImage(9, "Accessories"), category: "Accessories", subCategory: "Bags", stock: 28, isFeatured: false, description: "Stylish leather backpack." },
  { name: "Cashmere Scarf Navy", price: 62, image: getProductImage(0, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 35, isFeatured: false, description: "Luxurious navy cashmere scarf." },
  { name: "Baseball Cap Black", price: 35, image: getProductImage(1, "Accessories"), category: "Accessories", subCategory: "Hats", stock: 90, isFeatured: false, description: "Classic black baseball cap." },
  { name: "Silk Pillowcase White", price: 45, image: getProductImage(2, "Accessories"), category: "Accessories", subCategory: "Home", stock: 60, isFeatured: false, description: "Gentle white silk pillowcase." },
  { name: "Golden Ring Cubic Zirconia", price: 65, image: getProductImage(3, "Accessories"), category: "Accessories", subCategory: "Jewelry", stock: 55, isFeatured: false, description: "Sparkling cubic zirconia ring." },
  { name: "Vintage Brooch Silver", price: 48, image: getProductImage(4, "Accessories"), category: "Accessories", subCategory: "Jewelry", stock: 30, isFeatured: false, description: "Antique silver brooch." },
  { name: "Linen Scarf Beige", price: 42, image: getProductImage(5, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 50, isFeatured: false, description: "Light beige linen scarf." },
  { name: "Sunglasses UV Protection", price: 85, image: getProductImage(6, "Accessories"), category: "Accessories", subCategory: "Eyewear", stock: 40, isFeatured: false, description: "Stylish UV protective sunglasses." },
  { name: "Ankle Socks Pack", price: 25, image: getProductImage(7, "Accessories"), category: "Accessories", subCategory: "Socks", stock: 150, isFeatured: false, description: "Comfortable ankle socks pack." },
  { name: "Leather Gloves Brown", price: 68, image: getProductImage(8, "Accessories"), category: "Accessories", subCategory: "Gloves", stock: 45, isFeatured: false, description: "Premium brown leather gloves." },
  { name: "Silk Eye Mask Black", price: 38, image: getProductImage(9, "Accessories"), category: "Accessories", subCategory: "Home", stock: 70, isFeatured: false, description: "Gentle black silk eye mask." },
  { name: "Fabric Bag Multicolor", price: 55, image: getProductImage(0, "Accessories"), category: "Accessories", subCategory: "Bags", stock: 50, isFeatured: false, description: "Vibrant multicolor fabric bag." },
  { name: "Woolen Mittens Red", price: 32, image: getProductImage(1, "Accessories"), category: "Accessories", subCategory: "Gloves", stock: 60, isFeatured: false, description: "Warm red woolen mittens." },
  { name: "Bohemian Bracelet", price: 48, image: getProductImage(2, "Accessories"), category: "Accessories", subCategory: "Jewelry", stock: 50, isFeatured: false, description: "Colorful bohemian bracelet." },
  { name: "Pashmina Wrap Cream", price: 72, image: getProductImage(3, "Accessories"), category: "Accessories", subCategory: "Scarves", stock: 35, isFeatured: true, description: "Luxurious cream pashmina wrap." },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing
  await Product.deleteMany({});
  console.log("Existing products cleared");

  // Insert products
  await Product.insertMany(products);
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
