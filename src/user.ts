import {  Message, MessageEmbed, Guild, DataResolver, TextChannel } from "discord.js"
import { response } from "express"
import Card from "./card"
import Data from "./data"
import cache from "./data"
import Util from "./util"

type optionIndex = number

interface userInput { /* Input for User constructor */
    id: string
    guild: Guild
    defaultName: string
    nicks?: Array<string>
    initials?: initials
    description?: string
}
interface alreadyExistingUser {
    id: string
    nicks: Array<string>
    defaultName: string
    color: string
    avatarURL: string
    description: string
    collection: {[key: string]: Array<optionIndex>}
    economy: {
        [key: string]: commonEconomy
        bal: commonEconomy
        reacts: commonEconomy
        buys: commonEconomy
        invs: commonEconomy
        rolls: commonEconomy
    }
}
interface initials {
    [key: string]: number
    bal: number
    reacts: number
    buys: number
    invs: number
    rolls: number
}

interface commonEconomy {
    amount: number
    lastChecked: number
}

interface collectionData {
    pack: string
    totalValue: number
    averageValue: number
    passiveIncome: number
    isComplete: boolean
    cardsOwned: number
}

interface totalCollectionData {
    totalValue: number
    averageValue: number
    passiveIncome: number
    cardsOwned: number
}

interface totalPackData {
    totalValue: number
    averageValue: number
    passiveIncome: number
    isComplete: boolean
    cardsOwned: number
}

export default class User {

    lastBuyTime: number
    id: string
    song: string
    nicks: Array<string>
    defaultName: string
    color: string
    avatarURL: string
    description: string
    collection: {[key: string]: Array<optionIndex>}
    economy: {
        [key: string]: commonEconomy
        bal: commonEconomy
        reacts: commonEconomy
        buys: commonEconomy
        invs: commonEconomy
        rolls: commonEconomy
    }
    [key: string]: any
    
    constructor({id, guild, defaultName = "", nicks = [], initials = {bal: -1, reacts: -1, buys: -1, invs: -1, rolls: -1}, description = ""}: userInput) {

        this.lastBuyTime = Date.now()
        this.id = id
        this.song = ""
        this.nicks = nicks
        this.description = description
        this.defaultName = defaultName

        this.defaultName = ""
        this.avatarURL = ""
        this.color = ""
        this.updateGuildInfo(guild)

        let toEconomy: any = {}
        for (const key in initials) {
            if (initials[key] === -1) {
                if (key === "bal") {
                    initials[key] = Data.config.economy.startingMoney
                } else {
                    initials[key] = Data.config.economy.max[key]
                }
            }
            toEconomy[key] = {amount: initials[key], lastChecked: Date.now()}
        }
        this.economy = toEconomy

        this.collection = {}
        for (const pack in Data.cards) {
            this.collection[pack] = []
        }

    }

    getUserEmbed(): MessageEmbed {
        let eco = this.updateEconomy()
        let {bal, reacts, buys, invs, rolls} = eco
        let isMaxed: {[key: string]: boolean} = {}
        for (const key in eco) {
            if (key === "bal") {continue}
            if (eco[key] >= Data.config.economy.max[key]) {
                isMaxed[key] = true
            } else {
                isMaxed[key] = false
            }
        }
        let max: {[key: string]: string} = {}
        for (const key in isMaxed) {
            if (isMaxed[key]) {
                max[key] = " - Máx"
            } else {
                max[key] = ""
            }
        }
        let {totalValue, averageValue, passiveIncome, cardsOwned} = this.collectionInfo().total 
        let realPassive = Date.now() - this.lastBuyTime > Data.config.economy.lastBuyTimeLimit*60*60*1000 ? "0 (inactivo)" : Math.floor(passiveIncome + this.subsidio())
        return new MessageEmbed()
            .setTitle(`__${this.defaultName}__`)
            .setDescription(this.description)
            .setColor(this.color)
            .setThumbnail(this.avatarURL)
            .addFields(
                { name: "Cartas   ", value: cardsOwned + "/" + Card.totalAmount() + ` - ${Math.round(100*cardsOwned/Card.totalAmount())}%`, inline: true },
                { name: "Total    ", value: "$" + totalValue, inline: true },
                { name: "Promedio  ", value: "$" + Math.round(averageValue), inline: true },
                { name: "Balance", value: "$" + Math.floor(bal), inline: true },
                { name: "Ingresos", value: `$${realPassive}/día`, inline: true },
                { name: "Inversiones", value: Math.floor(invs) + max.invs, inline: true },
                { name: "Rolls", value: Math.floor(rolls) + max.rolls, inline: true },
                { name: "Reacciones", value: Math.floor(reacts) + max.reacts, inline: true },
                { name: "Compras", value: Math.floor(buys) + max.buys, inline: true }
            )
            .setFooter(`nombres: ${this.nicks.join(", ")}  -  id: ${this.id}`)
    }

