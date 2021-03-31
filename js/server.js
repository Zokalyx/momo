"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = __importDefault(require("./data"));
const user_1 = __importDefault(require("./user"));
const card_1 = __importDefault(require("./card"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const server = express_1.default();
server.all('/', (req, res) => {
    res.send(listPacks());
});
server.use(body_parser_1.default.text({ limit: '50mb' }));
server.use(cors_1.default());
server.use(body_parser_1.default.urlencoded({
    limit: '50mb',
    extended: true
}));
function keepAlive() {
    console.log("Opening server...");
    server.listen(3000, () => { console.log("Server online!"); });
}
exports.default = keepAlive;
for (const pack in data_1.default.cards) {
    server.all("/" + pack, (req, res) => {
        res.send(displayPackInfo(pack));
    });
}
server.all("/editor", (req, res, next) => {
    res.sendFile("editor.html", { root: "./js/" });
});
server.get("/json", (req, res, next) => {
    res.send(JSON.stringify(data_1.default));
});
server.post("/json", (req, res, next) => {
    console.log("Received POST request");
    let resp = JSON.parse(req.body);
    data_1.default.users = resp.users;
    data_1.default.config = resp.config;
    data_1.default.cards = resp.cards;
    data_1.default.storage = resp.storage;
    card_1.default.populate();
    user_1.default.populate();
    console.log("Saved data from web editor");
    res.sendStatus(200);
});
server.all("/:pack", (req, res, next) => {
    let pack = req.params.pack;
    if (pack in data_1.default.cards) {
        res.send(displayPackInfo(pack));
    }
});
function displayPackInfo(pack) {
    let ans = "<a href='../'> Menú </a> <br> <br> <br>";
    let arr = data_1.default.cards[pack];
    for (const ci of arr) {
        let c = JSON.parse(JSON.stringify(ci));
        Object.setPrototypeOf(c, card_1.default.prototype);
        let cont = c.content;
        delete c.content;
        delete c.isCard;
        delete c.id;
        delete c.type;
        ans += `<strong>${c.getName()}</strong> ${JSON.stringify(c)} <br> <a href="${cont}"> <img height=300 src="${cont}"> </a> <br> <br>`;
    }
    return ans;
}
function listPacks() {
    let ans = `<a href='/editor'> Editor de datos </a> <br> <br> <br>`;
    for (const pack in data_1.default.cards) {
        ans += `<a href='/${pack}'> ${pack} </a> <br>`;
    }
    return ans;
}
server.use(express_1.default.static("website"));
