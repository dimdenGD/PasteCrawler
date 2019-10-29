const { remote } = require('electron');
const betterSQLite3 = require("better-sqlite3");
const path = require("path");
const db = betterSQLite3(path.join(__dirname, "../dbs/db.db"));
const geti = i => document.getElementById(i);
const config = require("../dbs/options.json");
const fs = require("fs");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const sanitizeHTML = require('sanitize-html');
const proxyAgent = require("proxy-agent");
const p = l => path.join(__dirname, l);

let p_http = fs.readFileSync(p("../dbs/proxy/http.txt"), "utf8").split(config.proxyDelimiter);
let p_https = fs.readFileSync(p("../dbs/proxy/https.txt"), "utf8").split(config.proxyDelimiter);
let p_socks4 = fs.readFileSync(p("../dbs/proxy/socks4.txt"), "utf8").split(config.proxyDelimiter);
let p_socks5 = fs.readFileSync(p("../dbs/proxy/socks5.txt"), "utf8").split(config.proxyDelimiter);
let proxies = {
    http: p_http,
    https: p_https,
    socks4: p_socks4,
    socks5: p_socks5
}


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

fs.readFile(p("../dbs/proxy/http.txt"), "utf8", (err, data) => {
    geti('proxy-area').value = data;
})
let v = "HTTP";

geti("proxy-type").addEventListener("change", () => {
    v = geti('proxy-type').value;
    fs.readFile(p(`../dbs/proxy/${v.toLowerCase()}.txt`), "utf8", (err, data) => {
        geti('proxy-area').value = data;
    })
})

geti("proxy-area").addEventListener("change", () => {
    fs.writeFileSync(p(`../dbs/proxy/${v.toLowerCase()}.txt`), geti('proxy-area').value);
    p_http = fs.readFileSync(p("../dbs/proxy/http.txt"), "utf8").split(config.proxyDelimiter);
    p_https = fs.readFileSync(p("../dbs/proxy/https.txt"), "utf8").split(config.proxyDelimiter);
    p_socks4 = fs.readFileSync(p("../dbs/proxy/socks4.txt"), "utf8").split(config.proxyDelimiter);
    p_socks5 = fs.readFileSync(p("../dbs/proxy/socks5.txt"), "utf8").split(config.proxyDelimiter);
    proxies = {
        http: p_http,
        https: p_https,
        socks4: p_socks4,
        socks5: p_socks5
    }
})

