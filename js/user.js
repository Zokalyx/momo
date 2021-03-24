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
const data_1 = __importDefault(require("./data"));
const util_1 = __importDefault(require("./util"));
class User {
    constructor({ id, guild, defaultName = "", nicks = [], initials = { bal: -1, reacts: -1, buys: -1, invs: -1, rolls: -1 }, description = "" }) {
        this.id = id;
        this.nicks = nicks;
        this.description = description;
        this.defaultName = defaultName;
        this.defaultName = "";
        this.avatarURL = "";
        this.color = "";
        this.updateGuildInfo(guild);
        let toEconomy = {};
        for (const key in initials) {
            if (initials[key] === -1) {
                if (key === "bal") {
                    initials[key] = data_1.default.config.economy.startingMoney;
                }
                else {
                    initials[key] = data_1.default.config.economy.max[key];
                }
            }
            toEconomy[key] = { amount: initials[key], lastChecked: Date.now() };
        }
        this.economy = toEconomy;
        this.collection = {};
        for (const pack in data_1.default.cards) {
            this.collection[pack] = [];
        }
    }
    getUserEmbed() {
        let eco = this.updateEconomy();
        let { bal, reacts, buys, invs, rolls } = eco;
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
        let max = {};
        for (const key in isMaxed) {
            if (isMaxed[key]) {
                max[key] = " - Máx";
            }
            else {
                max[key] = "";
            }
        }
        let { totalValue, averageValue, passiveIncome, cardsOwned } = this.collectionInfo().total;
        let realPassive = passiveIncome + this.subsidio();
        return new discord_js_1.MessageEmbed()
            .setTitle(`__${this.defaultName}__`)
            .setDescription(this.description)
            .setColor(this.color)
            .setThumbnail(this.avatarURL)
            .addFields({ name: "Cartas   ", value: cardsOwned + "/" + card_1.default.totalAmount() + ` - ${Math.round(100 * cardsOwned / card_1.default.totalAmount())}%`, inline: true }, { name: "Total    ", value: "$" + totalValue, inline: true }, { name: "Promedio  ", value: "$" + Math.round(averageValue), inline: true }, { name: "Balance", value: "$" + Math.floor(bal), inline: true }, { name: "Ingresos", value: `$ ${Math.floor(realPassive)}/día`, inline: true }, { name: "Inversiones", value: Math.floor(invs) + max.invs, inline: true }, { name: "Rolls", value: Math.floor(rolls) + max.rolls, inline: true }, { name: "Reacciones", value: Math.floor(reacts) + max.reacts, inline: true }, { name: "Compras", value: Math.floor(buys) + max.buys, inline: true })
            .setFooter(`nombres: ${this.nicks.join(", ")}  -  id: ${this.id}`);
    }
    updateGuildInfo(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            let memberObj = yield guild.members.fetch(this.id);
            if (this.defaultName === "") {
                if (memberObj.nickname === null) {
                    this.defaultName = memberObj.user.username;
                }
                else {
                    this.defaultName = memberObj.nickname;
                }
            }
            this.color = memberObj.displayHexColor;
            let avatarURL = memberObj.user.avatarURL();
            if (avatarURL === null) {
                this.avatarURL = "";
            }
            else {
                this.avatarURL = avatarURL;
            }
        });
    }
    updateEconomy() {
        const now = Date.now();
        let eco = this.economy;
        for (const key in eco) {
            let commonEco = eco[key];
            if (key === "bal") {
                let { passiveIncome } = this.collectionInfo().total;
                commonEco.amount += (now - commonEco.lastChecked) / 86400000 * (passiveIncome + this.subsidio()); // p. income is measured in days
            }
            else {
                commonEco.amount += (now - commonEco.lastChecked) / 3600000 * data_1.default.config.economy.rates[key]; // measured in hours
                if (commonEco.amount >= data_1.default.config.economy.max[key]) {
                    commonEco.amount = data_1.default.config.economy.max[key];
                }
            }
            commonEco.lastChecked = now;
        }
        let ans = {};
        for (const key in eco) {
            ans[key] = eco[key].amount;
        }
        return ans;
    }
    changeBio(string) {
        this.description = string;
    }
    changeDefaultName(string) {
        this.defaultName = string;
    }
    addNick(string) {
        if (this.nicks.includes(string)) {
            return `El nombre ${util_1.default.code(string)} ya está asociado a tu ID`;
        }
        else {
            this.nicks.push(string);
            return `El nombre ${util_1.default.code(string)} se asoció a tu ID`;
        }
    }
    removeNick(string) {
        let indexOf = this.nicks.indexOf(string);
        if (indexOf === -1) {
            return `El nombre ${util_1.default.code(string)} no está asociado a tu ID`;
        }
        else {
            return `El nombre ${util_1.default.code(string)} se desasoció de tu ID`;
        }
    }
    waitingTimes() {
        let updatedEco = this.updateEconomy();
        let ans = {};
        for (const key in updatedEco) {
            let remainingDecimal = 1 - (updatedEco[key] - Math.floor(updatedEco[key]));
            ans[key] = remainingDecimal / data_1.default.config.economy.rates[key] * 60; // expressed in minutes
        }
        return ans;
    }
    modifyData(key, amount) {
        this.economy[key].amount += amount;
    }
    collectionSize() {
        let ans = 0;
        for (const pack in this.collection) {
            ans += this.collection[pack].length;
        }
        return ans;
    }
    packInfo(pack) {
        let packArray = [];
        let totalValue = 0;
        let averageValue;
        let passiveIncome = 0;
        let isComplete;
        for (const optionIndex of this.collection[pack]) {
            let card = data_1.default.cards[pack][optionIndex];
            packArray.push(card);
            totalValue += card.value;
            passiveIncome += card.value * data_1.default.config.economy.passiveIncomeMultiplier;
        }
        let cardsInPackCol = this.collection[pack].length;
        averageValue = cardsInPackCol === 0 ? 0 : totalValue / cardsInPackCol;
        if (cardsInPackCol === card_1.default.cardsIn(pack)) {
            isComplete = true;
            passiveIncome *= card_1.default.cardsIn(pack) * data_1.default.config.economy.completePackPassiveIncomeMultiplier;
        }
        else {
            isComplete = false;
        }
        return { pack: packArray, total: { totalValue: totalValue,
                averageValue: averageValue,
                passiveIncome: passiveIncome,
                isComplete: isComplete,
                cardsOwned: packArray.length
            } };
    }
    collectionInfo() {
        let collection = [];
        for (const pack in this.collection) {
            collection.push(Object.assign({ pack: pack }, this.packInfo(pack).total));
        }
        // Total of all packs
        let averageValue;
        let { totalValue, passiveIncome } = collection.reduce((acc, cur) => ({ totalValue: acc.totalValue + cur.totalValue,
            passiveIncome: acc.passiveIncome + cur.passiveIncome }), { totalValue: 0, passiveIncome: 0 });
        averageValue = totalValue / this.collectionSize();
        return { collection, total: { totalValue, averageValue, passiveIncome, cardsOwned: this.collectionSize() } };
    }
    removeCard(card) {
        let packCol = this.collection[card.pack];
        packCol.splice(packCol.indexOf(card.id), 1);
    }
    addCard(card) {
        let packCol = this.collection[card.pack];
        packCol.push(card.id);
        packCol.sort((a, b) => a - b);
    }
    giveMoneyTo(amount, user) {
        if (this.updateEconomy().bal >= amount) {
            this.modifyData("bal", -amount);
            user.modifyData("bal", amount);
            return true;
        }
        else {
            return false;
        }
    }
    subsidio() {
        let ans = 16000 / this.collectionSize() + 100;
        if (ans > 1500 || isNaN(ans) || ans < 0) {
            ans = 1500;
        }
        return ans;
    }
    intWithCard(action, cardObj, other) {
        /* Interactions with cards: Auction, Buy, Inv, React, Sell, Give */
        let card = cardObj.card;
        let cardName = card.getLong();
        let userName = this.defaultName;
        let isOwner = card.owner === this.id;
        let indexOfAuction = -1;
        let auctionObject;
        if (card.inAuction) {
            indexOfAuction = data_1.default.storage.auctions.map(v => v.card.id).indexOf(card.id);
            auctionObject = data_1.default.storage.auctions[indexOfAuction];
        }
        let { bal, buys, reacts, invs } = this.updateEconomy();
        bal = Math.floor(bal);
        let wait = this.waitingTimes();
        let result;
        let success = false;
        switch (action) {
            case "give":
                if (isOwner) {
                    if (!card.inAuction) {
                        if (other) {
                            card.owner = other.id;
                            this.removeCard(card);
                            other.addCard(card);
                            this.updateEconomy();
                            other.updateEconomy();
                            result = `${userName} le dio ${cardName} a ${other.defaultName}!`;
                            success = true;
                        }
                    }
                    else {
                        result = `${cardName} está siendo subastada`;
                    }
                }
                else {
                    result = `${cardName} no te pertenece`;
                }
                break;
            case "auc":
                if (isOwner) {
                    if (!card.inAuction) {
                        if (cardObj.auctionStartingPrice) {
                            data_1.default.storage.auctions.push({ card: { pack: card.pack, id: card.id }, offerValue: cardObj.auctionStartingPrice, offeredBy: this.id, offeredAt: Date.now() });
                            card.inAuction = true;
                            result = `${userName} puso ${cardName} en subasta empezando por $${cardObj.auctionStartingPrice}!`;
                            success = true;
                        }
                    }
                    else {
                        result = `${cardName} ya está siendo subastada`;
                    }
                }
                else {
                    result = `${cardName} no te pertenece`;
                }
                break;
            case "offer":
                if (card.inAuction) {
                    if (!isOwner) {
                        if (cardObj.newOffer) {
                            if (bal >= cardObj.newOffer) {
                                if (cardObj.newOffer >= data_1.default.config.economy.minimumOfferIncrease) {
                                    if (auctionObject) {
                                        auctionObject.offerValue = cardObj.newOffer;
                                        auctionObject.offeredBy = this.id;
                                        auctionObject.offeredAt = Date.now();
                                        result = `${userName} ofreció $${auctionObject.offerValue} por ${cardName}!`;
                                        success = true;
                                    }
                                }
                                else {
                                    result = `Tenés que aumentar la oferta por lo menos $${data_1.default.config.economy.minimumOfferIncrease}`;
                                }
                            }
                            else {
                                result = `No podés ofertar más plata de la que tenés`;
                            }
                        }
                    }
                    else {
                        result = `No podés ofrecer plata por tu propia carta`;
                    }
                }
                else {
                    result = `${cardName} no está siendo subastada`;
                }
                break;
            case "claim":
                if (card.inAuction) {
                    if (auctionObject) {
                        if (auctionObject.offeredBy === this.id) {
                            let timeDiff = (Date.now() - auctionObject.offeredAt) / 1000 / 60 / 60; // in hours
                            if (timeDiff >= data_1.default.config.economy.hoursToClaim) {
                                if (bal >= auctionObject.offerValue) {
                                    let exowner = data_1.default.users[card.owner];
                                    this.giveMoneyTo(auctionObject.offerValue, exowner);
                                    this.updateEconomy();
                                    exowner.updateEconomy();
                                    card.owner = auctionObject.offeredBy;
                                    card.inAuction = false;
                                    data_1.default.storage.auctionsLog.unshift(Object.assign(auctionObject, { exOwner: exowner.id }));
                                    data_1.default.storage.auctions.splice(indexOfAuction, 1);
                                    result = `${userName} reclamó ${cardName} de ${exowner.defaultName} por $${auctionObject.offerValue}!`;
                                    success = true;
                                }
                                else {
                                    result = `Te faltan $${Math.round(auctionObject.offerValue - bal)} para poder reclamar ${cardName}`;
                                }
                            }
                            else {
                                result = `Faltan ${Math.round(data_1.default.config.economy.hoursToClaim - timeDiff)} horas para poder reclamar ${cardName}`;
                            }
                        }
                        else {
                            result = `Tenés que ser la oferta más grande para poder reclamar ${cardName}`;
                        }
                    }
                }
                else {
                    result = `${cardName} no está siendo subastada`;
                }
                break;
            case "buy":
                if (card.owner === "") {
                    if (buys >= 1) {
                        if (bal >= card.value) {
                            card.owner = this.id;
                            this.addCard(card);
                            this.modifyData("buys", -1);
                            this.modifyData("bal", -card.value);
                            this.updateEconomy();
                            result = `${userName} compró ${cardName} por $${card.value}!`;
                            success = true;
                        }
                        else {
                            result = `Te faltan $${card.value - bal} para poder comprar ${cardName}`;
                        }
                    }
                    else {
                        result = `No te quedan compras disponibles - Siguiente en ${Math.round(wait.buys)} minutos`;
                    }
                }
                else {
                    result = `${cardName} le pertenece a ${data_1.default.users[card.owner].defaultName}`;
                }
                break;
            case "inv":
                if (isOwner) {
                    if (invs >= 1) {
                        if (bal >= card.value) {
                            card.multiplier++;
                            this.modifyData("invs", -1);
                            this.modifyData("bal", -card.value);
                            this.updateEconomy();
                            result = `${userName} invirtió en ${cardName} por $${card.value} y aumentó su multiplicador a x${card.multiplier}!`;
                            success = true;
                            if (card.value * card.multiplier > data_1.default.storage.topCardValue) {
                                data_1.default.storage.topCardValue = card.value * card.multiplier;
                            }
                        }
                        else {
                            result = `Te faltan $${card.value - bal} para poder invertir en ${cardName}`;
                        }
                    }
                    else {
                        result = `No te quedan inversiones disponibles - Siguiente en ${Math.round(wait.invs)} minutos`;
                    }
                }
                else {
                    result = `${cardName} no te pertenece`;
                }
                break;
            case "react":
                if (!isOwner) {
                    if (reacts >= 1) {
                        if (cardObj.msg !== undefined) {
                            if (!cardObj.msg.reactedBy.includes(this.id)) {
                                let reactorReward;
                                let baseReward = Math.round(card.value * card.multiplier * data_1.default.config.economy.reactorBaseRewardMultiplier);
                                if (card.owner === "") {
                                    reactorReward = baseReward;
                                    result = `${userName} reaccionó a ${cardName} y ganó $${reactorReward}!`;
                                }
                                else {
                                    reactorReward = Math.round(baseReward * data_1.default.config.economy.reactorNonOwnerMultiplier);
                                    result = `${userName} reaccionó a ${cardName} y ganó $${reactorReward}`;
                                    result += `\n${data_1.default.users[card.owner].defaultName} ganó $${baseReward} por ser el dueño de la carta`;
                                    data_1.default.users[card.owner].modifyData("bal", baseReward);
                                }
                                this.modifyData("bal", reactorReward);
                                this.modifyData("reacts", -1);
                                success = true;
                            }
                            else {
                                result = `Ya reaccionaste a ${cardName}`;
                            }
                        }
                    }
                    else {
                        result = `No te quedan reacciones disponibles - Siguiente en ${Math.round(wait.reacts)} minutos`;
                    }
                }
                else {
                    result = `No podés reaccionar a ${cardName} porque ya es tuya`;
                }
                break;
            case "sell":
                if (isOwner) {
                    if (!card.inAuction) {
                        card.owner = "";
                        this.removeCard(card);
                        this.modifyData("bal", card.value * data_1.default.config.economy.sellMultiplier);
                        this.updateEconomy();
                        result = `${userName} vendió ${cardName} por $${card.value * data_1.default.config.economy.sellMultiplier}!`;
                        success = true;
                    }
                    else {
                        result = `${cardName} está siendo subastada`;
                    }
                }
                else {
                    result = `${cardName} no te pertenece`;
                }
                break;
            case "rename":
                if (isOwner) {
                    if (cardObj.newInfo !== undefined) {
                        card.name = cardObj.newInfo;
                        result = `${userName} renombró a ${cardName} "${cardObj.newInfo}"!`;
                        success = true;
                    }
                }
                else {
                    result = `${cardName} no te pertenece`;
                }
                break;
            case "desc":
                if (isOwner) {
                    if (cardObj.newInfo !== undefined) {
                        card.description = cardObj.newInfo;
                        result = `${userName} cambió la descripción de ${cardName} "${cardObj.newInfo}"!`;
                        success = true;
                    }
                }
                else {
                    result = `${cardName} no te pertenece`;
                }
                break;
        }
        return { success: success, result: result, updatedCard: card };
    }
    static getTop() {
        let totalArray = [];
        for (const user in data_1.default.users) {
            totalArray.push(data_1.default.users[user]);
        }
        return totalArray.sort((a, b) => b.collectionSize() - a.collectionSize());
    }
    static getUserFromNick(nick) {
        if (nick in data_1.default.users) {
            return { success: true, user: data_1.default.users[nick] };
        }
        for (const user in data_1.default.users) {
            if (data_1.default.users[user].defaultName === nick) {
                return { success: true, user: data_1.default.users[user] };
            }
            for (const n of data_1.default.users[user].nicks) {
                if (nick === n) {
                    return { success: true, user: data_1.default.users[user] };
                }
            }
        }
        return { success: false };
    }
    static doIfTarget(targetUser, targetFound, callback, nick, formatData) {
        if (targetFound) {
            let result = callback.bind(targetUser)();
            if (formatData) {
                result = formatData(result);
            }
            if (Array.isArray(result)) {
                return { text: result, embed: undefined };
            }
            else {
                return { text: undefined, embed: result };
            }
        }
        else {
            return { text: [`El nombre ${util_1.default.code(nick)} no está registrado`], embed: undefined };
        }
    }
    static createNew(id, guild, username) {
        if (!(id in data_1.default.users)) {
            data_1.default.users[id] = new User({ id: id, guild: guild, defaultName: username });
            console.log("Created new user with id " + id);
        }
    }
    static populate() {
        for (const id in data_1.default.users) {
            Object.setPrototypeOf(data_1.default.users[id], User.prototype);
        }
    }
    static updateDueToDeletion(pack, id) {
        for (const u in data_1.default.users) {
            let col = data_1.default.users[u].collection[pack];
            if (col.includes(id)) {
                col.splice(col.indexOf(id), 1); // delete
            }
            for (let i = col.length - 1; i >= 0; i++) {
                if (col[i] >= id) {
                    col[i]--;
                }
            }
        }
    }
}
exports.default = User;
