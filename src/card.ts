import { MessageEmbed } from "discord.js"
import Data from "./data"
import Util from "./util"

interface cardInput { /* Input for Card constructor */
    pack: string
    content: string
    owner?: string
    value?: number
    multiplier?: number
    rarity?: number
    name?: string
    description?: string    
}

interface singlePackInfo {
    totalValue: number
    averageValue: number
    cardsOwned: number
    amount: number
    gifs: number
    imgs: number
}
interface totalPackInfo {
    packs: Array<singlePackInfo>
    total: {
        total: number
        average: number
        owned: number
        amt: number
        gif: number
        img: number
    }
}

export default class Card { /* Command option */

    pack: string
    id: number
    cardIndex: number
    content: string
    owner: string
    value: number
    multiplier: number
    rarity: number
    name: string
    description: string
    type: string
    isCard: boolean
    inAuction: boolean
    inArk: boolean

    constructor( {pack, content, rarity = 0, owner = "", value = 0, multiplier = 1, name = "", description = ""}: cardInput ) {
    
        this.inArk = false
        this.pack = pack
        this.content = content
        this.rarity = rarity
        this.owner = owner
        this.value = value
        this.multiplier = multiplier
        this.name = name
        this.description = description
        this.inAuction = false

        this.type = ""
        let imageTypes = [".png", ".jpg", ".jpeg", ".gif"]
        for (const img of imageTypes) {
            if (content.includes(img)) {
                let sliceAt: number = content.search(img)
                content = content.slice(0, sliceAt + img.length)
                if (img === ".gif") {
                    this.type = "gif"
                } else {
                    this.type = "img"
                }
                break
            } else {
                this.type = "txt"
            }
        }

        this.isCard = this.type === "txt" ? false : true
        this.cardIndex = Card.cardsIn(pack)
        this.id = Data.cards[pack].length

        if (rarity === 0) { /* If rarity is not defined, will use type to set a value */
            if (this.type === "img") {
                this.rarity = Data.config.card.baseRarity
            } else if (this.type === "gif") {
                this.rarity = Data.config.card.gifRarityMultiplier*Data.config.card.baseRarity
            }
        }

    }

    getName(): string {
        return `${Util.upperFirst(this.pack)} #${this.cardIndex+1}`
    }

    getLong(): string {  /* Long name */
        return `${Util.upperFirst(this.pack)} #${this.cardIndex+1}` + (this.name === "" ? "" : ` "${this.name}"`)
    }
    
    getEmbed(): MessageEmbed {
        let nickname: string = this.owner === "" ? "-" : Data.users[this.owner].defaultName
        let ans = new MessageEmbed()
            .setAuthor(this.getRarityData().text, this.getRarityData().img)
            .setTitle(this.getLong())
            .setDescription(this.description)
            .setImage(this.content)
            .setColor(Util.valueToRgb(this.value*this.multiplier/Data.storage.topCardValue))
            .setFooter(`${this.cardIndex+1}/${Card.cardsIn(this.pack)} - id: ${this.pack} ${this.id+1}`)
            .addFields(
                { name: "Dueño", value: nickname, inline: true },
                { name: "Valor", value: "$" + this.value, inline: true },
                { name: "Multiplicador", value: "x" + this.multiplier, inline: true }
            )
        if (this.inAuction) {
            ans.addFields( { name: "En subasta!", value: "Revisá auc list", inline: false } )
        }
        return ans
            
            
    }

    getRarityData() {
        let r = this.rarity
        let ans = ""
        let link = ""
        if (r >= 70) {
            ans = "Legendaria"
            link = "https://i.imgur.com/ld215xY.png"
        } else if (r >= 50) {
            ans = "Épica"
            link = "https://i.imgur.com/lZxwWqK.png"
        } else if (r >= 25) {
            ans = "Rara"
            link = "https://i.imgur.com/HhmKxjy.png"
        } else {
            ans = "Común"
            link = "https://i.imgur.com/kEmbj45.png"
        }
        return {text: ans, img: link}
    }

    updateIndexes(): void {
        let cardIndex = 0
        let id = 0
        for (const card of Data.cards[this.pack]) {
            if (this === card) {
                break
            }
            id++
            if (card.isCard) {
                cardIndex++
            }
        }
        this.cardIndex = cardIndex
        this.id = id
    }

    static updatePackIndexes(pack: string) {
        for (const p of Data.cards[pack]) {
            p.updateIndexes()
        }
    }

    static packInfo(pack: string): singlePackInfo {
        let totalValue = 0
        let averageValue = 0
        let cardsOwned = 0
        let gifs = 0
        let imgs = 0
        for (const card of Data.cards[pack]) {
            if (card.isCard) {
                totalValue += card.value
                if (card.owner !== "") {
                    cardsOwned++
                }
                if (card.type === "gif") {
                    gifs++
                } else {
                    imgs++
                }
            }
        }
        let amount = Card.cardsIn(pack)
        averageValue = amount === 0 ? 0 : totalValue/amount
        return {totalValue, averageValue, cardsOwned, amount, gifs, imgs}
    }

