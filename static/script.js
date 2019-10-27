const { remote } = require('electron');
const betterSQLite3 = require("better-sqlite3");
const path = require("path");
const db = betterSQLite3(path.join(__dirname, "../dbs/db.db"));
const res = betterSQLite3(path.join(__dirname, "../dbs/res.db"));
const geti = i => document.getElementById(i);
const config = require("../dbs/options.json");

db.prepare(/*sql*/`create table if not exists proxies (proxy text primary key, type text)`).run();
db.prepare(/*sql*/`create table if not exists filters (fname text primary key, filter text )`).run();

geti('minimize').addEventListener('click', () => {
    remote.getCurrentWindow().minimize();
});

geti('resize').addEventListener('click', () => {
    const currentWindow = remote.getCurrentWindow();
    if(currentWindow.isMaximized()) currentWindow.unmaximize();
    else currentWindow.maximize();
});

geti('exit').addEventListener('click', () => {
    remote.app.quit();
});

class PasteCrawler {
    constructor(options = {}) {
        this.crawled = 0;
        this.collected = 0;
    }
};

const menu = ["home", "proxies", "filters", "results", "options"];

for(let i of menu) {
    geti(`menu-${i}`).addEventListener("click", () => {
        for(let j of menu) {
            geti(`menu-${j}`).className = "menu-btn";
            geti(`window-${j}`).hidden = true;
        }
        geti(`menu-${i}`).className = "menu-btn selected";
        geti(`window-${i}`).hidden = false;
    })
}