geti('use-proxy').checked = config.useProxy;
geti('use-proxy').addEventListener("change", () => {
    config.useProxy = geti('use-proxy').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('crawl-pastebin').checked = config.crawlPastebin;
geti('crawl-pastebin').addEventListener("change", () => {
    config.crawlPastebin = geti('crawl-pastebin').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('crawl-slexy').checked = config.crawlSlexy;
geti('crawl-slexy').addEventListener("change", () => {
    config.crawlSlexy = geti('crawl-slexy').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti("crawl-pastedebian").checked = config.crawlPasteDebian;
geti('crawl-pastedebian').addEventListener("change", () => {
    config.crawlPasteDebian = geti('crawl-pastedebian').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti("repeat").checked = config.repeat;
geti('repeat').addEventListener("change", () => {
    config.repeat = geti('repeat').checked;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti("proxy-type-option").value = config.proxyType;
geti('proxy-type-option').addEventListener("change", () => {
    config.proxyType = geti('proxy-type-option').value;
    config.isDefault = false;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('custom-websites').value = config.customWebsites.join(", ");
geti('custom-websites').addEventListener("change", () => {
    config.isDefault = false;
    geti("default").hidden = true;
    config.customWebsites = geti('custom-websites').value.split(", ");
    if(config.customWebsites.length === 1) if(config.customWebsites[0] === "") config.customWebsites = [];
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('max-log').value = config.maxLog;
geti('max-log').addEventListener("change", () => {
    config.isDefault = false;
    config.maxLog = +geti('max-log').value;
    geti("default").hidden = true;
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})
geti('proxy-delimiter').value = config.proxyDelimiter.replace("\n", "\\n");
geti('proxy-delimiter').addEventListener("change", () => {
    config.isDefault = false;
    geti("default").hidden = true;
    config.proxyDelimiter = geti('proxy-delimiter').value.replace("\\n", "\n");
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
})

geti("default").hidden = !config.isDefault;

geti("add-filter").addEventListener("click", () => {
    addFilter(`/${geti("filter").value}/${geti("filter-tags").value}`, true);
})

function addFilter(regex, FS) {
    if(FS && config.filters[regex]) return;
    new RegExp(regex.split("/")[1], regex.split("/")[2]);
    const tr = document.createElement("tr");
    const cm = document.createElement("input");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const rg = document.createElement("span");
    rg.textContent = regex;
    cm.type = "checkbox";
    cm.checked = config.filters[regex];
    if(FS) {
        config.filters[regex] = false;
        fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
    }
    cm.onchange = () => {
        config.filters[regex] = cm.checked;
        fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
    };
    td1.appendChild(cm);
    td2.appendChild(rg);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.id = `regex-${regex}`;
    tr.oncontextmenu = () => {
        delete config.filters[regex];
        fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
        tr.remove();
    }
    geti("filters").appendChild(tr);
};

for(let i in config.filters) addFilter(i);
for(let i in config.runs) {
    const option = document.createElement("option");
    option.textContent = i;
    geti("table-name").appendChild(option);
}

geti("table-name").addEventListener("change", () => {
    if(geti("table-name").value === "None") {
        geti("res-length").textContent = "0";
        geti("result").value = "";
        return;
    }
    const res = db.prepare(`select * from "${geti("table-name").value}" limit 10 offset ${+geti("res-page").value}`).all();
    geti("res-length").textContent = res.length;
    let str = "";
    for(let i in res) str += `${res[i].data1} - ${res[i].from1} - ${res[i].regex}\n`;
    geti("result").value = str;
})

geti("res-page").addEventListener("change", () => {
    if(geti("table-name").value === "None") {
        geti("res-length").textContent = "0";
        geti("result").value = "";
        return;
    }
    const res = db.prepare(`select * from "${geti("table-name").value}" limit 10 offset ${+geti("res-page").value*10}`).all();
    let str = "";
    for(let i in res) str += `${res[i].data1} - ${res[i].from1} - ${res[i].regex}\n`;
    geti("result").value = str;
})

let bot;

geti("start").addEventListener("click", () => {
    bot = new PasteCrawler(config);
    geti("start").disabled = true;
    geti("stop").disabled = false;
})

geti("stop").addEventListener("click", () => {
    bot.destruct();
    bot = undefined;
})

class PasteCrawler {
    constructor(options) {
        const PasteCrawler = this;
        this.options = options;
        this.crawled = 0;
        this.matches = 0;
        this.regexes = [];
        this.date = Date.now();
        this.websites = [...options.customWebsites];
        this.options.filters = filter(this.options.filters, i => i);
        if(Object.keys(this.options.filters).length === 0) {
            this.destruct();
            bot = undefined;
            this.log("No filters.");
            return;
        }
        for(let i in this.options.filters) this.regexes.push(regexify(i));
        this.regex = this.regexes[0];
        this.tableName = Date.now() + "-" + this.regex.toString();
        db.prepare(/*sql*/`create table "${this.tableName}" (data1 text, from1 text, regex text)`).run();
        this.query = db.prepare(/*sql*/`insert into "${this.tableName}" (data1, from1, regex) values (?, ?, ?)`);
        geti("status").textContent = "0/0";
        geti("status").className = "on";

        config.runs[this.tableName] = 1;
        fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));

        const option = document.createElement("option");
        option.textContent = this.tableName;
        geti("table-name").appendChild(option);
        function crawl() {
            if(options.crawlPastebin) PasteCrawler.crawlPastebin();
            if(options.crawlSlexy) PasteCrawler.crawlSlexy();
            if(options.crawlPasteDebian) PasteCrawler.crawlPasteDebian();
            if(PasteCrawler.websites.length > 0) PasteCrawler.crawlCustomWebsites();
        };


        crawl();
        this.int = setInterval(crawl, 15000);
    }
    crawlPastebin() {
        const opt = {};
        if(this.options.useProxy && proxies[this.options.proxyType].length > 0) opt.agent = new proxyAgent(`${this.options.proxyType}://${proxies[this.options.proxyType][Math.random() * proxies[this.options.proxyType].length>>0]}`);
        fetch("https://pastebin.com/archive", opt).then(res => res.text())
        .then(html => {
            let links = html.match(/(?<=class\="i_p0" alt="" \/\>\<a href\=\")(.*)(?=\"\>)/g);
            for(let i in links) {
                if(db.prepare(`select from1 from "${this.tableName}" where from1 = "${`https://pastebin.com/raw${links[i]}`}"`).all().length !== 0) continue;
                this.crawled++;
                this.update();
                this.log(`Crawling https://pastebin.com/raw${links[i]}...`);
                if(this.options.useProxy && proxies[this.options.proxyType].length > 0) opt.agent = new proxyAgent(`${this.options.proxyType}://${proxies[this.options.proxyType][Math.random() * proxies[this.options.proxyType].length>>0]}`);
                fetch(`https://pastebin.com/raw${links[i]}`, opt).then(res => res.text())
                .then(data => {
                    console.log(data);
                    for(let j in this.regexes) {
                        let matches = data.match(this.regexes[j]);
                        if(!matches) matches = [];
                        this.matches += matches.length;
                        if(matches.length > 0) this.log(`Found ${matches.length} matches by ${this.regexes[j].toString()} regex.`);
                        for(let k in matches) if(db.prepare(`select data1 from "${this.tableName}" where data1 = "${matches[k]}"`).all().length === 0) this.query.run(matches[k], `https://pastebin.com/raw${links[i]}`, this.regexes[j].toString());
                        this.update();
                        this.websites.splice(i, 1);
                    }
                })
            }
        }).catch(() => {this.log("Failed getting pastebin pastes.")})
    }
    crawlSlexy() {

    }
    crawlPasteDebian() {

    }
    crawlCustomWebsites() {
        for(let i in this.websites) {
            if(db.prepare(`select from1 from "${this.tableName}" where from1 = "${this.websites[i]}"`).all().length !== 0) continue;
            this.crawled++;
            this.update();
            this.log(`Crawling ${this.websites[i]}...`);
            const opt = {};
            if(this.options.useProxy && proxies[this.options.proxyType].length > 0) opt.agent = new proxyAgent(`${this.options.proxyType}://${proxies[this.options.proxyType][Math.random() * proxies[this.options.proxyType].length>>0]}`);
            fetch(this.websites[i], opt).then(res => res.text())
            .then(html => {
                for(let j in this.regexes) {
                    let dom = new JSDOM(html);
                    let matches = sanitizeHTML(dom.window.document.body.textContent, {
                        allowedTags: [],
                        allowedAttributes: {},
                      });
                    matches = matches.match(this.regexes[j]);
                    if(!matches) matches = [];
                    this.matches += matches.length;
                    if(matches.length > 0) this.log(`Found ${matches.length} matches by ${this.regexes[j].toString()} regex.`);
                    for(let k in matches) if(db.prepare(`select data1 from "${this.tableName}" where data1 = "${matches[k]}"`).all().length === 0) this.query.run(matches[k], this.websites[i], this.regexes[j].toString());
                    this.update();
                    this.websites.splice(i, 1);
                    if(this.websites.length === 0
                    && !this.options.crawlSlexy
                    && !this.options.crawlPastebin
                    && !this.options.crawlPasteDebian
                    && !this.options.repeat) {
                        bot.destruct();
                        bot.log("Everything done.");
                        bot = undefined;
                    }
                }
            })
        }
    }
    destruct() {
        clearInterval(this.int);
        geti("status").textContent = "OFFLINE";
        geti("status").className = "off";
        geti("start").disabled = false;
        geti("stop").disabled = true;
    }
    log(msg) {
        let v = geti("log").value;
        if(v.split("\n").length > config.maxLog) v = v.split("\n").slice(1).join("\n");
        geti("log").value = v.split("\n").concat(msg).filter(i => i).join("\n");
        geti("log").scrollTop = geti("log").scrollHeight;
    }
    update() {
        geti("status").textContent = `${this.matches}/${this.crawled}`;
        geti("total-pastes").textContent = `Total Pastes: ${this.crawled}`;
        geti("total-matches").textContent = `Total Matches: ${this.matches}`;
        let time = new Date(Date.now() - this.date);
        geti("total-time").textContent = `Total Time: ${time.getUTCHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    }
}

function filter(obj, fn) {
    const obj2 = {};
    for(let i in obj) if(fn(obj[i])) obj2[i] = obj[i];
    return obj2;
}

const regexify = str => {
    const main = str.match(/\/(.+)\/.*/)[1];
    const options = str.match(/\/.+\/(.*)/)[1];

    return new RegExp(main, options);
}

geti("clean").addEventListener("click", () => {
    if(!confirm("Are you sure that you want to delete everything?")) return;
    fs.writeFileSync(path.join(__dirname, "../dbs/db.db"), "");
    config.runs = {};
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
    geti("table-name").innerHTML = "<option>None</option>";
    geti("table-name").value = "None";
    geti("result").value = "";
    geti("res-length").textContent = "0";
    if(bot) bot.destruct();
});
geti("delete").addEventListener("click", () => {
    if(!confirm("Are you sure that you want to delete this table?")) return;
    let tableName = geti("table-name").value;
    if(tableName === "None") return;
    delete config.runs[tableName];
    fs.writeFileSync(p("../dbs/options.json"), JSON.stringify(config, null, 4));
    db.prepare(`drop table if exists "${tableName}"`).run();
    geti("table-name").value = "None";
    Array.from(geti("table-name").children).forEach(i => {
        if(i.textContent === tableName) i.remove();
    })
    if(bot) if(bot.tableName === tableName) bot.destruct();
    geti("result").value = "";
    geti("res-length").textContent = "0";
})