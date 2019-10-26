const { remote } = require('electron');
const betterSQLite3 = require("better-sqlite3");
const db = betterSQLite3("../dbs/db.db");
const res = betterSQLite3("../dbs/res.db");

db.prepare(/*sql*/`create table if not exists proxies (proxy text primary key, type text)`).run();
db.prepare(/*sql*/`create table if not exists filters (fname text primary key, filter text )`).run();

document.getElementById('minimize').addEventListener('click', () => {
    remote.getCurrentWindow().minimize();
});

document.getElementById('resize').addEventListener('click', () => {
    const currentWindow = remote.getCurrentWindow();
    if(currentWindow.isMaximized()) currentWindow.unmaximize();
    else currentWindow.maximize();
});

document.getElementById('exit').addEventListener('click', () => {
    remote.app.quit();
});

class PasteCrawler {
    constructor(options = {}) {
        this.crawled = 0;
        this.collected = 0;
    }
}