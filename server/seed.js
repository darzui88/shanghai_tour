require('dotenv').config();
const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models');
const Product = require('./models/Product');
const Location = require('./models/Location');

// Connect to MySQL
async function connect() {
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  await syncDatabase(false);
}

// Sample products
const sampleProducts = [
  {
    name: 'Chinese Silk Scarf',
    nameCN: '中国丝绸围巾',
    description: 'Beautiful handcrafted silk scarf with traditional Chinese patterns. Perfect souvenir from Shanghai.',
    descriptionCN: '带有传统中国图案的精美手工丝绸围巾。上海完美纪念品。',
    category: 'souvenir',
    price: 299,
    originalPrice: 399,
    currency: 'CNY',
    images: ['https://via.placeholder.com/500x500?text=Silk+Scarf'],
    stock: 50,
    isAvailable: true,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 30,
    tags: ['souvenir', 'silk', 'handcrafted', 'traditional']
  },
  {
    name: 'Jade Pendant',
    nameCN: '翡翠吊坠',
    description: 'Authentic Chinese jade pendant with beautiful craftsmanship. A symbol of good luck and prosperity.',
    descriptionCN: '精美工艺的纯正中国翡翠吊坠。好运和繁荣的象征。',
    category: 'souvenir',
    price: 599,
    originalPrice: 899,
    currency: 'CNY',
    images: ['https://via.placeholder.com/500x500?text=Jade+Pendant'],
    stock: 20,
    isAvailable: true,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 50,
    tags: ['souvenir', 'jade', 'jewelry', 'authentic']
  },
  {
    name: 'Chinese Tea Set',
    nameCN: '中国茶具',
    description: 'Traditional Chinese tea set with ceramic pot and cups. Ideal for tea lovers.',
    descriptionCN: '配有陶瓷壶和杯子的传统中国茶具。茶爱好者的理想选择。',
    category: 'souvenir',
    price: 399,
    originalPrice: 599,
    currency: 'CNY',
    images: ['https://via.placeholder.com/500x500?text=Tea+Set'],
    stock: 30,
    isAvailable: true,
    expressDeliveryAvailable: false,
    tags: ['souvenir', 'tea', 'ceramic', 'traditional']
  },
  {
    name: 'Calligraphy Brush Set',
    nameCN: '毛笔套装',
    description: 'Professional Chinese calligraphy brush set with ink and paper. Great for learning Chinese calligraphy.',
    descriptionCN: '配有墨水和纸张的专业中国毛笔套装。学习中国书法的绝佳选择。',
    category: 'souvenir',
    price: 199,
    originalPrice: 299,
    currency: 'CNY',
    images: ['https://via.placeholder.com/500x500?text=Brush+Set'],
    stock: 40,
    isAvailable: true,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 20,
    tags: ['souvenir', 'calligraphy', 'art', 'traditional']
  },
  {
    name: 'Xiaomi Phone',
    nameCN: '小米手机',
    description: 'Latest Xiaomi smartphone at a great price. Much cheaper than buying abroad!',
    descriptionCN: '最新款小米智能手机，价格优惠。比在国外购买便宜很多！',
    category: 'electronics',
    price: 2999,
    originalPrice: 3999,
    currency: 'CNY',
    images: ['https://via.placeholder.com/500x500?text=Xiaomi+Phone'],
    stock: 15,
    isAvailable: true,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 100,
    tags: ['electronics', 'smartphone', 'xiaomi', 'value']
  }
];