    async updateGuildInfo(guild: Guild) {
        let memberObj = await guild.members.fetch(this.id)
        if (this.defaultName === "") {
            if (memberObj.nickname === null) {
                this.defaultName = memberObj.user.username
            } else {
                this.defaultName = memberObj.nickname
            }
        }
        this.color = memberObj.displayHexColor
        let avatarURL = memberObj.user.avatarURL()
        if (avatarURL === null) {
            this.avatarURL = ""
        } else {
            this.avatarURL = avatarURL
        }
    }

    getArk() {
        let ans = []
        for (const pack in this.collection) {
            for (const id of this.collection[pack]) {
                if (Data.cards[pack][id].inArk) {
                    ans.push(Data.cards[pack][id])
                }
            }
        }
        return ans
    }

    updateEconomy(): initials {
        const now = Date.now()
        let eco = this.economy
        for (const key in eco) {
            let commonEco = eco[key]
            if (key === "bal") {
                let { passiveIncome } = this.collectionInfo().total
                let actual = passiveIncome + this.subsidio()

                let timeLimit = this.lastBuyTime + Data.config.economy.lastBuyTimeLimit*60*60*1000

                if (commonEco.lastChecked < timeLimit) {

                    if (now > timeLimit) {
                        commonEco.amount += (timeLimit - commonEco.lastChecked)/86400000*actual
                    } else {
                        commonEco.amount += (now - commonEco.lastChecked)/86400000*actual
                    }

                } else {
                    commonEco.amount += 0
                }

            } else {
                commonEco.amount += (now - commonEco.lastChecked)/3600000*Data.config.economy.rates[key] // measured in hours
                if (commonEco.amount >= Data.config.economy.max[key]) {
                    commonEco.amount = Data.config.economy.max[key]
                }
            }
            commonEco.lastChecked = now
        }

        let ans: any = {}
        for (const key in eco) {
            ans[key] = eco[key].amount
        }
        return ans
    }

    changeBio(string: string) {
        this.description = string
    }

    changeDefaultName(string: string) {
        this.defaultName = string
    }

    addNick(string: string): string {
        if (this.nicks.includes(string)) {
            return `El nombre ${Util.code(string)} ya está asociado a tu ID`
        } else {
            this.nicks.push(string)
            return `El nombre ${Util.code(string)} se asoció a tu ID`
        }
    }

    removeNick(string: string): string {
        let indexOf = this.nicks.indexOf(string)
        if (indexOf === -1) {
            return `El nombre ${Util.code(string)} no está asociado a tu ID`
        } else {
            return `El nombre ${Util.code(string)} se desasoció de tu ID`
        }
    }

    waitingTimes(): initials {
        let updatedEco = this.updateEconomy()
        let ans: any = {}
        for (const key in updatedEco) {
            let remainingDecimal = 1 - (updatedEco[key] - Math.floor(updatedEco[key])) 
            ans[key] = remainingDecimal/Data.config.economy.rates[key]*60 // expressed in minutes
        }
        return ans
    }

    modifyData(key: string, amount: number): void {
        this.economy[key].amount += amount
    }

    fixPack(pack: string) {
        this.collection[pack] = []
        for (const c of Data.cards[pack]) {
            if (c.owner === this.id) {
                this.collection[pack].push(c.id)
            }
        }
    }

    static fixAllCol() {
        for (const u in Data.users) {
            for (const pack in Data.cards) {
                Data.users[u].fixPack(pack)
            }
        }
    }

    collectionSize(): number { // How many cards in total user has
        let ans = 0
        for (const pack in this.collection) {
            ans += this.collection[pack].length
        }
        return ans
    }

