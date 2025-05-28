// types.ts
export interface Strategy {
  time: number // 主键字段（时间戳）
  row: string // 其他策略字段
  request: string // 请求参数
  mqtt: string // MQTT 参数
}

type DBOperation<T> = (db: IDBDatabase) => IDBRequest<T>

const DB_NAME = 'vpdDBV2'
const STORE_NAME = 'strategys_v2'
const DB_VERSION = 2

export class IndexedDB {
  private static instance: IDBDatabase | null = null

  // 获取数据库实例（Promise 方式）
  static async getDB(): Promise<IDBDatabase> {
    if (this.instance) return this.instance

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.handleUpgrade(db, event.oldVersion)
      }

      request.onsuccess = (event) => {
        this.instance = (event.target as IDBOpenDBRequest).result
        resolve(this.instance)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  private static handleUpgrade(db: IDBDatabase, oldVersion: number) {
    if (oldVersion < 1) {
      // 初始版本创建
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'time',
        autoIncrement: false,
      })
      store.createIndex('time_idx', 'time', { unique: true })
    }

    // 后续版本升级逻辑
    // if (oldVersion < 2) { ... }
  }

  // 通用事务执行方法
  private static async execute<T>(operation: DBOperation<T>): Promise<T> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const request = operation(db)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  static async insert(strategy: Strategy): Promise<void> {
    if (typeof strategy.time !== 'number') {
      throw new TypeError('策略对象必须包含有效的 time 字段')
    }

    await this.execute((db) => {
      return db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).add(strategy)
    })
  }

  static async batchInsert(strategies: Strategy[]): Promise<void> {
    if (strategies.length === 0) return
    if (strategies.length > 1000) {
      throw new Error('单次批量插入不得超过 1000 条')
    }

    const uniqueTimes = new Set(strategies.map((s) => s.time))
    if (uniqueTimes.size !== strategies.length) {
      throw new Error('存在重复的 time 值')
    }

    await this.execute((db) => {
      const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME)
      strategies.forEach((s) => store.add(s))
      return store.getAllKeys() // 返回任意请求以捕获错误
    })
  }

  static async upsert(strategy: Strategy): Promise<void> {
    if (typeof strategy.time !== 'number') {
      throw new TypeError('策略对象必须包含有效的 time 字段')
    }

    await this.execute((db) => {
      return db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(strategy) // 自动根据主键 time 进行更新或插入
    })
  }

  static async batchUpsert(strategies: Strategy[]): Promise<void> {
    if (strategies.length === 0) return
    if (strategies.length > 1000) {
      throw new Error('单次批量操作不得超过 1000 条')
    }

    await this.execute((db) => {
      const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME)
      strategies.forEach((s) => store.put(s)) // 批量使用 put 方法
      return store.getAllKeys() // 返回任意请求以捕获错误
    })
  }

  static async getLast(): Promise<Strategy | null> {
    return this.execute((db) => {
      return db
        .transaction(STORE_NAME)
        .objectStore(STORE_NAME)
        .index('time_idx')
        .openCursor(null, 'prev')
    }).then((cursor) => cursor?.value || null)
  }

  static async getByTime(time: number): Promise<Strategy | null> {
    return this.execute((db) => {
      return db.transaction(STORE_NAME).objectStore(STORE_NAME).get(time)
    })
  }

  static async queryByTimeRange(start: number, end: number): Promise<Strategy[]> {
    return this.execute((db) => {
      return db
        .transaction(STORE_NAME)
        .objectStore(STORE_NAME)
        .getAll(IDBKeyRange.bound(start, end))
    })
  }

  static async paginatedQuery(
    start: number,
    end: number,
    page: number,
    pageSize: number,
  ): Promise<{ data: Strategy[]; total: number }> {
    const [total, data] = await Promise.all([
      this.execute((db) => {
        return db
          .transaction(STORE_NAME)
          .objectStore(STORE_NAME)
          .count(IDBKeyRange.bound(start, end))
      }),
      this.execute((db) => {
        return db
          .transaction(STORE_NAME)
          .objectStore(STORE_NAME)
          .getAll(IDBKeyRange.bound(start, end), pageSize * (page - 1))
      }),
    ])

    return { data: data.slice(0, pageSize), total }
  }

  static async getAll(): Promise<Strategy[]> {
    return this.execute((db) => {
      return db.transaction(STORE_NAME).objectStore(STORE_NAME).getAll()
    })
  }
}
