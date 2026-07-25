import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'banking.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Habits table
db.exec(`
	CREATE TABLE IF NOT EXISTS habits (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		start_date TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// Habit logs table
db.exec(`
	CREATE TABLE IF NOT EXISTS habit_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		habit_id INTEGER NOT NULL,
		log_date TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(habit_id, log_date),
		FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
	)
`);

// Tracked artists table
db.exec(`
	CREATE TABLE IF NOT EXISTS tracked_artists (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// Daily tarot draws table
db.exec(`
	CREATE TABLE IF NOT EXISTS daily_tarot_draws (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		draw_date TEXT NOT NULL UNIQUE,
		card_name TEXT NOT NULL,
		card_desc TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// Notes/Todos table
db.exec(`
	CREATE TABLE IF NOT EXISTS notes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// User points table
db.exec(`
	CREATE TABLE IF NOT EXISTS user_points (
		id INTEGER PRIMARY KEY,
		points INTEGER DEFAULT 0,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// Initialize points if not exists
const pointsCount = db.prepare('SELECT COUNT(*) as count FROM user_points').get() as {
	count: number;
};
if (pointsCount.count === 0) {
	db.prepare('INSERT INTO user_points (id, points) VALUES (1, 0)').run();
}

// Bad habits table
db.exec(`
	CREATE TABLE IF NOT EXISTS bad_habits (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		point_penalty INTEGER NOT NULL DEFAULT 5,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// Bad habit logs table
db.exec(`
	CREATE TABLE IF NOT EXISTS bad_habit_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		bad_habit_id INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (bad_habit_id) REFERENCES bad_habits(id) ON DELETE CASCADE
	)
`);

// Shop items table
db.exec(`
	CREATE TABLE IF NOT EXISTS shop_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		point_cost INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// Shop purchases table
db.exec(`
	CREATE TABLE IF NOT EXISTS shop_purchases (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		shop_item_id INTEGER NOT NULL,
		purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (shop_item_id) REFERENCES shop_items(id) ON DELETE CASCADE
	)
`);

db.exec(`
	CREATE INDEX IF NOT EXISTS idx_bad_habit_logs_habit_id
	ON bad_habit_logs(bad_habit_id)
`);

db.exec(`
	CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id
	ON habit_logs(habit_id)
`);

db.exec(`
	CREATE INDEX IF NOT EXISTS idx_habit_logs_date
	ON habit_logs(log_date)
`);

export interface Habit {
	id?: number;
	name: string;
	startDate: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface HabitLog {
	id?: number;
	habitId: number;
	logDate: string;
	createdAt?: string;
}

export interface TrackedArtist {
	id?: number;
	name: string;
	createdAt?: string;
}

export interface DailyTarotDraw {
	id?: number;
	drawDate: string;
	cardName: string;
	cardDesc: string;
	createdAt?: string;
}

export interface Note {
	id?: number;
	content: string;
	createdAt?: string;
}

export interface UserPoints {
	id: number;
	points: number;
	updatedAt?: string;
}

export interface BadHabit {
	id?: number;
	name: string;
	pointPenalty: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface BadHabitLog {
	id?: number;
	badHabitId: number;
	createdAt?: string;
}

export interface ShopItem {
	id?: number;
	name: string;
	pointCost: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface ShopPurchase {
	id?: number;
	shopItemId: number;
	purchasedAt?: string;
}

const habitStatements = {
	getAll: db.prepare(`
		SELECT
			id,
			name,
			start_date as startDate,
			created_at as createdAt,
			updated_at as updatedAt
		FROM habits
		ORDER BY created_at DESC
	`),

	getById: db.prepare(`
		SELECT
			id,
			name,
			start_date as startDate,
			created_at as createdAt,
			updated_at as updatedAt
		FROM habits
		WHERE id = ?
	`),

	insert: db.prepare(`
		INSERT INTO habits (name, start_date)
		VALUES (?, ?)
	`),

	update: db.prepare(`
		UPDATE habits
		SET name = ?, start_date = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`),

	delete: db.prepare(`
		DELETE FROM habits
		WHERE id = ?
	`)
};

const habitLogStatements = {
	getByHabitId: db.prepare(`
		SELECT
			id,
			habit_id as habitId,
			log_date as logDate,
			created_at as createdAt
		FROM habit_logs
		WHERE habit_id = ?
		ORDER BY log_date DESC
	`),

	getByHabitAndDate: db.prepare(`
		SELECT
			id,
			habit_id as habitId,
			log_date as logDate,
			created_at as createdAt
		FROM habit_logs
		WHERE habit_id = ? AND log_date = ?
	`),

	insert: db.prepare(`
		INSERT INTO habit_logs (habit_id, log_date)
		VALUES (?, ?)
	`),

	delete: db.prepare(`
		DELETE FROM habit_logs
		WHERE id = ?
	`),

	deleteByHabitAndDate: db.prepare(`
		DELETE FROM habit_logs
		WHERE habit_id = ? AND log_date = ?
	`)
};

const trackedArtistStatements = {
	getAll: db.prepare(`
		SELECT
			id,
			name,
			created_at as createdAt
		FROM tracked_artists
		ORDER BY created_at ASC
	`),

	insert: db.prepare(`
		INSERT INTO tracked_artists (name)
		VALUES (?)
	`),

	delete: db.prepare(`
		DELETE FROM tracked_artists
		WHERE name = ?
	`)
};

const tarotStatements = {
	getByDate: db.prepare(`
		SELECT
			id,
			draw_date as drawDate,
			card_name as cardName,
			card_desc as cardDesc,
			created_at as createdAt
		FROM daily_tarot_draws
		WHERE draw_date = ?
	`),

	insert: db.prepare(`
		INSERT INTO daily_tarot_draws (draw_date, card_name, card_desc)
		VALUES (?, ?, ?)
	`)
};

const noteStatements = {
	getAll: db.prepare(`
		SELECT
			id,
			content,
			created_at as createdAt
		FROM notes
		ORDER BY created_at DESC
	`),

	insert: db.prepare(`
		INSERT INTO notes (content)
		VALUES (?)
	`),

	delete: db.prepare(`
		DELETE FROM notes
		WHERE id = ?
	`)
};

const pointsStatements = {
	get: db.prepare(`
		SELECT
			id,
			points,
			updated_at as updatedAt
		FROM user_points
		WHERE id = 1
	`),

	update: db.prepare(`
		UPDATE user_points
		SET points = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = 1
	`),

	addPoints: db.prepare(`
		UPDATE user_points
		SET points = MAX(0, points + ?), updated_at = CURRENT_TIMESTAMP
		WHERE id = 1
	`)
};

const badHabitStatements = {
	getAll: db.prepare(`
		SELECT
			id,
			name,
			point_penalty as pointPenalty,
			created_at as createdAt,
			updated_at as updatedAt
		FROM bad_habits
		ORDER BY created_at DESC
	`),

	getById: db.prepare(`
		SELECT
			id,
			name,
			point_penalty as pointPenalty,
			created_at as createdAt,
			updated_at as updatedAt
		FROM bad_habits
		WHERE id = ?
	`),

	insert: db.prepare(`
		INSERT INTO bad_habits (name, point_penalty)
		VALUES (?, ?)
	`),

	update: db.prepare(`
		UPDATE bad_habits
		SET name = ?, point_penalty = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`),

	delete: db.prepare(`
		DELETE FROM bad_habits
		WHERE id = ?
	`)
};

const badHabitLogStatements = {
	getByBadHabitId: db.prepare(`
		SELECT
			id,
			bad_habit_id as badHabitId,
			created_at as createdAt
		FROM bad_habit_logs
		WHERE bad_habit_id = ?
		ORDER BY created_at DESC
	`),

	insert: db.prepare(`
		INSERT INTO bad_habit_logs (bad_habit_id)
		VALUES (?)
	`),

	getCount: db.prepare(`
		SELECT COUNT(*) as count FROM bad_habit_logs
		WHERE bad_habit_id = ?
	`)
};

const shopItemStatements = {
	getAll: db.prepare(`
		SELECT
			id,
			name,
			point_cost as pointCost,
			created_at as createdAt,
			updated_at as updatedAt
		FROM shop_items
		ORDER BY created_at DESC
	`),

	getById: db.prepare(`
		SELECT
			id,
			name,
			point_cost as pointCost,
			created_at as createdAt,
			updated_at as updatedAt
		FROM shop_items
		WHERE id = ?
	`),

	insert: db.prepare(`
		INSERT INTO shop_items (name, point_cost)
		VALUES (?, ?)
	`),

	update: db.prepare(`
		UPDATE shop_items
		SET name = ?, point_cost = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`),

	delete: db.prepare(`
		DELETE FROM shop_items
		WHERE id = ?
	`)
};

const shopPurchaseStatements = {
	getByItemId: db.prepare(`
		SELECT
			id,
			shop_item_id as shopItemId,
			purchased_at as purchasedAt
		FROM shop_purchases
		WHERE shop_item_id = ?
		ORDER BY purchased_at DESC
	`),

	insert: db.prepare(`
		INSERT INTO shop_purchases (shop_item_id)
		VALUES (?)
	`),

	getCount: db.prepare(`
		SELECT COUNT(*) as count FROM shop_purchases
		WHERE shop_item_id = ?
	`)
};

export const habitDb = {
	getAll(): Habit[] {
		return habitStatements.getAll.all() as Habit[];
	},

	getById(id: number): Habit | undefined {
		return habitStatements.getById.get(id) as Habit | undefined;
	},

	create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): number {
		const result = habitStatements.insert.run(habit.name, habit.startDate);
		return result.lastInsertRowid as number;
	},

	update(id: number, habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): boolean {
		const result = habitStatements.update.run(habit.name, habit.startDate, id);
		return result.changes > 0;
	},

	delete(id: number): boolean {
		const result = habitStatements.delete.run(id);
		return result.changes > 0;
	}
};

export const habitLogDb = {
	getByHabitId(habitId: number): HabitLog[] {
		return habitLogStatements.getByHabitId.all(habitId) as HabitLog[];
	},

	getByHabitAndDate(habitId: number, logDate: string): HabitLog | undefined {
		return habitLogStatements.getByHabitAndDate.get(habitId, logDate) as HabitLog | undefined;
	},

	create(habitId: number, logDate: string): number {
		const result = habitLogStatements.insert.run(habitId, logDate);
		return result.lastInsertRowid as number;
	},

	delete(id: number): boolean {
		const result = habitLogStatements.delete.run(id);
		return result.changes > 0;
	},

	deleteByHabitAndDate(habitId: number, logDate: string): boolean {
		const result = habitLogStatements.deleteByHabitAndDate.run(habitId, logDate);
		return result.changes > 0;
	}
};

export const trackedArtistDb = {
	getAll(): TrackedArtist[] {
		return trackedArtistStatements.getAll.all() as TrackedArtist[];
	},

	add(name: string): number {
		const result = trackedArtistStatements.insert.run(name);
		return result.lastInsertRowid as number;
	},

	remove(name: string): boolean {
		const result = trackedArtistStatements.delete.run(name);
		return result.changes > 0;
	}
};

export const tarotDb = {
	getByDate(drawDate: string): DailyTarotDraw | undefined {
		return tarotStatements.getByDate.get(drawDate) as DailyTarotDraw | undefined;
	},

	create(drawDate: string, cardName: string, cardDesc: string): number {
		const result = tarotStatements.insert.run(drawDate, cardName, cardDesc);
		return result.lastInsertRowid as number;
	}
};

export const noteDb = {
	getAll(): Note[] {
		return noteStatements.getAll.all() as Note[];
	},

	create(content: string): number {
		const result = noteStatements.insert.run(content);
		return result.lastInsertRowid as number;
	},

	delete(id: number): boolean {
		const result = noteStatements.delete.run(id);
		return result.changes > 0;
	}
};

export const pointsDb = {
	get(): UserPoints | undefined {
		return pointsStatements.get.get() as UserPoints | undefined;
	},

	addPoints(amount: number): void {
		pointsStatements.addPoints.run(amount);
	},

	setPoints(amount: number): void {
		pointsStatements.update.run(amount);
	}
};

export const badHabitDb = {
	getAll(): BadHabit[] {
		return badHabitStatements.getAll.all() as BadHabit[];
	},

	getById(id: number): BadHabit | undefined {
		return badHabitStatements.getById.get(id) as BadHabit | undefined;
	},

	create(badHabit: Omit<BadHabit, 'id' | 'createdAt' | 'updatedAt'>): number {
		const result = badHabitStatements.insert.run(badHabit.name, badHabit.pointPenalty);
		return result.lastInsertRowid as number;
	},

	update(id: number, badHabit: Omit<BadHabit, 'id' | 'createdAt' | 'updatedAt'>): boolean {
		const result = badHabitStatements.update.run(badHabit.name, badHabit.pointPenalty, id);
		return result.changes > 0;
	},

	delete(id: number): boolean {
		const result = badHabitStatements.delete.run(id);
		return result.changes > 0;
	}
};

export const badHabitLogDb = {
	getByBadHabitId(badHabitId: number): BadHabitLog[] {
		return badHabitLogStatements.getByBadHabitId.all(badHabitId) as BadHabitLog[];
	},

	create(badHabitId: number): number {
		const result = badHabitLogStatements.insert.run(badHabitId);
		return result.lastInsertRowid as number;
	},

	getCount(badHabitId: number): number {
		const result = badHabitLogStatements.getCount.get(badHabitId) as { count: number };
		return result.count;
	}
};

export const shopItemDb = {
	getAll(): ShopItem[] {
		return shopItemStatements.getAll.all() as ShopItem[];
	},

	getById(id: number): ShopItem | undefined {
		return shopItemStatements.getById.get(id) as ShopItem | undefined;
	},

	create(shopItem: Omit<ShopItem, 'id' | 'createdAt' | 'updatedAt'>): number {
		const result = shopItemStatements.insert.run(shopItem.name, shopItem.pointCost);
		return result.lastInsertRowid as number;
	},

	update(id: number, shopItem: Omit<ShopItem, 'id' | 'createdAt' | 'updatedAt'>): boolean {
		const result = shopItemStatements.update.run(shopItem.name, shopItem.pointCost, id);
		return result.changes > 0;
	},

	delete(id: number): boolean {
		const result = shopItemStatements.delete.run(id);
		return result.changes > 0;
	}
};

export const shopPurchaseDb = {
	getByItemId(shopItemId: number): ShopPurchase[] {
		return shopPurchaseStatements.getByItemId.all(shopItemId) as ShopPurchase[];
	},

	create(shopItemId: number): number {
		const result = shopPurchaseStatements.insert.run(shopItemId);
		return result.lastInsertRowid as number;
	},

	getCount(shopItemId: number): number {
		const result = shopPurchaseStatements.getCount.get(shopItemId) as { count: number };
		return result.count;
	}
};