    packInfo(pack: string): {pack: Array<Card>, total: totalPackData} {
        let packArray = []
        let totalValue = 0
        let averageValue
        let passiveIncome = 0
        let isComplete

        for (const optionIndex of this.collection[pack]) {
            let card = Data.cards[pack][optionIndex]
            packArray.push(card)
            totalValue += card.value
            passiveIncome += card.value*Data.config.economy.passiveIncomeMultiplier
        }
        let cardsInPackCol = this.collection[pack].length
        averageValue = cardsInPackCol === 0 ? 0 : totalValue/cardsInPackCol
        if (cardsInPackCol === Card.cardsIn(pack)) {
            isComplete = true
            passiveIncome *= Card.cardsIn(pack)*Data.config.economy.completePackPassiveIncomeMultiplier
        } else {
            isComplete = false
        }

        return {pack: packArray, total: {totalValue: totalValue,
            averageValue: averageValue,
            passiveIncome: passiveIncome,
            isComplete: isComplete,
            cardsOwned: packArray.length
        }}
    }

    collectionInfo(): {collection: Array<collectionData>, total: totalCollectionData} {
        let collection: Array<collectionData> = []
        for (const pack in this.collection) {
            collection.push({
                ...{pack: pack}, ...this.packInfo(pack).total
            })
        }
        // Total of all packs
        let averageValue: number
        let { totalValue, passiveIncome } = collection.reduce( (acc, cur) => 
            ({totalValue: acc.totalValue + cur.totalValue,
            passiveIncome: acc.passiveIncome + cur.passiveIncome})
        ,{ totalValue: 0, passiveIncome: 0})
        averageValue = totalValue/this.collectionSize()

        return {collection, total: {totalValue, averageValue, passiveIncome, cardsOwned: this.collectionSize()}}
    }

    removeCard(card: Card) {
        let packCol = this.collection[card.pack]
        packCol.splice(packCol.indexOf(card.id), 1)
    }

    addCard(card: Card) {
        let packCol = this.collection[card.pack]
        packCol.push(card.id)
        packCol.sort( (a, b) => a - b)
    }

    giveMoneyTo(amount: number, user: User) {
        if (this.updateEconomy().bal >= amount) {
            this.modifyData("bal", -amount)
            user.modifyData("bal", amount)
            return true
        } else {
            return false
        }
    }

    addCardAll(pack: string, num: number) {
        let c =  Data.cards[pack][num]
        c.owner = this.id
        this.addCard(c)
    }

    subsidio(): number {
        /*
        let ans = 16000/this.collectionSize()+100
        if (ans > 1500 || isNaN(ans) || ans < 0) {
            ans = 1500
        }
        return ans
        */
       return Data.config.economy.subsidio
    }

