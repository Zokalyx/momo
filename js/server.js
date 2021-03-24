"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server = express_1.default();
server.all('/', (req, res) => {
    res.send('Hi uwu');
});
function keepAlive() {
    console.log("Opening server...");
    server.listen(3000, () => { console.log("Server online!"); });
}
exports.default = keepAlive;
