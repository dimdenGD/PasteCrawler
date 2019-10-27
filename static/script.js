const { remote } = require('electron');
const betterSQLite3 = require("better-sqlite3");
const path = require("path");
const db = betterSQLite3(path.join(__dirname, "../dbs/db.db"));
const geti = i => document.getElementById(i);
const config = require("../dbs/options.json");
const fs = require("fs");

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

fs.readFile(path.join(__dirname, "../dbs/proxy/http.txt"), "utf8", (err, data) => {
    geti('proxy-area').value = data;
})
let v = "HTTP";

geti("proxy-type").addEventListener("change", () => {
    v = geti('proxy-type').value;
    fs.readFile(path.join(__dirname, `../dbs/proxy/${v.toLowerCase()}.txt`), "utf8", (err, data) => {
        geti('proxy-area').value = data;
    })
})

geti("proxy-area").addEventListener("change", () => {
    fs.writeFileSync(path.join(__dirname, `../dbs/proxy/${v.toLowerCase()}.txt`), geti('proxy-area').value)
})