    static packList(): totalPackInfo {//For data about all packs
        let packs = []
        let total = 0
        let average = 0
        let amt = 0
        let owned = 0
        let gif = 0
        let img = 0
        for (const pack in Data.cards) {
            let packInfo = Card.packInfo(pack)
            packs.push({...{pack: pack}, ...packInfo})
            let { totalValue, averageValue, imgs, gifs, cardsOwned, amount } = packInfo
            total += totalValue
            img += imgs
            gif += gifs
            owned += cardsOwned
            amt += amount
        }
        average = amt === 0 ? 0 : total/amt
        return {packs: packs, total: {total, average, owned, amt, gif, img}}
    }

    static totalAmount(): number {
        return Object.keys(Data.cards).reduce( (acc, cur) => acc + Card.cardsIn(cur), 0 )
    }

    static getTop(): Array<Card> { /*  Returns array of cards sorted by value*multiplier; and update maximum value */
        let totalArray: Array<Card> = []
        for (const pack in Data.cards) {
            for (const card of Data.cards[pack]) {
                if (card.isCard) {
                    totalArray.push(card)
                }
            }
        }
        let ans = totalArray.sort( (a, b) => b.value*b.multiplier - a.value*a.multiplier )
        let topCardValue = totalArray[0].value*totalArray[0].multiplier
        if (topCardValue >= Data.storage.topCardValue) { // Update config.topCardValue
            Data.storage.topCardValue = topCardValue
        }
        return ans
    }

    static cardsIn(pack: string): number {
        return Data.cards[pack].reduce( (acc, cur) => acc + (cur.isCard ? 1 : 0), 0)
    }

    static getTopPacks(): Array<string> {
        return Object.keys(Data.cards).sort( (a, b) => Card.packInfo(b).averageValue - Card.packInfo(a).averageValue )
    }

    static populate() {
        for (const pack in Data.cards) {
            for (const card of Data.cards[pack]) {
                Object.setPrototypeOf(card, Card.prototype)
            }
        }
    }

    static validate(pack: string, number: string) {
        let num = Number(number)
        let ans: {success: boolean, message?: string, card?: Card}
        let success = false
        let message
        let selectedCard
        if (pack in Data.cards) {
            if (!isNaN(num)) {
                if (num > 0 && num <= Data.cards[pack].length) {
                    success = true
                    for (const card of Data.cards[pack]) {
                        if (card.id === num - 1) {
                            selectedCard = card
                            break
                        }
                    }
                } else {
                    message = "❌ El pack " + Util.upperFirst(pack) + " no contiene la carta #" + number 
                }
            } else {
                message = "❌ Escribí un número para especificar una carta"
            }
        } else {
            message = "❌ No existe el pack " + Util.code(pack)
        }
        return { success: success, message: message, card: selectedCard }
    }


    static updateAuctionsDueTo(reason: "move" | "delete", pack: string, deletedNumber: number, newPack?: string, newNumber?: number) {
        for (const auc of Data.storage.auctions) {
            if (auc.card.pack === pack) {

                if (reason === "delete") {
                    if (auc.card.id > deletedNumber) {
                        auc.card.id--
                    }
                } else {

                    if (auc.card.id === deletedNumber) {
                        auc.card.pack = newPack!
                        auc.card.id = newNumber!
                    }
                }
            }
        }
        for (const auc of Data.storage.auctionsLog) {
            if (auc.card.pack === pack) {

                if (reason === "delete") {
                    if (auc.card.id > deletedNumber) {
                        auc.card.id--
                    } else if (auc.card.id === deletedNumber) {
                        Data.storage.auctionsLog.splice(Data.storage.auctionsLog.indexOf(auc), 1)
                    }
                } else {

                    if (auc.card.id === deletedNumber) {
                        auc.card.pack = newPack!
                        auc.card.id = newNumber!
                    }
                }
            }
        }
    }
    
    static setRarityOf(pack: string, nums: string, rarity: number) {
        let toDelete = nums.split(" ").map(v => Number(v))
        console.log(pack)
        console.log(toDelete)
        for (const t of toDelete) {
            console.log(t)
            console.log(Data.cards[pack])
            Data.cards[pack][t-1].rarity = rarity;
        }
    }


    static rollCard(userID: string) {
        Data.cache.rollCacheIndex++
        if (Data.cache.rollCacheIndex > Data.config.maxRollCacheIndex) {
            Data.cache.rollCacheIndex = 0
        }
        let totalWeights = 0
        for (const pack in Data.cards) {
            let col = Data.cards[pack]
            for (const c of col.filter( c => c.isCard )) {
                totalWeights += 80 - c.rarity
            }
        }

        let randomCard = Math.floor(Math.random()*totalWeights)
        let acc = 0
        for (const pack in Data.cards) {
            let col = Data.cards[pack]
            for (const c of col.filter( c => c.isCard )) {
                acc += 80 - c.rarity
                if (randomCard < acc) {
                    c.value += Data.config.card.baseValue*c.rarity/10
                    if (c.value * c.multiplier > Data.storage.topCardValue) {
                        Data.storage.topCardValue = c.value * c.multiplier
                    }
                    return c
                }
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