"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const data_1 = __importDefault(require("./data"));
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
class Database {
    static file(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            const database = yield pool.connect();
            if (mode === "r") {
                let response = yield database.query("SELECT value FROM data;");
                database.release();
                console.log("Data loaded!");
                return response["rows"][0]["value"];
            }
            else if (mode === "w") {
                let toSave = JSON.parse(JSON.stringify(data_1.default));
                delete toSave["cache"]; // Don't save cache
                let stringy = JSON.stringify(toSave);
                yield database.query(`UPDATE data SET value = '${stringy}'`);
                database.release();
                console.log("Data saved!");
            }
        });
    }
    static autosave() {
        return __awaiter(this, void 0, void 0, function* () {
            setInterval(() => {
                if (data_1.default.cache.thereWasChange) {
                    data_1.default.cache.thereWasChange = false;
                    Database.file("w");
                }
            }, data_1.default.config.autosaveFrequency * 60 * 1000);
        });
    }
    static migrate() {
        let fs = require("fs");
        data_1.default.users = JSON.parse(fs.readFileSync("C:\\Users\\White Python\\Desktop\\Momo\\src\\users.json", 'utf8'));
        data_1.default.cards = JSON.parse(fs.readFileSync("C:\\Users\\White Python\\Desktop\\Momo\\src\\cards.json", 'utf8'));
    }
}
exports.default = Database;
