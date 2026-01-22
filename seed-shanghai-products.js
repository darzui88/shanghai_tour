require('dotenv').config();
const Product = require('./server/models/Product');
const { sequelize } = require('./server/config/database');

// 10个上海特色旅游纪念品
const shanghaiProducts = [
  {
    name: 'Shanghai Xiaolongbao Keychain',
    nameCN: '上海小笼包钥匙扣',
    description: 'A cute and adorable keychain shaped like Shanghai\'s famous Xiaolongbao (soup dumplings). Made from high-quality resin material, perfect as a souvenir or gift. Features intricate details that capture the essence of this beloved local delicacy.',
    descriptionCN: '以上海著名小笼包为造型的可爱钥匙扣。采用优质树脂材料制作，细节精致，完美呈现这道深受喜爱的本地美食，是理想的纪念品或礼品。',
    category: 'souvenir',
    price: 28.00,
    originalPrice: 35.00,
    currency: 'CNY',
    stock: 100,
    isAvailable: true,
    shippingFee: 5.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 12.00,
    tags: ['keychain', 'xiaolongbao', 'food', 'cute', 'gift'],
    images: [],
    coverImage: null
  },
  {
    name: 'The Bund Night View Postcard Set',
    nameCN: '外滩夜景明信片套装',
    description: 'A beautiful collection of 12 postcards featuring stunning night views of The Bund, Shanghai\'s iconic waterfront. Each postcard showcases different angles and perspectives of the famous skyline. Perfect for sending to friends and family or keeping as a memory.',
    descriptionCN: '精美的12张明信片套装，展现上海标志性外滩的迷人夜景。每张明信片都展示了不同角度和视角的著名天际线。非常适合寄给朋友家人或作为纪念收藏。',
    category: 'souvenir',
    price: 45.00,
    originalPrice: 58.00,
    currency: 'CNY',
    stock: 80,
    isAvailable: true,
    shippingFee: 5.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 12.00,
    tags: ['postcard', 'the bund', 'night view', 'photography', 'gift'],
    images: [],
    coverImage: null
  },
  {
    name: 'Shanghainese Dialect Refrigerator Magnets',
    nameCN: '上海话冰箱贴',
    description: 'Set of 6 colorful refrigerator magnets featuring common Shanghai dialect phrases with English translations. Learn fun local expressions like "Nong Hao" (Hello) and "Xie Xie" (Thank you). Made from durable magnetic material with vibrant designs.',
    descriptionCN: '一套6个彩色冰箱贴，展示常用上海话短语及英文翻译。学习有趣的本地表达，如"侬好"和"谢谢"。采用耐用磁性材料，设计生动活泼。',
    category: 'souvenir',
    price: 38.00,
    originalPrice: 48.00,
    currency: 'CNY',
    stock: 120,
    isAvailable: true,
    shippingFee: 5.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 12.00,
    tags: ['magnet', 'dialect', 'language', 'educational', 'fun'],
    images: [],
    coverImage: null
  },
  {
    name: 'Shikumen Architecture Model',
    nameCN: '石库门建筑模型',
    description: 'A detailed miniature model of Shanghai\'s iconic Shikumen (stone-gated) architecture. This traditional residential building style represents the unique blend of Chinese and Western architectural elements. Perfect for collectors and architecture enthusiasts.',
    descriptionCN: '上海标志性石库门建筑的精细微缩模型。这种传统住宅建筑风格体现了中西建筑元素的独特融合。非常适合收藏家和建筑爱好者。',
    category: 'souvenir',
    price: 128.00,
    originalPrice: 168.00,
    currency: 'CNY',
    stock: 50,
    isAvailable: true,
    shippingFee: 10.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 15.00,
    tags: ['model', 'architecture', 'shikumen', 'traditional', 'collectible'],
    images: [],
    coverImage: null
  },
  {
    name: 'Shanghai Qipao Bookmark',
    nameCN: '上海旗袍书签',
    description: 'Elegant bookmarks inspired by the traditional Chinese Qipao (cheongsam) dress, a symbol of Shanghai\'s fashion culture. Made from high-quality silk-like material with delicate embroidery patterns. Set of 3 bookmarks in different colors.',
    descriptionCN: '灵感来自传统中国旗袍的优雅书签，旗袍是上海时尚文化的象征。采用优质丝绸质感材料，配以精美刺绣图案。一套3个不同颜色的书签。',
    category: 'souvenir',
    price: 58.00,
    originalPrice: 78.00,
    currency: 'CNY',
    stock: 90,
    isAvailable: true,
    shippingFee: 5.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 12.00,
    tags: ['bookmark', 'qipao', 'traditional', 'elegant', 'gift'],
    images: [],
    coverImage: null
  },
  {
    name: 'Yuyuan Garden Themed Tea Set',
    nameCN: '豫园主题茶具',
    description: 'A beautiful tea set inspired by the classical Yuyuan Garden, featuring traditional Chinese tea culture. Includes a teapot, 4 cups, and a tea tray, all decorated with garden motifs. Made from fine porcelain, perfect for tea lovers.',
    descriptionCN: '灵感来自古典豫园的精美茶具，展现传统中国茶文化。包含茶壶、4个茶杯和茶盘，均饰有园林图案。采用优质瓷器制作，非常适合茶爱好者。',
    category: 'souvenir',
    price: 298.00,
    originalPrice: 398.00,
    currency: 'CNY',
    stock: 30,
    isAvailable: true,
    shippingFee: 15.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 25.00,
    tags: ['tea set', 'yuyuan garden', 'porcelain', 'traditional', 'luxury'],
    images: [],
    coverImage: null
  },
  {
    name: 'Shanghai Bund Theme T-Shirt',
    nameCN: '上海滩主题T恤',
    description: 'Comfortable cotton T-shirt featuring a stylish design of The Bund skyline. Available in multiple sizes (S, M, L, XL). Made from 100% cotton, perfect for casual wear or as a souvenir. The design captures the essence of Shanghai\'s modern charm.',
    descriptionCN: '舒适棉质T恤，印有时尚的外滩天际线设计。提供多种尺码（S、M、L、XL）。100%纯棉制作，非常适合休闲穿着或作为纪念品。设计体现了上海的现代魅力。',
    category: 'clothing',
    price: 88.00,
    originalPrice: 128.00,
    currency: 'CNY',
    stock: 150,
    isAvailable: true,
    shippingFee: 8.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 15.00,
    tags: ['t-shirt', 'the bund', 'casual', 'fashion', 'comfortable'],
    images: [],
    coverImage: null
  },
  {
    name: 'Lane Culture Hand-drawn Map',
    nameCN: '弄堂文化手绘地图',
    description: 'A beautifully hand-drawn map showcasing Shanghai\'s traditional lane culture (Longtang). Features famous lanes, historical sites, and cultural landmarks. Printed on high-quality paper, perfect for framing or as a travel guide. Includes English and Chinese annotations.',
    descriptionCN: '精美手绘地图，展示上海传统弄堂文化。标注了著名弄堂、历史遗址和文化地标。采用优质纸张印刷，非常适合装裱或作为旅行指南。包含中英文注释。',
    category: 'souvenir',
    price: 68.00,
    originalPrice: 88.00,
    currency: 'CNY',
    stock: 70,
    isAvailable: true,
    shippingFee: 5.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 12.00,
    tags: ['map', 'hand-drawn', 'lane culture', 'historical', 'artistic'],
    images: [],
    coverImage: null
  },
  {
    name: 'Shanghai Old Brand Pastry Gift Box',
    nameCN: '上海老字号糕点礼盒',
    description: 'A premium gift box featuring traditional Shanghai pastries from famous old brands. Includes classic treats like mooncakes, almond cookies, and sesame cakes. Beautifully packaged in a traditional Chinese gift box, perfect for sharing Shanghai\'s culinary heritage.',
    descriptionCN: '精选上海老字号传统糕点的精美礼盒。包含经典美食，如月饼、杏仁饼和芝麻饼。采用传统中式礼盒精美包装，非常适合分享上海的美食文化。',
    category: 'food',
    price: 158.00,
    originalPrice: 198.00,
    currency: 'CNY',
    stock: 60,
    isAvailable: true,
    shippingFee: 10.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 20.00,
    tags: ['pastry', 'gift box', 'traditional', 'food', 'luxury'],
    images: [],
    coverImage: null
  },
  {
    name: 'Oriental Pearl Tower Model',
    nameCN: '东方明珠塔模型',
    description: 'A detailed scale model of Shanghai\'s iconic Oriental Pearl Tower, one of the city\'s most recognizable landmarks. Made from high-quality materials with LED lights that illuminate the tower. Perfect for collectors and as a decorative piece.',
    descriptionCN: '上海标志性建筑东方明珠塔的精细比例模型，是城市最具辨识度的地标之一。采用优质材料制作，配有LED灯光照明。非常适合收藏家和作为装饰品。',
    category: 'souvenir',
    price: 188.00,
    originalPrice: 248.00,
    currency: 'CNY',
    stock: 40,
    isAvailable: true,
    shippingFee: 12.00,
    expressDeliveryAvailable: true,
    expressDeliveryFee: 20.00,
    tags: ['model', 'oriental pearl tower', 'landmark', 'LED', 'collectible'],
    images: [],
    coverImage: null
  }
];

async function seedShanghaiProducts() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    console.log('🚀 开始创建上海特色旅游纪念品...\n');

    // 创建商品
    const createdProducts = [];
    for (const productData of shanghaiProducts) {
      try {
        const product = await Product.create(productData);
        createdProducts.push(product);
        console.log(`✅ 创建商品: ${product.nameCN} (${product.name})`);
        console.log(`   价格: ¥${product.price} (原价: ¥${product.originalPrice})`);
        console.log(`   库存: ${product.stock}`);
        console.log('');
      } catch (error) {
        console.error(`❌ 创建商品失败: ${productData.name}`, error.message);
      }
    }

    console.log('='.repeat(80));
    console.log(`✅ 成功创建 ${createdProducts.length} 个商品！`);
    console.log('='.repeat(80));
    console.log('\n📦 商品列表:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nameCN} - ¥${product.price}`);
    });
    console.log('');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// 运行
seedShanghaiProducts();
