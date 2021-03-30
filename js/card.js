"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const data_1 = __importDefault(require("./data"));
const util_1 = __importDefault(require("./util"));
class Card {
    constructor({ pack, content, rarity = 0, owner = "", value = 0, multiplier = 1, name = "", description = "" }) {
        this.inArk = false;
        this.pack = pack;
        this.content = content;
        this.rarity = rarity;
        this.owner = owner;
        this.value = value;
        this.multiplier = multiplier;
        this.name = name;
        this.description = description;
        this.inAuction = false;
        this.type = "";
        let imageTypes = [".png", ".jpg", ".jpeg", ".gif"];
        for (const img of imageTypes) {
            if (content.includes(img)) {
                let sliceAt = content.search(img);
                content = content.slice(0, sliceAt + img.length);
                if (img === ".gif") {
                    this.type = "gif";
                }
                else {
                    this.type = "img";
                }
                break;
            }
            else {
                this.type = "txt";
            }
        }
        this.isCard = this.type === "txt" ? false : true;
        this.cardIndex = Card.cardsIn(pack);
        this.id = data_1.default.cards[pack].length;
        if (rarity === 0) { /* If rarity is not defined, will use type to set a value */
            if (this.type === "img") {
                this.rarity = data_1.default.config.card.baseRarity;
            }
            else if (this.type === "gif") {
                this.rarity = data_1.default.config.card.gifRarityMultiplier * data_1.default.config.card.baseRarity;
            }
        }
    }
    getName() {
        return `${util_1.default.upperFirst(this.pack)} #${this.cardIndex + 1}`;
    }
    getLong() {
        return `${util_1.default.upperFirst(this.pack)} #${this.cardIndex + 1}` + (this.name === "" ? "" : ` "${this.name}"`);
    }
    getEmbed() {
        let nickname = this.owner === "" ? "-" : data_1.default.users[this.owner].defaultName;
        let ans = new discord_js_1.MessageEmbed()
            .setTitle(this.getLong())
            .setDescription(this.description)
            .setImage(this.content)
            .setColor(util_1.default.valueToRgb(this.value * this.multiplier / data_1.default.storage.topCardValue))
            .setFooter(`${this.cardIndex + 1}/${Card.cardsIn(this.pack)} - id: ${this.pack} ${this.id + 1}`)
            .addFields({ name: "Dueño", value: nickname, inline: true }, { name: "Valor", value: "$" + this.value, inline: true }, { name: "Multiplicador", value: "x" + this.multiplier, inline: true });
        if (this.inAuction) {
            ans.addFields({ name: "En subasta!", value: "Revisá auc list", inline: false });
        }
        return ans;
    }
    updateIndexes() {
        let cardIndex = 0;
        let id = 0;
        for (const card of data_1.default.cards[this.pack]) {
            if (this === card) {
                break;
            }
            id++;
            if (card.isCard) {
                cardIndex++;
            }
        }
        this.cardIndex = cardIndex;
        this.id = id;
    }
    static updatePackIndexes(pack) {
        for (const p of data_1.default.cards[pack]) {
            p.updateIndexes();
        }
    }
    static packInfo(pack) {
        let totalValue = 0;
        let averageValue = 0;
        let cardsOwned = 0;
        let gifs = 0;
        let imgs = 0;
        for (const card of data_1.default.cards[pack]) {
            if (card.isCard) {
                totalValue += card.value;
                if (card.owner !== "") {
                    cardsOwned++;
                }
                if (card.type === "gif") {
                    gifs++;
                }
                else {
                    imgs++;
                }
            }
        }
        let amount = Card.cardsIn(pack);
        averageValue = amount === 0 ? 0 : totalValue / amount;
        return { totalValue, averageValue, cardsOwned, amount, gifs, imgs };
    }
    static packList() {
        let packs = [];
        let total = 0;
        let average = 0;
        let amt = 0;
        let owned = 0;
        let gif = 0;
        let img = 0;
        for (const pack in data_1.default.cards) {
            let packInfo = Card.packInfo(pack);
            packs.push(Object.assign({ pack: pack }, packInfo));
            let { totalValue, averageValue, imgs, gifs, cardsOwned, amount } = packInfo;
            total += totalValue;
            img += imgs;
            gif += gifs;
            owned += cardsOwned;
            amt += amount;
        }
        average = amt === 0 ? 0 : total / amt;
        return { packs: packs, total: { total, average, owned, amt, gif, img } };
    }
    static totalAmount() {
        return Object.keys(data_1.default.cards).reduce((acc, cur) => acc + Card.cardsIn(cur), 0);
    }
    static getTop() {
        let totalArray = [];
        for (const pack in data_1.default.cards) {
            for (const card of data_1.default.cards[pack]) {
                if (card.isCard) {
                    totalArray.push(card);
                }
            }
        }
        let ans = totalArray.sort((a, b) => b.value * b.multiplier - a.value * a.multiplier);
        let topCardValue = totalArray[0].value * totalArray[0].multiplier;
        if (topCardValue >= data_1.default.storage.topCardValue) { // Update config.topCardValue
            data_1.default.storage.topCardValue = topCardValue;
        }
        return ans;
    }
    static cardsIn(pack) {
        return data_1.default.cards[pack].reduce((acc, cur) => acc + (cur.isCard ? 1 : 0), 0);
    }
    static getTopPacks() {
        return Object.keys(data_1.default.cards).sort((a, b) => Card.packInfo(b).averageValue - Card.packInfo(a).averageValue);
    }
    static populate() {
        for (const pack in data_1.default.cards) {
            for (const card of data_1.default.cards[pack]) {
                Object.setPrototypeOf(card, Card.prototype);
            }
        }
    }
    static validate(pack, number) {
        let num = Number(number);
        let ans;
        let success = false;
        let message;
        let selectedCard;
        if (pack in data_1.default.cards) {
            if (!isNaN(num)) {
                if (num > 0 && num <= data_1.default.cards[pack].length) {
                    success = true;
                    for (const card of data_1.default.cards[pack]) {
                        if (card.id === num - 1) {
                            selectedCard = card;
                            break;
                        }
                    }
                }
                else {
                    message = "❌ El pack " + util_1.default.upperFirst(pack) + " no contiene la carta #" + number;
                }
            }
            else {
                message = "❌ Escribí un número para especificar una carta";
            }
        }
        else {
            message = "❌ No existe el pack " + util_1.default.code(pack);
        }
        return { success: success, message: message, card: selectedCard };
    }
    static updateAuctionsDueTo(reason, pack, deletedNumber, newPack, newNumber) {
        for (const auc of data_1.default.storage.auctions) {
            if (auc.card.pack === pack) {
                if (reason === "delete") {
                    if (auc.card.id > deletedNumber) {
                        auc.card.id--;
                    }
                }
                else {
                    if (auc.card.id === deletedNumber) {
                        auc.card.pack = newPack;
                        auc.card.id = newNumber;
                    }
                }
            }
        }
        for (const auc of data_1.default.storage.auctionsLog) {
            if (auc.card.pack === pack) {
                if (reason === "delete") {
                    if (auc.card.id > deletedNumber) {
                        auc.card.id--;
                    }
                    else if (auc.card.id === deletedNumber) {
                        data_1.default.storage.auctionsLog.splice(data_1.default.storage.auctionsLog.indexOf(auc), 1);
                    }
                }
                else {
                    if (auc.card.id === deletedNumber) {
                        auc.card.pack = newPack;
                        auc.card.id = newNumber;
                    }
                }
            }
        }
    }
    static rollCard(userID) {
        data_1.default.cache.rollCacheIndex++;
        if (data_1.default.cache.rollCacheIndex > data_1.default.config.maxRollCacheIndex) {
            data_1.default.cache.rollCacheIndex = 0;
        }
        let totalWeights = 0;
        for (const pack in data_1.default.cards) {
            let col = data_1.default.cards[pack];
            for (const c of col.filter(c => c.isCard)) {
                totalWeights += 100 - c.rarity;
            }
        }
        let randomCard = Math.floor(Math.random() * totalWeights);
        let acc = 0;
        for (const pack in data_1.default.cards) {
            let col = data_1.default.cards[pack];
            for (const c of col.filter(c => c.isCard)) {
                if (randomCard < acc) {
                    c.value += data_1.default.config.card.baseValue * c.rarity / 10;
                    if (c.value * c.multiplier > data_1.default.storage.topCardValue) {
                        data_1.default.storage.topCardValue = c.value * c.multiplier;
                    }
                    return c;
                }
                acc += 100 - c.rarity;
            }
        }
        /*
        let t = Card.totalAmount()
        let c = Data.users[userID].collectionSize()
        let d = t-c
        let w = 10
        let k = 1.5 * t
        let o = Math.floor(w*(1+k/(c*c)))
        if (o > 9*w) {
            o = 9*w
        }
        // console.log(w, o)
        let sumOfWeights = d*w + (isNaN(o) ? 0 : c*o)
        let randomCard = Math.floor(Math.random()*sumOfWeights)
        let acc = 0
        for (const pack in Data.cards) {
            let col = Data.cards[pack]
            for (const c of col.filter( c => c.isCard )) {
                if (c.owner === userID) {
                    acc += o
                } else {
                    acc += w
                }
                if (randomCard < acc) {
                    c.value += Data.config.card.baseValue*c.rarity/10
                    if (c.value * c.multiplier > Data.storage.topCardValue) {
                        Data.storage.topCardValue = c.value * c.multiplier
                    }
                    if (c.owner !== "") {
                        Data.users[c.owner].updateEconomy()
                    }
                    return c
                }
            }
        }
        */
    }
}
exports.default = Card;