// Sample locations
const sampleLocations = [
  {
    name: 'Yuyuan Garden Bazaar',
    nameCN: '豫园商城',
    address: '269 Fangbang Middle Road, Huangpu District',
    addressCN: '黄浦区方浜中路269号',
    district: 'Huangpu',
    description: 'Traditional Chinese shopping area with hundreds of souvenir shops. Best place to buy silk, jade, and traditional crafts.',
    descriptionCN: '拥有数百家纪念品商店的传统中国购物区。购买丝绸、玉石和传统工艺品的最佳地点。',
    categories: ['souvenir', 'art', 'antique'],
    products: [
      { type: 'Silk products', description: 'Scarves, clothing, accessories', priceRange: { min: 100, max: 1000, currency: 'CNY' } },
      { type: 'Jade items', description: 'Pendants, bracelets, figurines', priceRange: { min: 200, max: 5000, currency: 'CNY' } },
      { type: 'Calligraphy supplies', description: 'Brushes, ink, paper', priceRange: { min: 50, max: 500, currency: 'CNY' } }
    ],
    openingHours: {
      monday: '9:00 - 21:00',
      tuesday: '9:00 - 21:00',
      wednesday: '9:00 - 21:00',
      thursday: '9:00 - 21:00',
      friday: '9:00 - 21:00',
      saturday: '9:00 - 21:00',
      sunday: '9:00 - 21:00'
    },
    phone: '+86 21 6328 2430',
    coordinates: { latitude: 31.2277, longitude: 121.4925 },
    transport: {
      metro: ['Line 10 - Yuyuan Garden Station'],
      bus: ['Bus 11, 26, 64, 304'],
      parking: true
    },
    rating: 4.5,
    images: ['https://via.placeholder.com/800x400?text=Yuyuan+Garden'],
    tips: [
      'Bargain for better prices',
      'Visit early in the morning to avoid crowds',
      'Check multiple shops before buying',
      'Bring cash, some shops don\'t accept cards'
    ]
  },
  {
    name: 'Tianzifang',
    nameCN: '田子坊',
    address: '210 Taikang Road, Huangpu District',
    addressCN: '黄浦区泰康路210号',
    district: 'Huangpu',
    description: 'Trendy arts and crafts area in converted lane houses. Great for unique souvenirs and local art.',
    descriptionCN: '由里弄房屋改造而成的时尚艺术和工艺品区。购买独特纪念品和当地艺术品的绝佳场所。',
    categories: ['art', 'souvenir'],
    products: [
      { type: 'Handmade crafts', description: 'Unique art pieces and handicrafts', priceRange: { min: 80, max: 800, currency: 'CNY' } },
      { type: 'Local artwork', description: 'Paintings and prints by local artists', priceRange: { min: 200, max: 2000, currency: 'CNY' } }
    ],
    openingHours: {
      monday: '10:00 - 22:00',
      tuesday: '10:00 - 22:00',
      wednesday: '10:00 - 22:00',
      thursday: '10:00 - 22:00',
      friday: '10:00 - 22:00',
      saturday: '10:00 - 22:00',
      sunday: '10:00 - 22:00'
    },
    coordinates: { latitude: 31.2174, longitude: 121.4694 },
    transport: {
      metro: ['Line 9 - Dapuqiao Station'],
      bus: ['Bus 17, 24, 41'],
      parking: false
    },
    rating: 4.3,
    images: ['https://via.placeholder.com/800x400?text=Tianzifang'],
    tips: [
      'Wander through the narrow alleys',
      'Great place for photos',
      'Many small cafes and restaurants',
      'Support local artists'
    ]
  },
  {
    name: 'Shanghai First Department Store',
    nameCN: '上海第一百货',
    address: '830 Nanjing East Road, Huangpu District',
    addressCN: '黄浦区南京东路830号',
    district: 'Huangpu',
    description: 'Historic department store on Nanjing Road. Good selection of Chinese brands and souvenirs.',
    descriptionCN: '南京路上的历史悠久的百货公司。中国品牌和纪念品的选择丰富。',
    categories: ['clothing', 'souvenir'],
    products: [
      { type: 'Chinese brand clothing', description: 'Fashionable clothing at good prices', priceRange: { min: 150, max: 1500, currency: 'CNY' } },
      { type: 'Electronics', description: 'Chinese brand electronics and gadgets', priceRange: { min: 500, max: 5000, currency: 'CNY' } }
    ],
    openingHours: {
      monday: '10:00 - 22:00',
      tuesday: '10:00 - 22:00',
      wednesday: '10:00 - 22:00',
      thursday: '10:00 - 22:00',
      friday: '10:00 - 22:00',
      saturday: '10:00 - 22:00',
      sunday: '10:00 - 22:00'
    },
    coordinates: { latitude: 31.2397, longitude: 121.4764 },
    transport: {
      metro: ['Line 1, 2, 8 - People\'s Square Station'],
      bus: ['Bus 20, 37, 921'],
      parking: true
    },
    rating: 4.0,
    images: ['https://via.placeholder.com/800x400?text=First+Dept+Store'],
    tips: [
      'Check for sales and promotions',
      'Air-conditioned, good for hot days',
      'Near many tourist attractions',
      'Food court on upper floors'
    ]
  }
];

// Seed function
async function seed() {
  try {
    await connect();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Product.destroy({ where: {} });
    // await Location.destroy({ where: {} });

    // Insert products
    const existingProducts = await Product.count();
    if (existingProducts === 0) {
      const products = await Product.bulkCreate(sampleProducts);
      console.log(`✅ Inserted ${products.length} products`);
    } else {
      console.log(`ℹ️  ${existingProducts} products already exist, skipping...`);
    }

    // Insert locations
    const existingLocations = await Location.count();
    if (existingLocations === 0) {
      const locations = await Location.bulkCreate(sampleLocations);
      console.log(`✅ Inserted ${locations.length} locations`);
    } else {
      console.log(`ℹ️  ${existingLocations} locations already exist, skipping...`);
    }

    console.log('✅ Seed data loaded successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Run seed
seed();
