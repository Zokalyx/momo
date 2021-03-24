"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = __importDefault(require("./data"));
const card_1 = __importDefault(require("./card"));
const server = express_1.default();
server.all('/', (req, res) => {
    res.send(displayPackInfo());
});
function keepAlive() {
    console.log("Opening server...");
    server.listen(3000, () => { console.log("Server online!"); });
}
exports.default = keepAlive;
function displayPackInfo() {
    let ans = "";
    let arr = data_1.default.cards[data_1.default.cache.packInWebsite];
    for (const ci of arr) {
        let c = JSON.parse(JSON.stringify(ci));
        Object.setPrototypeOf(c, card_1.default.prototype);
        let cont = c.content;
        delete c.content;
        ans += `<strong>${c.getName()}</strong> ${JSON.stringify(c)} <br> <img src="${cont}"> <br> <br>`;
    }
    return ans;
}
