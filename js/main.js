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
const discord_js_1 = require("discord.js");
const card_1 = __importDefault(require("./card"));
const user_1 = __importDefault(require("./user"));
const data_1 = __importDefault(require("./data"));
const util_1 = __importDefault(require("./util"));
const database_1 = __importDefault(require("./database"));
const request_1 = __importDefault(require("./request"));
const messages_1 = __importDefault(require("./messages"));
class Main {
}
exports.default = Main;
Main.cmdHandler = CommandHandler;
Main.rctHandler = ReactionHandler;
function CommandHandler(msg, client) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!msg.content.startsWith(data_1.default.config.prefix)) {
            if (!msg.author.bot && msg.content.startsWith("http") && data_1.default.cache.waitingForBulk.status) {
                let cont = msg.content;
                let tans;
                let main = data_1.default.cache.waitingForBulk.pack;
                if (cont.includes("tenor") && !cont.endsWith(".gif")) {
                    let gifRequest = yield request_1.default.getTenorGif(cont);
                    if (gifRequest.success) {
                        cont = gifRequest.link;
                    }
                    else {
                        tans = "❌ Hubo un error";
                    }
                }
                let nw = new card_1.default({ pack: main, content: cont });
                data_1.default.cards[main].push(nw);
                let niceType = "Texto";
                if (nw.type === "gif") {
                    niceType = "Gif";
                }
                else if (nw.type === "img") {
                    niceType = "Imagen";
                }
                tans = "✅ " + niceType + " agregado/a al comando " + util_1.default.code(main) + " (#" + card_1.default.cardsIn(main) + ")";
                msg.channel.send(tans);
                return;
            }
            return;
        } // only listen when prefix
        data_1.default.cache.waitingForBulk.status = false;
        data_1.default.cache.thereWasChange = true;
        let normalArgs = msg.content.split(" "); // To be used when user input is important
        let args = normalArgs.map(a => a.toLowerCase());
        let act = args.length;
        let main = args[0].slice(data_1.default.config.prefix.length);
        let ch = msg.channel;
        let guild = msg.guild;
        if (guild === null) {
            return;
        } // avoid DMs
        if (!(ch instanceof discord_js_1.TextChannel)) {
            return;
        } // avoid weird channels
        let user = msg.author;
        let username = user.username;
        let id = user.id;
        user_1.default.createNew(id, guild, username);
        let ogUser = data_1.default.users[id]; // Og user can be the same as target.
        let ogName = ogUser.defaultName;
        let ogId = id;
        let targetFound;
        let targetUser = ogUser;
        if (act > 1) {
            let mainUserAttempt = user_1.default.getUserFromNick(args[1]);
            if (mainUserAttempt.success) {
                targetUser = mainUserAttempt.user;
                targetFound = true;
            }
            else {
                targetFound = false;
            }
        }
        else {
            targetUser = data_1.default.users[id];
            targetFound = true;
        }
        let targetName;
        let targetId;
        if (targetUser) {
            targetName = targetUser.defaultName;
            targetId = targetUser.id;
        }
        let resp = { text: undefined, embed: undefined }; // response object
        let response; // Auxiliary
        let askedForConfirm = false;
        switch (main) {
            case "move":
                if (act > 3) {
                    let val = card_1.default.validate(args[1], args[2]);
                    if (val.success) {
                        if (args[3] in data_1.default.cards) {
                            let c = val.card;
                            let oldName = c.getName();
                            c.pack = args[3];
                            data_1.default.cards[args[1]].splice(c.id, 1);
                            c.id = card_1.default.cardsIn(c.pack);
                            data_1.default.cards[args[3]].push(c);
                            card_1.default.updatePackIndexes(args[3]);
                            card_1.default.updatePackIndexes(args[1]);
                            card_1.default.updateAuctionsDueTo("move", args[1], Number(args[2]), c.pack, c.id);
                            for (const u in data_1.default.users) {
                                data_1.default.users[u].fixPack(args[1]);
                                data_1.default.users[u].fixPack(args[3]);
                            }
                            resp.text = ["✅ Se movió " + oldName + " al pack " + util_1.default.upperFirst(args[3])];
                        }
                        else {
                            resp.text = ["❌ No existe el pack " + util_1.default.upperFirst(args[3])];
                        }
                    }
                    else {
                        resp.text = [val.message];
                    }
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("move <pack> <número> <pack>")];
                }
                break;
            /*case "load":
                Database.migrate()
                break*/
            /*case "ark":
                if (act > 1) {
                    if (args[1] === "+") {
                        if (act > 3) {
                            let response = Card.validate(args[2], args[3])
                            if (response.success) {
                                resp.text = ["Se añadio " + response.card?.getLong() + " a tu arca de cartas"]
                                response.card!.inArk = true
                            } else {
                                resp.text = [response.message!]
                            }
                        } else { resp.text = ["Añadi cartas con ark + y remove con ark -"] }
                    } else if (args[1] === "-") {
                        if (act > 3) {
                            let response = Card.validate(args[2], args[3])
                            if (response.success) {
                                response.card!.inArk = false
                                resp.text = ["Se removio " + response.card?.getLong() + " de tu arca de cartas"]
                            } else {
                                resp.text = [response.message!]
                            }
                        } else { resp.text = ["Añadi cartas con ark + y remove con ark -"] }
                    }
                }
                    resp.text = ogUser.getArk().map( c => `${c.getLong()} - $${c.value} - x${c.multiplier}`)
                    resp.text.unshift("Tu arca de cartas, van a seguir siendo tuyas despues del reset")
                    resp.text.push(String(ogUser.getArk().length) + " cartas")
                    resp.text.push("Añadi cartas con ark + y remove con ark -")
                break*/
            case "backup":
                if (process.env.ON_LOCAL === "true") {
                    database_1.default.createBackup();
                    resp.text = ["✅ Backup creado"];
                }
                else {
                    resp.text = ["❌ Comando no disponible"];
                }
                break;
            case "new":
                resp.text = messages_1.default.new;
                break;
            case "help":
            case "h":
                let m = messages_1.default.help;
                let t;
                if (act > 1) {
                    switch (args[1]) {
                        case "c":
                        case "card":
                            t = m.card;
                            break;
                        case "u":
                        case "user":
                            t = m.user;
                            break;
                        case "bot":
                            t = m.bot;
                            break;
                        case "cmd":
                        case "command":
                            t = m.cmd;
                            break;
                        default:
                            t = ["❌ Uso correcto: leer `help`"];
                    }
                }
                else {
                    t = messages_1.default.help.all;
                }
                resp.text = t;
                break;
            case "n":
            case "next":
            case "p":
            case "prev":
                resp.text = ["❌ Comando actualmente no disponible"];
                break;
            case "fix":
                for (const pack in data_1.default.cards) {
                    card_1.default.updatePackIndexes(pack);
                }
                user_1.default.fixAllCol();
                resp.text = ["✅ Se arreglaron packs y collecciones"];
                break;
            case "income":
            case "inc":
            case "sub":
                let sub = ogUser.subsidio();
                let tot = ogUser.collectionInfo().total.passiveIncome;
                resp.text = [`Por día ganás **$${util_1.default.truncateTo(tot + sub, 2)}**: $${util_1.default.truncateTo(tot, 2)} por tus cartas y $${util_1.default.truncateTo(sub, 2)} por subsidio`];
                break;
            case "card":
            case "c":
                if (act > 1) {
                    if (act > 2) {
                        let response = card_1.default.validate(args[1], args[2]);
                        if (response.success) {
                            resp.embed = (_a = response.card) === null || _a === void 0 ? void 0 : _a.getEmbed();
                        }
                        else {
                            resp.text = [response.message];
                        }
                    }
                    else {
                        resp.text = ["❌ Uso correcto: " + util_1.default.code("card <pack> <número>")];
                    }
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("card <pack> <número>")];
                }
                break;
            case "confirm":
                if (data_1.default.cache.waitingForConfirm) {
                    resp.text = ["❌ Función todavía no agregada"];
                }
                else {
                    resp.text = ["❌ Comando no disponible"];
                }
                break;
            case "rename":
                response = verifyInput(args, act, "rename <pack> <número> <nombre>", true);
                if (response.success) {
                    let res = ogUser.intWithCard("rename", { card: response.card, newInfo: normalArgs.slice(3).join(" ") });
                    resp.text = [res.result];
                    if (res.success) {
                        resp.embed = response.card.getEmbed();
                    }
                }
                else {
                    resp.text = response.tans;
                }
                break;
            case "lore":
                response = verifyInput(args, act, "lore <pack> <número> <nombre>", true);
                if (response.success) {
                    let res = ogUser.intWithCard("desc", { card: response.card, newInfo: normalArgs.slice(3).join(" ") });
                    resp.text = [res.result];
                    if (res.success) {
                        resp.embed = response.card.getEmbed();
                    }
                }
                else {
                    resp.text = response.tans;
                }
                break;
            case "invest":
            case "inv":
                response = verifyInput(args, act, "inv <pack> <número>");
                if (response.success) {
                    let res = ogUser.intWithCard("inv", { card: response.card });
                    resp.text = [res.result];
                    if (res.success) {
                        resp.embed = response.card.getEmbed();
                    }
                }
                else {
                    resp.text = response.tans;
                }
                break;
            case "sell":
                response = verifyInput(args, act, "sell <pack> <número>");
                if (response.success) {
                    let res = ogUser.intWithCard("sell", { card: response.card });
                    resp.text = [res.result];
                    if (res.success) {
                        resp.embed = response.card.getEmbed();
                    }
                }
                else {
                    resp.text = response.tans;
                }
                break;
            case "offer":
                response = verifyInput(args, act, "offer <pack> <número> <plata>", true);
                if (response.success) {
                    let num = Number(args[3]);
                    if (!isNaN(num)) {
                        let res = ogUser.intWithCard("offer", { card: response.card, newOffer: num });
                        resp.text = [res.result];
                        if (res.success) {
                            resp.embed = response.card.getEmbed();
                        }
                    }
                    else {
                        resp.text = ["❌ Uso correcto: " + util_1.default.code("offer <pack> <número> <plata>")];
                    }
                }
                else {
                    resp.text = response.tans;
                }
                break;
            case "claim":
                response = verifyInput(args, act, "claim <pack> <número>");
                if (response.success) {
                    let res = ogUser.intWithCard("claim", { card: response.card });
                    resp.text = [res.result];
                    if (res.success) {
                        resp.embed = response.card.getEmbed();
                    }
                }
                else {
                    resp.text = response.tans;
                }
                break;
            case "auc":
            case "auction":
                let isList = false;
                if (act > 1) {
                    if (args[1] === "list") {
                        isList = true;
                        resp.text = data_1.default.storage.auctions.map(v => {
                            let c = data_1.default.cards[v.card.pack][v.card.id];
                            let timeDiff = (Date.now() - v.offeredAt) / 1000 / 60 / 60;
                            return (`${util_1.default.bold(c.getLong())} de ${data_1.default.users[c.owner].defaultName}: `
                                + (c.owner === v.offeredBy ? `Sin ofertas (valor inicial: $${v.offerValue})` : `${data_1.default.users[v.offeredBy].defaultName} ofertó $${v.offerValue}`)
                                + " - Se puede reclamar" + (timeDiff >= data_1.default.config.economy.hoursToClaim ? "!" : ` en ${Math.round(data_1.default.config.economy.hoursToClaim - timeDiff)} horas`));
                        });
                        resp.text.unshift("");
                        resp.text.unshift(util_1.default.title("Subastas actuales:"));
                    }
                    else if (args[1] === "log") {
                        isList = true;
                        isList = true;
                        resp.text = data_1.default.storage.auctionsLog.map(v => {
                            let c = data_1.default.cards[v.card.pack][v.card.id];
                            let timeDiff = (Date.now() - v.offeredAt) / 1000 / 60 / 60;
                            return `${util_1.default.bold(c.getLong())} de ${data_1.default.users[v.exOwner].defaultName}: ${data_1.default.users[v.offeredBy].defaultName} la compró por $${v.offerValue}`;
                        });
                        resp.text.unshift("");
                        resp.text.unshift(util_1.default.title("Subastas terminadas:"));
                    }
                }
                if (!isList) {
                    response = verifyInput(args, act, "auc <pack> <número> <plata>");
                    if (response.success) {
                        let num = Number(args[3]);
                        if (!isNaN(num)) {
                            let res = ogUser.intWithCard("auc", { card: response.card, auctionStartingPrice: num });
                            resp.text = [res.result];
                            if (res.success) {
                                resp.embed = response.card.getEmbed();
                            }
                        }
                        else {
                            resp.text = ["❌ Uso correcto: " + util_1.default.code("auc <pack> <número> <plata>")];
                        }
                    }
                    else {
                        resp.text = response.tans;
                    }
                }
                break;
            case "desc":
            case "description":
                if (act > 1) {
                    ogUser.description = normalArgs.slice(1).join(" ");
                    resp.text = ["✅ Tu descripción fue actualizada"];
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("desc <descripción>")];
                }
                break;
            case "name":
            case "nick":
                if (act > 1) {
                    ogUser.defaultName = normalArgs.slice(1).join(" ");
                    resp.text = ["✅ Tu nombre principal fue actualizado"];
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("name <nombre>")];
                }
                break;
            case "debug":
            case "dg":
                util_1.default.debug(normalArgs.slice(1), data_1.default, card_1.default, user_1.default);
                break;
            case "save":
                let msg = yield ch.send("Guardando datos...");
                yield database_1.default.file("w");
                msg.edit("Guardando datos... ✅");
                break;
            case "user":
            case "u":
                resp = user_1.default.doIfTarget(targetUser, targetFound, targetUser.getUserEmbed, args[1]);
                break;
            case "wait":
            case "w":
                resp = user_1.default.doIfTarget(targetUser, targetFound, targetUser.waitingTimes, args[1], (a) => {
                    let { rolls, reacts, buys, invs } = a;
                    function f(time, data, article) {
                        return `${Math.round(time)} minutos para ${article} siguiente ${data}`;
                    }
                    return [util_1.default.title("Tiempos restantes para " + targetName + ":"),
                        f(rolls, "roll", "el"),
                        f(reacts, "reacción", "la"),
                        f(buys, "compra", "la"),
                        f(invs, "inversión", "la"),
                    ];
                });
                break;
            case "bal":
                resp = user_1.default.doIfTarget(targetUser, targetFound, targetUser.updateEconomy, args[1], (a) => {
                    return [`${targetName} tiene $${util_1.default.truncateTo(a.bal, 2)}`];
                });
                break;
            case "reacts":
            case "buys":
            case "invs":
            case "rolls":
                let economyPlusWaitings = () => {
                    let eco = targetUser.updateEconomy();
                    let waitings = targetUser.waitingTimes();
                    let isMaxed = {};
                    for (const key in eco) {
                        if (key === "bal") {
                            continue;
                        }
                        if (eco[key] >= data_1.default.config.economy.max[key]) {
                            isMaxed[key] = true;
                        }
                        else {
                            isMaxed[key] = false;
                        }
                    }
                    return [`${targetName} tiene ${Math.floor(eco[main])} ${util_1.default.nice(main)}`
                            + (isMaxed[main] ? " (cantidad máxima)" : `, siguiente en ${Math.round(waitings[main])} minutos`)];
                };
                resp = user_1.default.doIfTarget(targetUser, targetFound, economyPlusWaitings, args[1]);
                break;
            case "pay":
                let pay = () => {
                    if (act > 2) {
                        let money = Number(args[2]);
                        if (!isNaN(money)) {
                            if (Number(money) > 0) {
                                if (ogUser.giveMoneyTo(money, targetUser)) {
                                    return [`${ogName} le dio $${money} a ${targetName}!`];
                                }
                                else {
                                    return [`❌ No tenés suficiente plata`];
                                }
                            }
                            else {
                                return [`❌ Escribí un número positivo`];
                            }
                        }
                        else {
                            return [`❌ Uso correcto: ${util_1.default.code("pay <usuario> <plata>")}`];
                        }
                    }
                    else {
                        return [`❌ Uso correcto: ${util_1.default.code("pay <usuario> <plata>")}`];
                    }
                };
                resp = user_1.default.doIfTarget(targetUser, targetFound, pay, args[1]);
                break;
            case "give":
                let showEmbed = false;
                resp.text = user_1.default.doIfTarget(targetUser, targetFound, () => {
                    if (act > 2) {
                        if (act > 3) {
                            let response = card_1.default.validate(args[2], args[3]);
                            if (response.success) {
                                showEmbed = true;
                                return [ogUser.intWithCard("give", { card: response.card }, targetUser).result];
                            }
                            else {
                                return [response.message];
                            }
                        }
                        else {
                            return ["❌ Uso correcto: " + util_1.default.code("<give> <usuario> <pack> <número>")];
                        }
                    }
                    else {
                        return ["❌ Uso correcto: " + util_1.default.code("<give> <usuario> <pack> <número>")];
                    }
                }, args[1]).text;
                if (showEmbed) {
                    resp.embed = data_1.default.cards[args[2]][Number(args[3]) - 1].getEmbed();
                }
                break;
            case "link":
                resp.text = ["❌ NO DISPONIBLE POR AHORA" + " https://momo.zokalyx.repl.co - actualmente muestra el pack " + util_1.default.code(data_1.default.cache.packInWebsite) + ", elegí otro con pack <pack>"];
                break;
            case "col":
            case "collection":
                let callback;
                let colInfo = (user) => {
                    let col = user.collectionInfo();
                    let ans = [util_1.default.title(`Colección de ${user.defaultName}:`), ""];
                    for (const pack of col.collection) {
                        if (pack.cardsOwned === 0) {
                            continue;
                        }
                        ans.push(`${util_1.default.bold(util_1.default.upperFirst(pack.pack))}: ${pack.cardsOwned}/${card_1.default.cardsIn(pack.pack)} - Total: $${pack.totalValue} - Promedio: $${Math.round(pack.averageValue)} - Ingresos: $${Math.floor(pack.passiveIncome)}/día`
                            + (pack.isComplete ? " Completa!" : ""));
                    }
                    ans.push("");
                    ans.push(`${util_1.default.title("Totales:")} ${col.total.cardsOwned}/${card_1.default.totalAmount()} - Total: $${col.total.totalValue} - Promedio: $${Math.round(col.total.averageValue)} - Ingresos: $${Math.floor(col.total.passiveIncome)}/día`);
                    return ans;
                };
                let packInfo = (user, pack) => {
                    let col = user.packInfo(pack);
                    let ans = [util_1.default.title(`Colección de ${user.defaultName} (pack ${util_1.default.upperFirst(pack)}):`), ""];
                    for (const card of col.pack) {
                        ans.push(`${util_1.default.bold(card.getLong()) + ":"} ${card.type} - Valor: $${card.value} - x${card.multiplier}`
                            + (card.inAuction ? " En subasta" : ""));
                    }
                    ans.push("");
                    ans.push(`${util_1.default.title("Totales:")} Total: $${col.total.totalValue} - Promedio: $${Math.round(col.total.averageValue)} - Ingresos: $${Math.round(col.total.passiveIncome)}`);
                    return ans;
                };
                if (act > 2) {
                    targetName = args[1];
                    callback = () => {
                        if (args[2] in data_1.default.cards) {
                            return packInfo(targetUser, args[2]);
                        }
                        else {
                            return [`❌ No existe el pack ${util_1.default.code(args[2])}`];
                        }
                    };
                }
                else if (act > 1) {
                    targetName = args[1];
                    if (args[1] in data_1.default.cards) {
                        targetUser = ogUser;
                        targetName = ogName;
                        targetId = ogId;
                        targetFound = true;
                        callback = () => {
                            return packInfo(targetUser, args[1]);
                        };
                    }
                    else {
                        callback = () => {
                            return colInfo(targetUser);
                        };
                    }
                }
                else {
                    callback = () => {
                        return colInfo(targetUser);
                    };
                }
                resp = user_1.default.doIfTarget(targetUser, targetFound, callback, targetName);
                break;
            case "p":
            case "pack":
                if (act > 1) {
                    if (args[1] === "list") {
                        let totalValue = 0;
                        let ownedCards = 0;
                        let gifs = 0;
                        let imgs = 0;
                        resp.text = [util_1.default.title("Lista de packs:"), ""];
                        for (const pack in data_1.default.cards) {
                            let pinf = card_1.default.packInfo(pack);
                            resp.text.push(`**${util_1.default.upperFirst(pack)}:** ${pinf.gifs} gifs y ${pinf.imgs} imgs - Total: $${pinf.totalValue} - Promedio: $${Math.round(pinf.averageValue)} - ${pinf.cardsOwned}/${card_1.default.cardsIn(pack)} con dueño`);
                            totalValue += pinf.totalValue;
                            ownedCards += pinf.cardsOwned;
                            gifs += pinf.gifs;
                            imgs += pinf.imgs;
                        }
                        resp.text.push("");
                        let tot = card_1.default.totalAmount();
                        resp.text.push(`${util_1.default.title("Totales:")} ${gifs} gifs y ${imgs} imgs - Total: $${totalValue} - Promedio: $${Math.round(totalValue / tot)} - ${ownedCards}/${tot} (${Math.round(ownedCards / tot * 100)}%) con dueño`);
                    }
                    else if (args[1] in data_1.default.cards) {
                        data_1.default.cache.packInWebsite = args[1];
                        resp.text = data_1.default.cards[args[1]].filter(c => c.isCard).map(c => util_1.default.bold(c.getLong() + ":") + ` ${c.type} - Valor: $${c.value} - x${c.multiplier}`
                            + (c.owner === "" ? " - Sin dueño" : " - Dueño: " + data_1.default.users[c.owner].defaultName));
                        resp.text.unshift("");
                        resp.text.unshift(util_1.default.title("Pack " + util_1.default.upperFirst(args[1]) + ":"));
                        let pinf = card_1.default.packInfo(args[1]);
                        resp.text.push("");
                        resp.text.push(`${util_1.default.title("Totales:")} Total: $${pinf.totalValue} - Promedio: $${Math.round(pinf.averageValue)} - ${pinf.cardsOwned}/${card_1.default.cardsIn(args[1])} con dueño`);
                    }
                    else {
                        resp.text = ["❌ No existe el pack " + util_1.default.code(args[1])];
                    }
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("pack <pack>")];
                }
                break;
            case "top":
                if (act > 1) {
                    switch (args[1]) {
                        case "u":
                        case "user":
                        case "users":
                            resp.text = user_1.default.getTop().map((u, i) => `${util_1.default.bold("#" + (i + 1) + " - " + u.defaultName + ":")} ${u.collectionSize()} cartas - $${Math.floor(u.updateEconomy().bal)}`);
                            resp.text.unshift(util_1.default.title("Top usuarios:"));
                            break;
                        case "c":
                        case "card":
                        case "cards":
                            resp.text = card_1.default.getTop().slice(0, 15).map((c, i) => `${util_1.default.bold("#" + (i + 1) + " - " + c.getLong() + ":")} Valor: $${c.value} - x${c.multiplier}`
                                + (c.owner === "" ? " - Sin dueño" : " - Dueño: " + data_1.default.users[c.owner].defaultName)
                                + (c.inAuction ? " - En subasta" : ""));
                            resp.text.unshift(util_1.default.title("Top cartas:"));
                            break;
                        case "p":
                        case "pack":
                        case "packs":
                            resp.text = card_1.default.getTopPacks().slice(0, 10).map((c, i) => {
                                let pinfo = card_1.default.packInfo(c);
                                return `${util_1.default.bold("#" + (i + 1) + " - " + util_1.default.upperFirst(c) + ":")} Valor promedio: $${Math.round(pinfo.averageValue)}`
                                    + ` - Valor total: $${pinfo.totalValue} - ${pinfo.cardsOwned}/${card_1.default.cardsIn(c)} con dueño`;
                            });
                            resp.text.unshift(util_1.default.title("Top packs:"));
                            break;
                        case "col":
                            resp.text = card_1.default.getTop().filter(c => c.owner === ogId).slice(0, 15).map((c, i) => `${util_1.default.bold("#" + (i + 1) + " - " + c.getLong() + ":")} Valor: $${c.value} - x${c.multiplier}`
                                + (c.inAuction ? " - En subasta" : ""));
                            resp.text.unshift(util_1.default.title("Top cartas tuyas:"));
                            break;
                        default:
                            resp.text = [`❌ Uso correcto: ${util_1.default.code("top <categoría>")} (${util_1.default.code("users")}, ${util_1.default.code("cards")} o ${util_1.default.code("packs")})`];
                    }
                }
                else {
                    resp.text = [`❌ Uso correcto: ${util_1.default.code("top <categoría>")} (${util_1.default.code("users")}, ${util_1.default.code("cards")} o ${util_1.default.code("packs")})`];
                }
                break;
            case "exit":
                let suc = true;
                if (act > 1) {
                    if (args[1] === "nosave") {
                        ch.send("Apagando bot sin guardar...");
                    }
                    else {
                        suc = false;
                        resp.text = [util_1.default.code("exit nosave") + " apaga el bot sin guardar"];
                    }
                }
                else {
                    ch.send("Guardando y apagando bot...");
                }
                if (suc) {
                    yield database_1.default.file("w");
                    client.destroy();
                    process.exit();
                }
                break;
            case "id":
                if (act > 1) {
                    switch (args[1]) {
                        case "list":
                            resp.text = [util_1.default.title("Lista de IDs y nombres:"), ""];
                            for (const c in data_1.default.users) {
                                let u = data_1.default.users[c];
                                resp.text.push(`${util_1.default.bold(u.defaultName + ":")} ID: ${util_1.default.code(u.id)} - Nombres: \`` + u.nicks.join("`, `") + "`");
                            }
                            break;
                        case "-":
                            if (act > 2) {
                                if (ogUser.nicks.includes(args[2])) {
                                    ogUser.nicks.splice(ogUser.nicks.indexOf(args[2]), 1);
                                    resp.text = ["✅ Nombre " + util_1.default.code(args[2]) + " removido"];
                                }
                                else {
                                    resp.text = [util_1.default.code(args[2]) + " no es un nombre tuyo"];
                                }
                            }
                            else {
                                resp.text = ["❌ Uso correcto: " + util_1.default.code("id - <nombre>")];
                            }
                            break;
                        default:
                            if (!ogUser.nicks.includes(args[1])) {
                                ogUser.nicks.push(args[1]);
                                resp.text = ["✅ Nombre " + util_1.default.code(args[1]) + " agregado"];
                            }
                            else {
                                resp.text = ["❌ El nombre " + util_1.default.code(args[1]) + " ya es tuyo"];
                            }
                    }
                }
                else {
                    resp.text = [`Tu ID es ${util_1.default.code(ogId)} y los nombres asociados a la misma son: \`` + ogUser.nicks.join("`, `") + "`"];
                }
                break;
            case "config":
            case "cfg":
                resp.text = [JSON.stringify(data_1.default.config).split("").map(v => v === "," ? "\n" : v).filter(v => v !== "{" && v !== "}" && v !== '"').join("")];
                break;
            case "ok":
                resp.text = ["👌"];
                break;
            case "-":
            case "remove":
                if (act > 1) {
                    if (args[1] in data_1.default.cards) {
                        delete data_1.default.cards[args[1]];
                        for (const u in data_1.default.users) {
                            delete data_1.default.users[u].collection[args[1]];
                        }
                        resp.text = [`✅ Comando ${util_1.default.code(args[1])} removido`];
                    }
                    else {
                        resp.text = ["❌ No existe el comando " + util_1.default.code(args[1])];
                    }
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("- <comando>")];
                }
                break;
            case "+":
            case "add":
                if (act > 1) {
                    if (!(args[1] in data_1.default.cards)) {
                        data_1.default.cards[args[1]] = [];
                        for (const u in data_1.default.users) {
                            data_1.default.users[u].collection[args[1]] = [];
                        }
                        resp.text = [`✅ Comando ${util_1.default.code(args[1])} agregado`];
                    }
                    else {
                        resp.text = ["❌ Ya existe el comando " + util_1.default.code(args[1])];
                    }
                }
                else {
                    resp.text = ["❌ Uso correcto: " + util_1.default.code("+ <comando>")];
                }
                break;
            case "roll":
            case "r":
                if (ogUser.updateEconomy().rolls >= 1) {
                    ogUser.modifyData("rolls", -1);
                    let crd = card_1.default.rollCard(ogId);
                    let embed = crd.getEmbed();
                    let msg = yield ch.send(embed);
                    data_1.default.cache.rollCache[data_1.default.cache.rollCacheIndex] = { message: msg, card: crd, reactedBy: [], timeRolled: Date.now() };
                    if (crd.owner === "") {
                        msg.react("💰");
                    }
                    msg.react("🔥");
                    return;
                }
                else {
                    let wait = ogUser.waitingTimes().rolls;
                    resp.text = ["❌ No tenés rolls disponibles" + `, siguiente en ${Math.round(wait)} minutos`];
                }
                break;
            default:
                if (main in data_1.default.cards) {
                    resp.text = yield customCommand(main, act, args, normalArgs, ogId);
                    if (resp.text) {
                        if (resp.text[0].startsWith("Esta carta le pertenece a")) {
                            askedForConfirm = true;
                        }
                    }
                }
                else {
                    resp.text = [`❌ No existe el comando ${util_1.default.code(main)}`];
                }
        }
        if (resp === null || resp === void 0 ? void 0 : resp.text) {
            util_1.default.chunkAndSend(resp.text, 20, ch);
        }
        if (resp === null || resp === void 0 ? void 0 : resp.embed) {
            ch.send(resp.embed);
        }
        if (!askedForConfirm) {
            data_1.default.cache.waitingForConfirm = false;
        }
        else {
            data_1.default.cache.waitingForConfirm = true;
        }
    });
}
function ReactionHandler(r, u) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = u.id;
        let username = u.username;
        let guild = r.message.guild;
        let channel = r.message.channel;
        let emoji = r.emoji.name;
        let msg = r.message;
        if (u.bot) {
            return;
        } // avoid self and other bots
        if (guild === null) {
            return;
        } // avoid DMs
        if (!(channel instanceof discord_js_1.TextChannel)) {
            return;
        } // avoid weird channels
        user_1.default.createNew(id, guild, username);
        let user = data_1.default.users[id];
        let response = "";
        if (data_1.default.cache.rollCache.map(m => m.message).includes(msg)) {
            let rollCacheObject = data_1.default.cache.rollCache[data_1.default.cache.rollCache.map(m => m.message).indexOf(msg)];
            if (Date.now() - rollCacheObject.timeRolled < data_1.default.config.maxTimeToInteract * 1000 * 60 * 60) {
                if (emoji === "🔥") {
                    let resp = user.intWithCard("react", { card: rollCacheObject.card, msg: { reactedBy: rollCacheObject.reactedBy.map(v => v.id) } });
                    response = resp.result;
                    if (resp.success) {
                        rollCacheObject.reactedBy.push(data_1.default.users[id]);
                    }
                }
                else if (emoji === "💰") {
                    let resp = user.intWithCard("buy", { card: rollCacheObject.card });
                    response = resp.result;
                    if (resp.success) {
                        rollCacheObject.message.edit(resp.updatedCard.getEmbed());
                    }
                }
            }
        }
        if (response !== "") {
            channel.send(response);
        }
    });
}
function verifyInput(args, act, correctUse, requireExtra = false) {
    let tans = [];
    let success = false;
    let card;
    if (act > 1) {
        if (act > 2) {
            let response = card_1.default.validate(args[1], args[2]);
            let c = response.card;
            if (response.success) {
                if (c) {
                    if (act > 3 || !requireExtra) {
                        card = c;
                        success = true;
                    }
                    else {
                        tans = ["❌ Uso correcto: " + util_1.default.code(correctUse)];
                    }
                }
            }
            else {
                tans = [response.message];
            }
        }
        else {
            tans = ["❌ Uso correcto: " + util_1.default.code(correctUse)];
        }
    }
    else {
        tans = ["❌ Uso correcto: " + util_1.default.code(correctUse)];
    }
    return { tans: tans, success: success, card: card };
}
function customCommand(main, act, args, normalArgs, ogId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let arr = data_1.default.cards[main];
        let tans = [];
        if (act > 1) {
            switch (args[1]) {
                case "list":
                    tans = [util_1.default.title("Opciones del comando " + util_1.default.code(main)), ""];
                    for (const c of arr) {
                        tans.push(`Opción ${c.id + 1}: ${c.type}`);
                    }
                    break;
                case "+":
                case "add":
                    if (act > 2) {
                        let cont = normalArgs.slice(2).join(" ");
                        if (cont.includes("tenor") && !cont.endsWith(".gif")) {
                            let gifRequest = yield request_1.default.getTenorGif(cont);
                            if (gifRequest.success) {
                                cont = gifRequest.link;
                            }
                            else {
                                tans = ["❌Hubo un error"];
                                break;
                            }
                        }
                        let nw = new card_1.default({ pack: main, content: cont });
                        data_1.default.cards[main].push(nw);
                        let niceType = "Texto";
                        if (nw.type === "gif") {
                            niceType = "Gif";
                        }
                        else if (nw.type === "img") {
                            niceType = "Imagen";
                        }
                        tans = ["✅ " + niceType + " agregado/a al comando " + util_1.default.code(main) + " (#" + (card_1.default.cardsIn(main)) + ")"];
                    }
                    else {
                        tans = ["Esperando contenido para el pack " + util_1.default.code(main)];
                        data_1.default.cache.waitingForBulk.status = true;
                        data_1.default.cache.waitingForBulk.pack = main;
                    }
                    break;
                case "-":
                case "remove":
                    let toRemoveId = data_1.default.cards[main].length - 1;
                    let success = true;
                    if (act > 2) {
                        let num = Number(args[2]);
                        if (!isNaN(num)) {
                            if (num > 0 && num <= data_1.default.cards[main].length) {
                                toRemoveId = num - 1;
                            }
                            else {
                                tans = ["❌ El comando " + util_1.default.code(main) + " no contiene la opción número " + num];
                                success = false;
                            }
                        }
                        else {
                            tans = ["❌ Uso correcto: " + util_1.default.code("<comando> - (<número>)")];
                            success = false;
                        }
                        toRemoveId = Number(args[2]) - 1;
                    }
                    if (success) {
                        tans = [];
                        let c = data_1.default.cards[main][toRemoveId];
                        let cancel = false;
                        if (c.owner === ogId) {
                            tans = ["Fuiste compensado $" + c.value];
                            data_1.default.users[ogId].modifyData("bal", c.value);
                            data_1.default.users[ogId].removeCard(c);
                        }
                        else if (c.owner !== "") {
                            tans = ["Esta carta le pertenece a " + data_1.default.users[c.owner].defaultName + ", escribí" + util_1.default.code("confirm") + " y se le compensará su valor"];
                            cancel = true;
                        }
                        else if (c.inAuction) {
                            tans = ["❌ Esta carta está en subasta"];
                            cancel = true;
                        }
                        if (!cancel) {
                            data_1.default.cards[main].splice(toRemoveId, 1);
                            card_1.default.updatePackIndexes(main);
                            card_1.default.updateAuctionsDueTo("delete", main, toRemoveId);
                            user_1.default.updateDueToDeletion(main, toRemoveId);
                            tans.unshift("✅ Opción " + (toRemoveId + 1) + " del comando " + util_1.default.code(main) + " removida");
                        }
                    }
                    break;
                default:
                    let response = card_1.default.validate(main, args[1]);
                    if (response.success) {
                        tans = [(_a = response.card) === null || _a === void 0 ? void 0 : _a.content];
                    }
                    else {
                        tans = [response.message];
                    }
            }
        }
        else {
            tans = [util_1.default.selectRandom(arr).content];
        }
        return tans;
    });
}
