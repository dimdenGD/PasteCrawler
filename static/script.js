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

geti('use-proxy').checked = config.useProxy;
geti('use-proxy').addEventListener("change", () => {
    config.useProxy = geti('use-proxy').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('crawl-pastebin').checked = config.crawlPastebin;
geti('crawl-pastebin').addEventListener("change", () => {
    config.crawlPastebin = geti('crawl-pastebin').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('crawl-slexy').checked = config.crawlSlexy;
geti('crawl-slexy').addEventListener("change", () => {
    config.crawlSlexy = geti('crawl-slexy').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti("crawl-pastedebian").checked = config.crawlPasteDebian;
geti('crawl-pastedebian').addEventListener("change", () => {
    config.crawlPasteDebian = geti('crawl-pastedebian').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti("proxy-type-option").value = config.proxyType;
geti('proxy-type-option').addEventListener("change", () => {
    config.proxyType = geti('proxy-type-option').value;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('custom-websites').value = config.customWebsites.join(", ");
geti('custom-websites').addEventListener("change", () => {
    config.isDefault = false;
    geti("default").hidden = true;
    config.customWebsites = geti('custom-websites').value.split(", ");
    if(config.customWebsites.length === 1) if(config.customWebsites[0] === "") config.customWebsites = [];
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('max-log').value = config.maxLog;
geti('max-log').addEventListener("change", () => {
    config.isDefault = false;
    config.maxLog = +geti('max-log').value;
    geti("default").hidden = true;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('proxy-delimiter').value = config.proxyDelimiter.replace("\n", "\\n");
geti('proxy-delimiter').addEventListener("change", () => {
    config.isDefault = false;
    geti("default").hidden = true;
    config.proxyDelimiter = geti('proxy-delimiter').value.replace("\\n", "\n");
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
})

geti("default").hidden = !config.isDefault;

geti("add-filter").addEventListener("click", () => {
    addFilter(`/${geti("filter").value}/${geti("filter-tags").value}`);
})

function addFilter(regex) {
    const tr = document.createElement("tr");
    const cm = document.createElement("input");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const rg = document.createElement("span");
    rg.textContent = regex;
    cm.type = "checkbox";
    cm.checked = config.filters[regex];
    config.filters[regex] = false;
    fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
    cm.onchange = () => {
        config.filters[regex] = cm.checked;
        fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
    };
    td1.appendChild(cm);
    td2.appendChild(rg);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.id = `regex-${regex}`;
    tr.oncontextmenu = () => {
        delete config.filters[regex];
        fs.writeFileSync(path.join(__dirname, "../dbs/options.json"), JSON.stringify(config, null, 4));
        tr.remove();
    }
    geti("filters").appendChild(tr);
};

for(let i in config.filters) addFilter(i);