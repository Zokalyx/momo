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
const discord_js_1 = __importDefault(require("discord.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("console-stamp")(console, "HH:MM:ss");
const server_1 = __importDefault(require("./server"));
const database_1 = __importDefault(require("./database"));
const data_1 = __importDefault(require("./data"));
const main_1 = __importDefault(require("./main"));
const user_1 = __importDefault(require("./user"));
const card_1 = __importDefault(require("./card"));
server_1.default();
const client = new discord_js_1.default.Client();
console.log("Retrieving data...");
database_1.default.file("r")
    .then(val => {
    Object.assign(data_1.default, val);
    database_1.default.autosave();
    console.log("Creating objects...");
    user_1.default.populate();
    card_1.default.populate();
    console.log("Created objects!");
    console.log("Logging in to Discord...");
    client.login(process.env.DISCORD_TOKEN);
})
    .catch(() => {
    console.log("Couldn't connect to database, shutting down...");
    process.exit();
});
client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connection to Discord established!");
    client.user.setPresence({
        status: "online",
        activity: {
            name: "new",
            type: "LISTENING"
        }
    });
}));
client.on("message", (msg) => {
    main_1.default.cmdHandler(msg, client);
});
client.on("messageReactionAdd", main_1.default.rctHandler);
