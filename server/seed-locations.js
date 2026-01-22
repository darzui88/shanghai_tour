require('dotenv').config();
const { testConnection, sequelize } = require('./config/database');
const Location = require('./models/Location');

// 上海真实地点数据
const shanghaiLocations = [
  {
    name: 'Yuyuan Garden & Bazaar',
    nameCN: '豫园商城',
    address: '269 Fangbang Middle Road, Huangpu District, Shanghai',
    addressCN: '上海市黄浦区方浜中路269号',
    city: 'Shanghai',
    district: 'Huangpu',
    coordinates: {
      latitude: 31.2277,
      longitude: 121.4925
    },
    description: 'Yuyuan Garden Bazaar is one of Shanghai\'s most famous traditional shopping areas, featuring hundreds of souvenir shops selling silk products, jade jewelry, traditional Chinese crafts, tea sets, and calligraphy supplies. This historic area combines shopping with cultural exploration, located near the beautiful Ming Dynasty Yuyuan Garden.',
    descriptionCN: '豫园商城是上海最著名的传统购物区之一，拥有数百家纪念品商店，销售丝绸产品、翡翠珠宝、中国传统工艺品、茶具和书法用品。这个历史悠久的区域将购物与文化探索相结合，位于美丽的明代豫园附近。',
    categories: ['souvenir', 'traditional', 'cultural', 'shopping'],
    products: [
      {
        type: 'Silk Products',
        items: ['Silk scarves', 'Silk clothing', 'Silk accessories'],
        priceRange: { min: 100, max: 1000, currency: 'CNY' }
      },
      {
        type: 'Jade Jewelry',
        items: ['Jade pendants', 'Jade bracelets', 'Jade figurines'],
        priceRange: { min: 200, max: 5000, currency: 'CNY' }
      },
      {
        type: 'Traditional Crafts',
        items: ['Calligraphy sets', 'Tea sets', 'Paper fans', 'Chinese knots'],
        priceRange: { min: 50, max: 800, currency: 'CNY' }
      }
    ],
    openingHours: {
      monday: '09:00 - 21:00',
      tuesday: '09:00 - 21:00',
      wednesday: '09:00 - 21:00',
      thursday: '09:00 - 21:00',
      friday: '09:00 - 21:00',
      saturday: '09:00 - 21:00',
      sunday: '09:00 - 21:00'
    },
    phone: '+86 21 6328 2430',
    website: 'http://www.yuyuantm.com',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    transport: {
      metro: [
        'Line 10 - Yuyuan Garden Station (Exit 1), 5 min walk'
      ],
      bus: [
        'Bus 11, 26, 64, 304, 736 - Get off at Yuyuan Station'
      ],
      taxi: 'Tell driver: "豫园商城" or show address',
      parking: 'Limited parking available nearby, recommend public transport'
    },
    tips: [
      'Bargaining is expected and encouraged - start at 50-60% of asking price',
      'Visit early morning (9-10am) or late afternoon (5-6pm) to avoid crowds',
      'Check multiple shops before buying - prices vary significantly',
      'Bring cash (RMB) - many small shops don\'t accept cards',
      'Learn basic numbers in Chinese for easier bargaining',
      'Be aware of fake jade - buy from reputable stores if spending big',
      'The area gets very crowded on weekends and holidays',
      'There are good food stalls in the area - try xiaolongbao (soup dumplings)'
    ]
  },
  {
    name: 'Tianzifang Creative Park',
    nameCN: '田子坊',
    address: '210 Taikang Road, Huangpu District, Shanghai',
    addressCN: '上海市黄浦区泰康路210号',
    city: 'Shanghai',
    district: 'Huangpu',
    coordinates: {
      latitude: 31.2174,
      longitude: 121.4694
    },
    description: 'Tianzifang is a trendy arts and crafts area housed in converted lane houses (shikumen). It features unique boutiques, art galleries, handmade craft shops, and cozy cafes. This is the perfect place to find one-of-a-kind souvenirs and support local artists and designers.',
    descriptionCN: '田子坊是一个时尚的艺术和工艺品区，位于改建的石库门里弄中。这里有独特的精品店、艺术画廊、手工艺品店和舒适的咖啡馆。这是寻找独一无二的纪念品和支持本地艺术家和设计师的完美场所。',
    categories: ['art', 'craft', 'unique', 'boutique'],
    products: [
      {
        type: 'Handmade Crafts',
        items: ['Hand-painted items', 'Custom jewelry', 'Artistic home decor'],
        priceRange: { min: 80, max: 800, currency: 'CNY' }
      },
      {
        type: 'Local Artwork',
        items: ['Paintings', 'Prints', 'Photography', 'Sculptures'],
        priceRange: { min: 200, max: 2000, currency: 'CNY' }
      },
      {
        type: 'Unique Gifts',
        items: ['Custom T-shirts', 'Designer accessories', 'Vintage items'],
        priceRange: { min: 100, max: 1500, currency: 'CNY' }
      }
    ],
    openingHours: {
      monday: '10:00 - 22:00',
      tuesday: '10:00 - 22:00',
      wednesday: '10:00 - 22:00',
      thursday: '10:00 - 22:00',
      friday: '10:00 - 22:00',
      saturday: '10:00 - 22:30',
      sunday: '10:00 - 22:00'
    },
    phone: '+86 21 5465 7788',
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
    transport: {
      metro: [
        'Line 9 - Dapuqiao Station (Exit 1), 5 min walk'
      ],
      bus: [
        'Bus 17, 24, 41, 96, 146 - Get off at Taikang Road Station'
      ],
      taxi: 'Tell driver: "田子坊" or "Taikang Road 210"',
      parking: 'Very limited, not recommended - use public transport'
    },
    tips: [
      'Wander through the narrow alleys - explore side streets for hidden gems',
      'Perfect for Instagram photos - many colorful walls and artistic decorations',
      'Many small cafes and restaurants - great place to take a break',
      'Support local artists by buying directly from their studios',
      'Some shops accept WeChat Pay and Alipay',
      'Less crowded on weekday mornings',
      'Watch out for uneven steps and narrow passages',
      'Many shops close around 9-10pm'
    ]
  },
  {
    name: 'Nanjing Road Pedestrian Street',
    nameCN: '南京路步行街',
    address: 'Nanjing East Road, Huangpu District, Shanghai',
    addressCN: '上海市黄浦区南京东路',
    city: 'Shanghai',
    district: 'Huangpu',
    coordinates: {
      latitude: 31.2397,
      longitude: 121.4764
    },
    description: 'Nanjing Road is Shanghai\'s most famous shopping street, stretching from the Bund to People\'s Square. It features both modern department stores and traditional shops, offering everything from luxury brands to affordable souvenirs. This pedestrian-only street is always bustling with activity.',
    descriptionCN: '南京路是上海最著名的购物街，从外滩延伸至人民广场。这里既有现代化的百货公司，也有传统商店，提供从奢侈品牌到经济实惠纪念品的各种商品。这条步行街总是熙熙攘攘，充满活力。',
    categories: ['shopping', 'department_store', 'souvenir', 'retail'],
    products: [
      {
        type: 'Chinese Brand Clothing',
        items: ['Fashionable clothing', 'Traditional Chinese clothing (qipao)', 'Casual wear'],
        priceRange: { min: 150, max: 1500, currency: 'CNY' }
      },
      {
        type: 'Electronics',
        items: ['Chinese brand smartphones', 'Electronics', 'Accessories'],
        priceRange: { min: 500, max: 5000, currency: 'CNY' }
      },
      {
        type: 'Souvenirs',
        items: ['Shanghai-themed items', 'Postcards', 'Keychains', 'Magnets'],
        priceRange: { min: 20, max: 300, currency: 'CNY' }
      }
    ],
    openingHours: {
      monday: '10:00 - 22:00',
      tuesday: '10:00 - 22:00',
      wednesday: '10:00 - 22:00',
      thursday: '10:00 - 22:00',
      friday: '10:00 - 22:30',
      saturday: '10:00 - 22:30',
      sunday: '10:00 - 22:00'
    },
    phone: null,
    rating: 4.0,
    images: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e36?w=800',
    transport: {
      metro: [
        'Line 1, 2, 8 - People\'s Square Station (multiple exits)',
        'Line 2, 10 - East Nanjing Road Station',
        'Line 10 - Yuyuan Garden Station (eastern end)'
      ],
      bus: [
        'Bus 20, 37, 921 - Multiple stops along the street',
        'Tourist Bus Line 1'
      ],
      taxi: 'Tell driver: "南京路步行街" or "East Nanjing Road"',
      parking: 'Limited, recommend public transport'
    },
    tips: [
      'Visit during weekdays to avoid weekend crowds',
      'The street is over 1 km long - wear comfortable shoes',
      'Major department stores: Shanghai First Department Store, New World Department Store',
      'Look for sales and promotions, especially during holidays',
      'Many stores accept international credit cards',
      'Good food options in department store food courts',
      'Street performers and vendors add to the atmosphere',
      'Near the Bund - walk 10 minutes east to see Huangpu River',
      'Some side streets have interesting local shops worth exploring'
    ]
  },
  {
    name: 'Xintiandi',
    nameCN: '新天地',
    address: 'Xintiandi, Huangpu District, Shanghai',
    addressCN: '上海市黄浦区新天地',
    city: 'Shanghai',
    district: 'Huangpu',
    coordinates: {
      latitude: 31.2232,
      longitude: 121.4733
    },
    description: 'Xintiandi is an upscale shopping, dining and entertainment complex that seamlessly blends traditional shikumen architecture with modern design. It features international brands, fine dining restaurants, art galleries, and luxury boutiques. A perfect blend of old Shanghai charm and contemporary lifestyle.',
    descriptionCN: '新天地是一个高档的购物、餐饮和娱乐综合体，完美地将传统石库门建筑与现代设计融为一体。这里汇集了国际品牌、精致餐厅、艺术画廊和精品店。是旧上海魅力与现代生活方式的完美结合。',
    categories: ['luxury', 'dining', 'entertainment', 'boutique'],
    products: [
      {
        type: 'International Brands',
        items: ['Fashion', 'Luxury goods', 'Designer items', 'Cosmetics'],
        priceRange: { min: 500, max: 10000, currency: 'CNY' }
      },
      {
        type: 'Art & Culture',
        items: ['Art pieces', 'Cultural items', 'Designer gifts'],
        priceRange: { min: 300, max: 5000, currency: 'CNY' }
      },
      {
        type: 'Premium Souvenirs',
        items: ['High-end Shanghai-themed items', 'Collectibles'],
        priceRange: { min: 200, max: 2000, currency: 'CNY' }
      }
    ],
    openingHours: {
      monday: '10:00 - 22:00',
      tuesday: '10:00 - 22:00',
      wednesday: '10:00 - 22:00',
      thursday: '10:00 - 22:00',
      friday: '10:00 - 23:00',
      saturday: '10:00 - 23:00',
      sunday: '10:00 - 22:00'
    },
    phone: '+86 21 6386 8888',
    website: 'http://www.xintiandi.com',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
    transport: {
      metro: [
        'Line 1 - South Huangpi Road Station (Exit 3), 5 min walk',
        'Line 10 - Xintiandi Station (Exit 6)'
      ],
      bus: [
        'Bus 146, 781, 911, 926',
        'Bus 932, 945'
      ],
      taxi: 'Tell driver: "新天地" or "Xintiandi"',
      parking: 'Underground parking available'
    },
    tips: [
      'Upscale area - prices are higher but quality is excellent',
      'Great for window shopping and people watching',
      'Many excellent restaurants - book ahead for popular ones',
      'Beautiful architecture - take time to appreciate the shikumen design',
      'Some shops may have English-speaking staff',
      'International credit cards widely accepted',
      'Less crowded during weekday afternoons',
      'Visit nearby Taipingqiao Park for a peaceful break',
      'Nightlife is active - bars and clubs open late'
    ]
  },
  {
    name: 'Shanghai Museum Gift Shop',
    nameCN: '上海博物馆商店',
    address: '201 People\'s Avenue, Huangpu District, Shanghai',
    addressCN: '上海市黄浦区人民大道201号',
    city: 'Shanghai',
    district: 'Huangpu',
    coordinates: {
      latitude: 31.2304,
      longitude: 121.4737
    },
    description: 'Located inside the renowned Shanghai Museum, this gift shop offers authentic Chinese cultural items, museum replicas, art books, traditional crafts, and high-quality souvenirs. All items are carefully curated and authentic, making it a reliable place to buy cultural souvenirs with historical significance.',
    descriptionCN: '位于著名的上海博物馆内，这家礼品店提供正宗的中国文化物品、博物馆复制品、艺术书籍、传统工艺品和高质量的纪念品。所有物品都经过精心挑选且真实，是购买具有历史意义的文化纪念品的可靠场所。',
    categories: ['museum', 'cultural', 'authentic', 'gift'],
    products: [
      {
        type: 'Museum Replicas',
        items: ['Ancient artifact replicas', 'Bronze ware replicas', 'Ceramic replicas'],
        priceRange: { min: 200, max: 2000, currency: 'CNY' }
      },
      {
        type: 'Cultural Books',
        items: ['Art books', 'History books', 'Culture guides', 'Exhibition catalogs'],
        priceRange: { min: 80, max: 500, currency: 'CNY' }
      },
      {
        type: 'Traditional Crafts',
        items: ['Calligraphy supplies', 'Seal carving items', 'Traditional stationery'],
        priceRange: { min: 100, max: 800, currency: 'CNY' }
      },
      {
        type: 'Authentic Souvenirs',
        items: ['Museum-themed items', 'Cultural gifts', 'Educational toys'],
        priceRange: { min: 50, max: 600, currency: 'CNY' }
      }
    ],
    openingHours: {
      monday: '', // 空字符串表示关闭
      tuesday: '09:00 - 17:00',
      wednesday: '09:00 - 17:00',
      thursday: '09:00 - 17:00',
      friday: '09:00 - 17:00',
      saturday: '09:00 - 17:00',
      sunday: '09:00 - 17:00'
    },
    phone: '+86 21 6372 3500',
    website: 'http://www.shanghaimuseum.net',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    transport: {
      metro: [
        'Line 1, 2, 8 - People\'s Square Station (Exit 1), 2 min walk'
      ],
      bus: [
        'Bus 18, 46, 49, 112, 123, 145',
        'Bus 574, 952, Airport Line 5'
      ],
      taxi: 'Tell driver: "上海博物馆" or "Shanghai Museum"',
      parking: 'Limited parking, recommend public transport'
    },
    tips: [
      'Free admission to museum - visit the exhibitions first',
      'All items are authentic and officially licensed',
      'Perfect for educational and cultural gifts',
      'Prices are fixed - no bargaining needed',
      'Accepts credit cards and mobile payments',
      'Ask staff for recommendations based on your interests',
      'Some items may be limited edition - check availability',
      'Visit during weekdays for a quieter shopping experience',
      'Combine with museum visit - allow 2-3 hours total',
      'The shop is located on the ground floor near the exit'
    ]
  }
];