    intWithCard(action: "auc" | "buy" | "inv" | "react" | "sell" | "give" | "offer" | "rename" | "desc" | "claim",
        cardObj: {card: Card, auctionStartingPrice?: number, newOffer?: number, msg?: {message?: Message, reactedBy: Array<string>}, newInfo?: string},
        other?: User) {

        /* Interactions with cards: Auction, Buy, Inv, React, Sell, Give */
        let card = cardObj.card
        let cardName = card.getLong()
        let userName = this.defaultName
        let isOwner = card.owner === this.id
        let indexOfAuction = -1
        let auctionObject
        if (card.inAuction) {
            indexOfAuction = Data.storage.auctions.map( v => v.card.id ).indexOf(card.id)
            auctionObject = Data.storage.auctions[indexOfAuction]
        }
        let { bal, buys, reacts, invs } = this.updateEconomy()
        bal = Math.floor(bal)
        let wait = this.waitingTimes()
        let result
        let success = false

        switch(action) {
            case "give":
                if (isOwner) {
                    if (!card.inAuction) {
                        if (other) {
                            card.owner = other.id
                            this.removeCard(card)
                            other.addCard(card)
                            this.updateEconomy()
                            other.updateEconomy()

                            result = `✅ ${userName} le dio ${cardName} a ${other.defaultName}!`
                            success = true

                        }
                    } else { result = `❌ ${cardName} está siendo subastada`}
                } else { result = `❌ ${cardName} no te pertenece` }
                break

            case "auc":
                if (isOwner) {
                    if (!card.inAuction) {
                        if (cardObj.auctionStartingPrice) {

                            Data.storage.auctions.push({card: {pack: card.pack, id: card.id}, offerValue: cardObj.auctionStartingPrice, offeredBy: this.id, offeredAt: Date.now()})
                            card.inAuction = true
                            
                            result = `✅ ${userName} puso ${cardName} en subasta empezando por $${cardObj.auctionStartingPrice}!`
                            success = true

                        }
                    } else { result = `❌ ${cardName} ya está siendo subastada` }
                } else { result = `❌ ${cardName} no te pertenece` }
                break

            case "offer":
                if (card.inAuction) {
                    if (!isOwner) {
                        if (cardObj.newOffer) {
                            if (bal >= cardObj.newOffer) {
                                if (cardObj.newOffer >= Data.config.economy.minimumOfferIncrease) {
                                    if (auctionObject) {
                                        auctionObject.offerValue = cardObj.newOffer
                                        auctionObject.offeredBy = this.id
                                        auctionObject.offeredAt = Date.now()
                                        
                                        result = `✅ ${userName} ofreció $${auctionObject.offerValue} por ${cardName}!`
                                        success = true
                                        }
                                } else { result = `❌ Tenés que aumentar la oferta por lo menos $${Data.config.economy.minimumOfferIncrease}`}
                            } else { result = `❌ No podés ofertar más plata de la que tenés`}
                        }
                    } else { result = `❌ No podés ofrecer plata por tu propia carta`}
                } else { result = `❌ ${cardName} no está siendo subastada`}
                break

            case "claim":
                if (card.inAuction) {
                    if (auctionObject) {
                        if (auctionObject.offeredBy === this.id) {
                            let timeDiff = (Date.now() - auctionObject.offeredAt)/1000/60/60 // in hours
                            if (timeDiff >= Data.config.economy.hoursToClaim) {
                                if (bal >= auctionObject.offerValue) {

                                    let exowner = Data.users[card.owner]
                                    this.giveMoneyTo(auctionObject.offerValue, exowner)
                                    this.updateEconomy()
                                    exowner.updateEconomy()

                                    card.owner = auctionObject.offeredBy
                                    card.inAuction = false

                                    Data.storage.auctionsLog.unshift(Object.assign(auctionObject, {exOwner: exowner.id}))
                                    Data.storage.auctions.splice(indexOfAuction, 1)

                                    result = `✅ ${userName} reclamó ${cardName} de ${exowner.defaultName} por $${auctionObject.offerValue}!`
                                    success = true

                                } else { result = `❌ Te faltan $${Math.round(auctionObject.offerValue - bal)} para poder reclamar ${cardName}`}
                            } else { result = `❌ Faltan ${Math.round(Data.config.economy.hoursToClaim - timeDiff)} horas para poder reclamar ${cardName}`}
                        } else { result = `❌ Tenés que ser la oferta más grande para poder reclamar ${cardName}`}
                    }
                } else { result = `❌ ${cardName} no está siendo subastada` }
                break

            case "buy":
                if (card.owner === "") {
                    if (buys >= 1) {
                        if (bal >= card.value) {

                            card.owner = this.id
                            this.addCard(card)

                            this.modifyData("buys", -1)
                            this.modifyData("bal", -card.value)
                            this.updateEconomy()
                            this.lastBuyTime = Date.now()

                            result = `✅ ${userName} compró ${cardName} por $${card.value}!`
                            success = true
                            

                        } else { result = `❌ Te faltan $${card.value - bal} para poder comprar ${cardName}` }
                    } else { result = `❌ No te quedan compras disponibles - Siguiente en ${Math.round(wait.buys)} minutos` }
                } else { result = `❌ ${cardName} le pertenece a ${Data.users[card.owner].defaultName}` }
                break

            case "inv":
                if (isOwner) {
                    if (invs >= 1) {
                        if (bal >= card.value) {

                            card.multiplier++

                            this.modifyData("invs", -1)
                            this.modifyData("bal", -card.value)
                            this.updateEconomy()

                            result = `✅ ${userName} invirtió en ${cardName} por $${card.value} y aumentó su multiplicador a x${card.multiplier}!`
                            success = true

                            if (card.value * card.multiplier > Data.storage.topCardValue) {
                                Data.storage.topCardValue = card.value * card.multiplier
                            }
                            
                        } else { result = `❌ Te faltan $${card.value - bal} para poder invertir en ${cardName}` }
                    } else { result = `❌ No te quedan inversiones disponibles - Siguiente en ${Math.round(wait.invs)} minutos` }
                } else { result = `❌ ${cardName} no te pertenece` }
                break

            case "react":
                if (!isOwner) {
                    if (reacts >= 1) {
                        if (cardObj.msg !== undefined) {
                            if (!cardObj.msg.reactedBy.includes(this.id)) {

                                let reactorReward
                                let baseReward = Math.round(card.value*card.multiplier*Data.config.economy.reactorBaseRewardMultiplier)
                                if (card.owner === "" || cardObj.msg.reactedBy.length === 0) {
                                    reactorReward = baseReward
                                    result = `✅ ${userName} reaccionó a ${cardName} y ganó $${reactorReward}!`
                                    if (card.owner !== "") {
                                        result += `\n${Data.users[card.owner].defaultName} ganó $${baseReward} por ser el dueño de la carta`
                                    }
                                } else {
                                    reactorReward = Math.round(baseReward*Data.config.economy.reactorNonOwnerMultiplier)
                                    result = `✅ ${userName} reaccionó a ${cardName} y ganó $${reactorReward}`
                                    result += `\n${Data.users[card.owner].defaultName} ganó $${baseReward} por ser el dueño de la carta`
                                    Data.users[card.owner].modifyData("bal", baseReward)
                                }
                                this.modifyData("bal", reactorReward)
                                this.modifyData("reacts", -1)
                                success = true
                                
                            } else { result = `❌ Ya reaccionaste a ${cardName}`}
                        }
                    } else { result = `❌ No te quedan reacciones disponibles - Siguiente en ${Math.round(wait.reacts)} minutos` }
                } else { result = `❌ No podés reaccionar a ${cardName} porque ya es tuya`}
                break

            case "sell":
                if (isOwner) {
                    if (!card.inAuction) {
                    card.owner = ""
                    this.removeCard(card)
                    this.modifyData("bal", card.value*Data.config.economy.sellMultiplier)
                    this.updateEconomy()

                    result = `✅ ${userName} vendió ${cardName} por $${card.value*Data.config.economy.sellMultiplier}!`
                    success = true
                    } else { result = `❌ ${cardName} está siendo subastada`}
                } else { result = `❌ ${cardName} no te pertenece` }
                break

            case "rename":
                if (isOwner) {
                    if (cardObj.newInfo !== undefined) {

                        card.name = cardObj.newInfo

                        result = `✅ ${userName} renombró a ${cardName} "${cardObj.newInfo}"!`
                        success = true

                    }
                } else { result = `❌ ${cardName} no te pertenece` }
                break

            case "desc":
                if (isOwner) {
                    if (cardObj.newInfo !== undefined) {

                        card.description = cardObj.newInfo

                        result = `✅ ${userName} cambió la descripción de ${cardName} "${cardObj.newInfo}"!`
                        success = true

                    }
                } else { result = `❌ ${cardName} no te pertenece` }
                break
        }
        return {success: success, result: result, updatedCard: card}
    }

