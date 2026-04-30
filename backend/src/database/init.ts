import { getDatabase, saveDatabase, Database } from '../config/database'

const MENU_ITEMS = [
  {
    name: '宫保鸡丁',
    description: '经典川菜，鸡肉配花生、干辣椒，麻辣鲜香',
    price: 38.00,
    category: '热菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Kung%20Pao%20Chicken%20dish%20with%20peanuts%20and%20dried%20chilies%20in%20white%20plate%20professional%20food%20photography&image_size=square',
    stock: 50,
    allergens: ['花生', '辣椒']
  },
  {
    name: '红烧肉',
    description: '肥而不腻的传统红烧肉，入口即化',
    price: 58.00,
    category: '热菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20red%20braised%20pork%20belly%20with%20glaze%20in%20ceramic%20bowl%20professional%20food%20photography&image_size=square',
    stock: 30,
    allergens: []
  },
  {
    name: '清蒸鲈鱼',
    description: '新鲜鲈鱼清蒸，保留原汁原味，鲜嫩可口',
    price: 88.00,
    category: '热菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20steamed%20sea%20bass%20with%20ginger%20and%20scallions%20on%20white%20plate%20professional%20food%20photography&image_size=square',
    stock: 20,
    allergens: ['鱼类']
  },
  {
    name: '麻婆豆腐',
    description: '四川经典名菜，麻辣鲜香，豆腐嫩滑',
    price: 28.00,
    category: '热菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Mapo%20Tofu%20dish%20spicy%20red%20sauce%20in%20white%20bowl%20professional%20food%20photography&image_size=square',
    stock: 100,
    allergens: ['辣椒', '大豆']
  },
  {
    name: '糖醋排骨',
    description: '酸甜可口的经典糖醋排骨，外酥里嫩',
    price: 48.00,
    category: '热菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20sweet%20and%20sour%20pork%20ribs%20glazed%20in%20white%20plate%20professional%20food%20photography&image_size=square',
    stock: 40,
    allergens: []
  },
  {
    name: '扬州炒饭',
    description: '粒粒分明的扬州炒饭，配料丰富',
    price: 22.00,
    category: '主食',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Yangzhou%20fried%20rice%20with%20shrimp%20egg%20ham%20in%20white%20bowl%20professional%20food%20photography&image_size=square',
    stock: 80,
    allergens: ['鸡蛋', '虾类']
  },
  {
    name: '白米饭',
    description: '优质东北大米，粒粒饱满',
    price: 3.00,
    category: '主食',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bowl%20of%20white%20steamed%20rice%20professional%20food%20photography&image_size=square',
    stock: 200,
    allergens: []
  },
  {
    name: '担担面',
    description: '四川特色担担面，麻辣鲜香',
    price: 18.00,
    category: '主食',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Dandan%20noodles%20spicy%20sesame%20sauce%20in%20white%20bowl%20professional%20food%20photography&image_size=square',
    stock: 60,
    allergens: ['花生', '辣椒', '小麦']
  },
  {
    name: '酸辣土豆丝',
    description: '清爽可口的经典家常菜',
    price: 16.00,
    category: '素菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20sour%20and%20spicy%20shredded%20potatoes%20in%20white%20plate%20professional%20food%20photography&image_size=square',
    stock: 150,
    allergens: ['辣椒']
  },
  {
    name: '蒜蓉西兰花',
    description: '清淡健康的蒜蓉西兰花',
    price: 20.00,
    category: '素菜',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20garlic%20broccoli%20stir%20fry%20in%20white%20plate%20professional%20food%20photography&image_size=square',
    stock: 100,
    allergens: ['大蒜']
  },
  {
    name: '番茄蛋汤',
    description: '家常番茄鸡蛋汤，酸甜开胃',
    price: 12.00,
    category: '汤品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20tomato%20egg%20soup%20in%20white%20bowl%20professional%20food%20photography&image_size=square',
    stock: 120,
    allergens: ['鸡蛋']
  },
  {
    name: '紫菜蛋花汤',
    description: '清淡鲜美的紫菜蛋花汤',
    price: 10.00,
    category: '汤品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20seaweed%20egg%20drop%20soup%20in%20white%20bowl%20professional%20food%20photography&image_size=square',
    stock: 120,
    allergens: ['鸡蛋']
  },
  {
    name: '可乐',
    description: '经典可口可乐',
    price: 6.00,
    category: '饮品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glass%20of%20cola%20with%20ice%20cubes%20professional%20drink%20photography&image_size=square',
    stock: 200,
    allergens: []
  },
  {
    name: '鲜榨橙汁',
    description: '新鲜橙子现榨，维C满满',
    price: 15.00,
    category: '饮品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glass%20of%20fresh%20orange%20juice%20with%20orange%20slice%20professional%20drink%20photography&image_size=square',
    stock: 50,
    allergens: []
  },
  {
    name: '芒果布丁',
    description: '香甜芒果布丁，口感丝滑',
    price: 18.00,
    category: '甜品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mango%20pudding%20dessert%20in%20glass%20cup%20with%20mango%20chunks%20professional%20food%20photography&image_size=square',
    stock: 40,
    allergens: ['乳制品', '芒果']
  },
  {
    name: '水果沙拉',
    description: '新鲜水果拼盘，清爽解腻',
    price: 25.00,
    category: '甜品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruit%20salad%20with%20various%20fruits%20in%20white%20bowl%20professional%20food%20photography&image_size=square',
    stock: 60,
    allergens: []
  }
]

function createTables(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      allergens TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'available',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      menu_item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)
}

function getStatus(stock: number): string {
  if (stock === 0) return 'sold_out'
  if (stock <= 5) return 'low_stock'
  return 'available'
}

function insertMockData(db: Database): void {
  const result = db.exec('SELECT COUNT(*) as count FROM menu_items')
  const count = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 0

  if (Number(count) === 0) {
    for (const item of MENU_ITEMS) {
      const stmt = db.prepare(`
        INSERT INTO menu_items (name, description, price, category, image, stock, allergens, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run([
        item.name,
        item.description,
        item.price,
        item.category,
        item.image,
        item.stock,
        JSON.stringify(item.allergens),
        getStatus(item.stock)
      ])
      stmt.free()
    }
    console.log('Mock data inserted successfully')
  } else {
    console.log('Menu items already exist, skipping mock data insertion')
  }
}

async function main(): Promise<void> {
  const db = await getDatabase()
  console.log('Creating tables...')
  createTables(db)
  console.log('Tables created successfully')
  
  console.log('Inserting mock data...')
  insertMockData(db)
  
  saveDatabase(db)
  console.log('Database initialization completed!')
}

main().catch(console.error)