// 插入数据
async function seedLocations() {
  try {
    console.log('正在连接数据库...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ 数据库连接失败');
      process.exit(1);
    }
    console.log('✅ 数据库连接成功');

    // 同步模型（确保表存在）
    await Location.sync({ alter: true });
    console.log('✅ Location 表已同步');

    // 检查是否已有数据
    const existingCount = await Location.count();
    console.log(`当前已有 ${existingCount} 条地点数据`);

    // 插入数据
    const createdLocations = [];
    for (const locationData of shanghaiLocations) {
      // 检查是否已存在（根据名称）
      const existing = await Location.findOne({
        where: { name: locationData.name }
      });

      if (existing) {
        console.log(`⚠️  地点 "${locationData.nameCN}" 已存在，跳过...`);
      } else {
        const location = await Location.create(locationData);
        createdLocations.push(location);
        console.log(`✅ 已创建: ${locationData.nameCN} (${locationData.name})`);
      }
    }

    if (createdLocations.length > 0) {
      console.log(`\n✅ 成功创建 ${createdLocations.length} 条地点数据`);
    } else {
      console.log('\nℹ️  所有地点数据已存在，未创建新数据');
    }

    const totalCount = await Location.count();
    console.log(`📊 数据库中现在共有 ${totalCount} 条地点数据`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 插入数据时出错:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// 运行
seedLocations();
