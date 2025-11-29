import { openDB } from 'idb';

const DB_NAME = 'ZencyDB';
const DB_VERSION = 2;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // User store for XP, Level, Settings
            if (!db.objectStoreNames.contains('user')) {
                db.createObjectStore('user', { keyPath: 'id' });
            }
            // Goals store
            if (!db.objectStoreNames.contains('goals')) {
                db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
            }
            // Habits store
            if (!db.objectStoreNames.contains('habits')) {
                db.createObjectStore('habits', { keyPath: 'id', autoIncrement: true });
            }
            // Habit Logs store (for completions)
            if (!db.objectStoreNames.contains('habit_logs')) {
                const store = db.createObjectStore('habit_logs', { keyPath: 'id', autoIncrement: true });
                store.createIndex('habitId', 'habitId');
                store.createIndex('date', 'date');
            }
            // Tasks store
            if (!db.objectStoreNames.contains('tasks')) {
                db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            }
            // Sleep Logs store
            if (!db.objectStoreNames.contains('sleep_logs')) {
                db.createObjectStore('sleep_logs', { keyPath: 'date' });
            }
            // Journal Entries store
            if (!db.objectStoreNames.contains('journal_entries')) {
                db.createObjectStore('journal_entries', { keyPath: 'id', autoIncrement: true });
            }
            // Categories store
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            }
            // Timer Logs store
            if (!db.objectStoreNames.contains('timer_logs')) {
                const store = db.createObjectStore('timer_logs', { keyPath: 'id', autoIncrement: true });
                store.createIndex('taskId', 'taskId');
                store.createIndex('startTime', 'startTime');
            }
        },
        blocked() {
            // This runs if there are other tabs open with the old version
            alert("Update Pending: Please close ALL other tabs of this app to allow the database to upgrade, then reload this page.");
        },
        blocking() {
            // This runs if this tab is blocking a new version
            console.warn("This tab is blocking a database upgrade.");
        },
    });
};

export const db = {
    async get(store, id) {
        const db = await initDB();
        return db.get(store, id);
    },
    async getAll(store) {
        const db = await initDB();
        return db.getAll(store);
    },
    async add(store, value) {
        const db = await initDB();
        return db.add(store, value);
    },
    async put(store, value) {
        const db = await initDB();
        return db.put(store, value);
    },
    async delete(store, id) {
        const db = await initDB();
        return db.delete(store, id);
    },
    async getFromIndex(store, indexName, key) {
        const db = await initDB();
        return db.getAllFromIndex(store, indexName, key);
    },
};