    static getTop(): Array<User> { /* Returns array of top users sorted by cards owned */
        let totalArray: Array<User> = []
        for (const user in Data.users) {
            totalArray.push(Data.users[user])
        }
        return totalArray.sort( (a, b) => b.collectionSize() - a.collectionSize() )
    }

    static getUserFromNick(nick: string): {success: boolean, user?: User} {
        if (nick in Data.users) {
            return { success: true, user: Data.users[nick] }
        }
        for (const user in Data.users) {
            if (Data.users[user].defaultName === nick) {
                return { success: true, user: Data.users[user] }
            }
            for (const n of Data.users[user].nicks) {
                if (nick === n) {
                    return { success: true, user: Data.users[user] }
                }
            }
        }
        return { success: false }
    }

    static gu(nick: string) {
        return User.getUserFromNick(nick).user!
    }

    static doIfTarget(targetUser: User, targetFound: boolean, callback: Function, nick: string, formatData?: ((arg0: any) => Array<string>)) {
        if (targetFound) {
            let result = callback!.bind(targetUser)()
            if (formatData) {
                result = formatData(result)
            }
            if (Array.isArray(result)) {
                return {text: result, embed: undefined}
            } else {
                return {text: undefined, embed: result}
            }
        } else {
            return {text: [`❌ El nombre ${Util.code(nick)} no está registrado`], embed: undefined}
        }
    }

    static createNew(id: string, guild: Guild, username: string) {  /* Create a new user if not exists */
        if (!(id in Data.users)) {
            Data.users[id] = new User({id: id, guild: guild, defaultName: username})
            console.log("Created new user with id " + id)
        }
    }

    static populate() {
        for (const id in Data.users) {
            Object.setPrototypeOf(Data.users[id], User.prototype)
        }
    }

    static updateDueToDeletion(pack: string, id: number) {
        for (const u in Data.users) {
            let col = Data.users[u].collection[pack]
            if (col.includes(id)) {
                col.splice(col.indexOf(id), 1) // delete
            }
            for (let i = col.length - 1; i >= 0; i--) {
                if (col[i] >= id) {
                    col[i]--
                }
            }
        }
    }
}
