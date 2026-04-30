import { getDatabase, Database } from '../config/database'

const MENU_ITEMS = [
  {
    name: '宫保鸡丁',
    description: '经典川菜，鸡肉配花生、干辣椒，麻辣鲜香',
    price: 38.00,
    category: '热菜',
    image: 'https://picsum.photos/seed/kungpao/300/200',
    stock: 50,
    allergens: ['花生', '辣椒']
  },
  {
    name: '红烧肉',
    description: '肥而不腻的传统红烧肉，入口即化',
    price: 58.00,
    category: '热菜',
    image: 'https://picsum.photos/seed/braisedpork/300/200',
    stock: 30,
    allergens: []
  },
  {
    name: '清蒸鲈鱼',
    description: '新鲜鲈鱼清蒸，保留原汁原味，鲜嫩可口',
    price: 88.00,
    category: '热菜',
    image: 'https://picsum.photos/seed/steamedfish/300/200',
    stock: 20,
    allergens: ['鱼类']
  },
  {
    name: '麻婆豆腐',
    description: '四川经典名菜，麻辣鲜香，豆腐嫩滑',
    price: 28.00,
    category: '热菜',
    image: 'https://picsum.photos/seed/mapotofu/300/200',
    stock: 100,
    allergens: ['辣椒', '大豆']
  },
  {
    name: '糖醋排骨',
    description: '酸甜可口的经典糖醋排骨，外酥里嫩',
    price: 48.00,
    category: '热菜',
    image: 'https://picsum.photos/seed/sweetribs/300/200',
    stock: 40,
    allergens: []
  },
  {
    name: '扬州炒饭',
    description: '粒粒分明的扬州炒饭，配料丰富',
    price: 22.00,
    category: '主食',
    image: 'https://picsum.photos/seed/yangzhourice/300/200',
    stock: 80,
    allergens: ['鸡蛋', '虾类']
  },
  {
    name: '白米饭',
    description: '优质东北大米，粒粒饱满',
    price: 3.00,
    category: '主食',
    image: 'https://picsum.photos/seed/whiterice/300/200',
    stock: 200,
    allergens: []
  },
  {
    name: '担担面',
    description: '四川特色担担面，麻辣鲜香',
    price: 18.00,
    category: '主食',
    image: 'https://picsum.photos/seed/dandanmian/300/200',
    stock: 60,
    allergens: ['花生', '辣椒', '小麦']
  },
  {
    name: '酸辣土豆丝',
    description: '清爽可口的经典家常菜',
    price: 16.00,
    category: '素菜',
    image: 'https://picsum.photos/seed/potatostirfry/300/200',
    stock: 150,
    allergens: ['辣椒']
  },
  {
    name: '蒜蓉西兰花',
    description: '清淡健康的蒜蓉西兰花',
    price: 20.00,
    category: '素菜',
    image: 'https://picsum.photos/seed/broccoligarlic/300/200',
    stock: 100,
    allergens: ['大蒜']
  },
  {
    name: '番茄蛋汤',
    description: '家常番茄鸡蛋汤，酸甜开胃',
    price: 12.00,
    category: '汤品',
    image: 'https://picsum.photos/seed/tomatoeggsoup/300/200',
    stock: 120,
    allergens: ['鸡蛋']
  },
  {
    name: '紫菜蛋花汤',
    description: '清淡鲜美的紫菜蛋花汤',
    price: 10.00,
    category: '汤品',
    image: 'https://picsum.photos/seed/seaweedsoup/300/200',
    stock: 120,
    allergens: ['鸡蛋']
  },
  {
    name: '可乐',
    description: '经典可口可乐',
    price: 6.00,
    category: '饮品',
    image: 'https://picsum.photos/seed/cola/300/200',
    stock: 200,
    allergens: []
  },
  {
    name: '鲜榨橙汁',
    description: '新鲜橙子现榨，维C满满',
    price: 15.00,
    category: '饮品',
    image: 'https://picsum.photos/seed/orangejuice/300/200',
    stock: 50,
    allergens: []
  },
  {
    name: '芒果布丁',
    description: '香甜芒果布丁，口感丝滑',
    price: 18.00,
    category: '甜品',
    image: 'https://picsum.photos/seed/mangopudding/300/200',
    stock: 40,
    allergens: ['乳制品', '芒果']
  },
  {
    name: '水果沙拉',
    description: '新鲜水果拼盘，清爽解腻',
    price: 25.00,
    category: '甜品',
    image: 'https://picsum.photos/seed/fruitsalad/300/200',
    stock: 60,
    allergens: []
  }
]

function createTables(db: Database.Database): void {
  db.exec(`
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
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      menu_item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `)
}

function getStatus(stock: number): string {
  if (stock === 0) return 'sold_out'
  if (stock <= 5) return 'low_stock'
  return 'available'
}

function insertMockData(db: Database.Database): void {
  const insertStmt = db.prepare(`
    INSERT INTO menu_items (name, description, price, category, image, stock, allergens, status)
    VALUES (@name, @description, @price, @category, @image, @stock, @allergens, @status)
  `)

  const insertMany = db.transaction((items: typeof MENU_ITEMS) => {
    for (const item of items) {
      insertStmt.run({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        stock: item.stock,
        allergens: JSON.stringify(item.allergens),
        status: getStatus(item.stock)
      })
    }
  })

  const count = db.prepare('SELECT COUNT(*) as count FROM menu_items').get() as { count: number }
  if (count.count === 0) {
    insertMany(MENU_ITEMS)
    console.log('Mock data inserted successfully')
  } else {
    console.log('Menu items already exist, skipping mock data insertion')
  }
}

function main(): void {
  const db = getDatabase()
  console.log('Creating tables...')
  createTables(db)
  console.log('Tables created successfully')
  
  console.log('Inserting mock data...')
  insertMockData(db)
  console.log('Database initialization completed!')
  
  db.close()
}

main()
