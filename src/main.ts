import Discord, { Client, MessageEmbed, MessageReaction, TextChannel } from "discord.js"

import Card from "./card"
import User from "./user"
import Data from "./data"
import Util from "./util"
import Database from "./database"
import Request from "./request"
import Messages from "./messages"

export default class Main {
    static cmdHandler = CommandHandler
    static rctHandler = ReactionHandler
}

async function CommandHandler(msg: Discord.Message, client: Client) {
    if (!msg.content.startsWith(Data.config.prefix)) {return} // only listen when prefix
    
    Data.cache.thereWasChange = true

    let normalArgs = msg.content.split(" ")  // To be used when user input is important
    let args = normalArgs.map(a => a.toLowerCase())
    let act = args.length
    let main = args[0].slice(Data.config.prefix.length)

    let ch = msg.channel
    let guild = msg.guild
    if (guild === null) {return} // avoid DMs
    if (!(ch instanceof TextChannel)) {return} // avoid weird channels

    let user = msg.author
    let username = user.username
    let id: string = user.id
    User.createNew(id, guild, username)
    
    let ogUser = Data.users[id] as User // Og user can be the same as target.
    let ogName = ogUser.defaultName
    let ogId = id

    let targetFound: boolean
    let targetUser: User = ogUser
    if (act > 1) {
        let mainUserAttempt = User.getUserFromNick(args[1])
        if (mainUserAttempt.success) {
            targetUser = mainUserAttempt.user! as User
            targetFound = true
        } else {
            targetFound = false
        }
    } else {
        targetUser = Data.users[id] as User
        targetFound = true
    }
    let targetName: string
    let targetId: string
    if (targetUser) {
        targetName = targetUser.defaultName
        targetId = targetUser.id
    }

    let resp: {text: Array<string> | undefined, embed: MessageEmbed | undefined} | undefined = {text: undefined, embed: undefined} // response object
    let response // Auxiliary
    let askedForConfirm = false
    switch(main) {


        case "ark":
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
                resp.text = ogUser.getArk().map( c => `${c.getLong()} - $${c.value} - ${c.multiplier}`)
                resp.text.unshift("Tu arca de cartas, van a seguir siendo tuyas despues del reset")
                resp.text.push(String(ogUser.getArk().length) + " cartas")
                resp.text.push("Añadi cartas con ark + y remove con ark -")
            break

        case "backup":
            Database.createBackup()
            break

        case "new":
            resp.text = Messages.new
            break

        case "help":
        case "h":
            let m = Messages.help
            let t: Array<string>
            if (act > 1) {
                switch (args[1]) {
                    case "c":
                    case "card":
                        t = m.card
                        break

                    case "u":
                    case "user":
                        t = m.user
                        break

                    case "bot":
                        t = m.bot
                        break

                    case "cmd":
                    case "command":
                        t = m.cmd
                        break
                    
                    default:
                        t = ["Uso correcto: leer `help`"]
                }
            } else { t = Messages.help.all }
            resp.text = t
            break


        case "n":
        case "next":
        case "p":
        case "prev":
            resp.text = ["Comando actualmente no disponible"]



        case "income":
        case "inc":
        case "sub":
            let sub = ogUser.subsidio()
            let tot = ogUser.collectionInfo().total.passiveIncome
            resp.text = [`Por día ganás **$${Util.truncateTo(tot+sub, 2)}**: $${Util.truncateTo(tot, 2)} por tus cartas y $${Util.truncateTo(sub, 2)} por subsidio`]
            break

        case "card":
        case "c":
            if (act > 1) {
                if (act > 2) {
                    let response = Card.validate(args[1], args[2])
                    if (response.success) {
                        resp.embed = response.card?.getEmbed()
                    } else {
                        resp.text = [response.message!]
                    }
                } else { resp.text = ["Uso correcto: " + Util.code("card <pack> <número>")] }
            } else { resp.text = ["Uso correcto: " + Util.code("card <pack> <número>")] }
            break

        case "confirm":
            if (Data.cache.waitingForConfirm) {
                resp.text = ["Funcion todavia no agregada"]
            } else {
                resp.text = ["Comando no disponible"]
            }

        case "rename":
            response = verifyInput(args, act, "rename <pack> <número> <nombre>", true)
            if (response.success) {
                let res = ogUser.intWithCard("rename", {card: response.card!, newInfo: normalArgs.slice(3).join(" ")})
                resp.text = [res.result!]
                    if (res.success) {
                        resp.embed = response.card!.getEmbed()
                    }
            } else { resp.text = response.tans }
            break
            
        case "lore":
            response = verifyInput(args, act, "lore <pack> <número> <nombre>", true)
            if (response.success) {
                let res = ogUser.intWithCard("desc", {card: response.card!, newInfo: normalArgs.slice(3).join(" ")})
                resp.text = [res.result!]
                    if (res.success) {
                        resp.embed = response.card!.getEmbed()
                    }
            } else { resp.text = response.tans }
            break

        case "invest":
        case "inv":
            response = verifyInput(args, act, "inv <pack> <número>")
            if (response.success) {
                let res = ogUser.intWithCard("inv", {card: response.card!})
                resp.text = [res.result!]
                if (res.success) {
                    resp.embed = response.card!.getEmbed()
                }
            } else { resp.text = response.tans }
            break

        case "sell":
            response = verifyInput(args, act, "sell <pack> <número>")
            if (response.success) {
                let res = ogUser.intWithCard("sell", {card: response.card!})
                resp.text = [res.result!]
                if (res.success) {
                    resp.embed = response.card!.getEmbed()
                }
            } else { resp.text = response.tans }
            break

        case "offer":
            response = verifyInput(args, act, "offer <pack> <número> <plata>", true)
            if (response.success) {
                let num = Number(args[3])
                if (!isNaN(num)) {
                    let res = ogUser.intWithCard("offer", {card: response.card!, newOffer: num})
                    resp.text = [res.result!]
                    if (res.success) {
                        resp.embed = response.card!.getEmbed()
                    }
                } else { resp.text = ["Uso correcto: " + Util.code("offer <pack> <número> <plata>")] }
            } else { resp.text = response.tans }
            break

        case "claim":
            response = verifyInput(args, act, "claim <pack> <número>")
            if (response.success) {
                let res = ogUser.intWithCard("claim", {card: response.card!})
                resp.text = [res.result!]
                if (res.success) {
                    resp.embed = response.card!.getEmbed()
                }
            } else { resp.text = response.tans }
            break

        case "auc":
        case "auction":
            let isList = false
            if (act > 1) {
                if (args[1] === "list") {
                    isList = true
                    resp.text = Data.storage.auctions.map( v => {
                        let c = Data.cards[v.card.pack][v.card.id]
                        let timeDiff = (Date.now() - v.offeredAt)/1000/60/60
                        return (`${Util.bold(c.getLong())} de ${Data.users[c.owner].defaultName}: `
                        + (c.owner === v.offeredBy ? `Sin ofertas (valor inicial: $${v.offerValue})` : `${Data.users[v.offeredBy].defaultName} ofertó $${v.offerValue}`)
                        + " - Se puede reclamar" + (timeDiff >= Data.config.economy.hoursToClaim ? "!" : ` en ${Math.round(Data.config.economy.hoursToClaim - timeDiff)} horas`))
                    })
                    resp.text.unshift("")
                    resp.text.unshift(Util.title("Subastas actuales:"))
                } else if (args[1] === "log") {
                    isList = true
                    isList = true
                    resp.text = Data.storage.auctionsLog.map( v => {
                        let c = Data.cards[v.card.pack][v.card.id]
                        let timeDiff = (Date.now() - v.offeredAt)/1000/60/60
                        return `${Util.bold(c.getLong())} de ${Data.users[v.exOwner].defaultName}: ${Data.users[v.offeredBy].defaultName} la compró por $${v.offerValue}`
                    })
                    resp.text.unshift("")
                    resp.text.unshift(Util.title("Subastas terminadas:"))
                }
            }
            if (!isList) {
                response = verifyInput(args, act, "auc <pack> <número> <plata>")
                if (response.success) {
                    let num = Number(args[3])
                    if (!isNaN(num)) {
                        let res = ogUser.intWithCard("auc", {card: response.card!, auctionStartingPrice: num})
                        resp.text = [res.result!]
                        if (res.success) {
                            resp.embed = response.card!.getEmbed()
                        }
                    } else { resp.text = ["Uso correcto: " + Util.code("auc <pack> <número> <plata>")] }
                } else { resp.text = response.tans }
            }
            break

        case "desc":
        case "description":
            if (act > 1) {

                ogUser.description = normalArgs.slice(1).join(" ")
                resp.text = ["Tu descripción fue actualizada"]

            } else { resp.text = ["Uso correcto: " + Util.code("desc <descripción>")] }
            break

        case "name":
        case "nick":
            if (act > 1) {

                ogUser.defaultName = normalArgs.slice(1).join(" ")
                resp.text = ["Tu nombre principal fue actualizado"]

            } else { resp.text = ["Uso correcto: " + Util.code("name <nombre>")] }
            break

        case "debug":
        case "dg":
            Util.debug(normalArgs.slice(1), Data, Card, User)
            break

        case "save":
            let msg = await ch.send("Guardando datos...")
            await Database.file("w")
            msg.edit("Guardando datos... listo")
            break

        case "user":
        case "u":
            resp = User.doIfTarget(targetUser, targetFound, targetUser.getUserEmbed, args[1])
            break

        case "wait":
        case "w":
            resp = User.doIfTarget(targetUser, targetFound, targetUser.waitingTimes, args[1], (a) => {
                let { rolls, reacts, buys, invs } = a
                function f(time: number, data: string, article: string): string {
                    return `${Math.round(time)} minutos para ${article} siguiente ${data}`
                }
                return [Util.title("Tiempos restantes para " + targetName + ":"),
                    f(rolls, "roll", "el"),
                    f(reacts, "reacción", "la"),
                    f(buys, "compra", "la"),
                    f(invs, "inversión", "la"),
                ]
            })
            break
        
        case "bal":
            resp = User.doIfTarget(targetUser, targetFound, targetUser.updateEconomy, args[1], (a) => {
                return [`${targetName} tiene $${Util.truncateTo(a.bal, 2)}`]
            }) 
            break

        case "reacts":
        case "buys":
        case "invs":
        case "rolls":
            let economyPlusWaitings = () => {
                let eco = targetUser.updateEconomy()
                let waitings = targetUser.waitingTimes()
                let isMaxed: {[key: string]: boolean} = {}
                for (const key in eco) {
                    if (key === "bal") {continue}
                    if (eco[key] >= Data.config.economy.max[key]) {
                        isMaxed[key] = true
                    } else {
                        isMaxed[key] = false
                    }
                }
                return [`${targetName} tiene ${Math.floor(eco[main])} ${Util.nice((main as any))}`
                    + (isMaxed[main] ? " (cantidad máxima)" : `, siguiente en ${Math.round(waitings[main])} minutos`)]
            }
            resp = User.doIfTarget(targetUser, targetFound, economyPlusWaitings, args[1]) 
            break

        case "pay":
            let pay = () => {
                if (act > 2) {
                    let money = Number(args[2])
                    if (!isNaN(money)) {
                        if (Number(money) > 0) {
                            if (ogUser.giveMoneyTo(money, targetUser)) {
                                
                                return [`${ogName} le dio $${money} a ${targetName}!`]

                            } else { return [`No tenés suficiente plata`] }
                        } else { return [`Escribí un número positivo`] }
                    } else { return [`Uso correcto: ${Util.code("pay <usuario> <plata>")}`] }
                } else { return [`Uso correcto: ${Util.code("pay <usuario> <plata>")}`] }
            }
            resp = User.doIfTarget(targetUser, targetFound, pay, args[1])
            break

        case "give":
            let showEmbed = false
            resp.text = User.doIfTarget(targetUser, targetFound, () => {
                if (act > 2) {
                    if (act > 3) {
                        let response = Card.validate(args[2], args[3])
                        if (response.success) {
                            showEmbed = true
                            return [ogUser.intWithCard("give", {card: response.card!}, targetUser).result]
                        } else {
                            return [response.message]
                        }
                    } else { return ["Uso correcto: " + Util.code("<give> <usuario> <pack> <número>")] }
                } else { return ["Uso correcto: " + Util.code("<give> <usuario> <pack> <número>")] }
            },args[1]).text
            if (showEmbed) {
                resp.embed = Data.cards[args[2]][Number(args[3])-1].getEmbed()
            }
            break


        case "link":
            resp.text = [ "https://momo.zokalyx.repl.co - actualmente muestra el pack " + Util.code(Data.cache.packInWebsite) + ", elegí otro con pack <pack>"]
            break

        case "col":
        case "collection":
            let callback: () => any
            let colInfo = (user: User) => {
                let col = user.collectionInfo()
                let ans = [Util.title(`Colección de ${user.defaultName}:`), ""]
                for (const pack of col.collection) {
                    if (pack.cardsOwned === 0) { continue }
                    ans.push(
                        `${Util.bold(Util.upperFirst(pack.pack))}: ${pack.cardsOwned}/${Card.cardsIn(pack.pack)} - Total: $${pack.totalValue} - Promedio: $${Math.round(pack.averageValue)} - Ingresos: $${Math.floor(pack.passiveIncome)}/día`
                        + (pack.isComplete ? " Completa!" : "")
                    )
                }
                ans.push("")
                ans.push(`${Util.title("Totales:")} ${col.total.cardsOwned}/${Card.totalAmount()} - Total: $${col.total.totalValue} - Promedio: $${Math.round(col.total.averageValue)} - Ingresos: $${Math.floor(col.total.passiveIncome)}/día`)
                return ans
            }
            let packInfo = (user: User, pack: string) => {
                let col = user.packInfo(pack)
                let ans = [Util.title(`Colección de ${user.defaultName} (pack ${Util.upperFirst(pack)}):`), ""]
                for (const card of col.pack) {
                    ans.push(
                        `${Util.bold(card.getLong()) + ":"} ${card.type} - Valor: $${card.value} - x${card.multiplier}`
                        + (card.inAuction ? " En subasta" : "")
                    )
                }
                ans.push("")
                ans.push(`${Util.title("Totales:")} Total: $${col.total.totalValue} - Promedio: $${Math.round(col.total.averageValue)} - Ingresos: $${Math.round(col.total.passiveIncome)}`)
                return ans
            }

            if (act > 2) {
                targetName = args[1]
                callback = () => {
                    if (args[2] in Data.cards) {
                        return packInfo(targetUser, args[2])
                    } else { return [`No existe el pack ${Util.code(args[2])}`] }
                }
            } else if (act > 1) {
                targetName = args[1]
                if (args[1] in Data.cards) {
                    targetUser = ogUser
                    targetName = ogName
                    targetId = ogId
                    targetFound = true
                    callback = () => {
                        return packInfo(targetUser, args[1])
                    }
                } else {
                    callback = () => {
                        return colInfo(targetUser)
                    }
                }
            } else {
                callback = () => {
                    return colInfo(targetUser)
                }
            }
            resp = User.doIfTarget(targetUser, targetFound, callback, targetName!)
            break

        case "p":
        case "pack":
            if (act > 1) {
                if (args[1] === "list") {

                    let totalValue = 0
                    let ownedCards = 0
                    let gifs = 0
                    let imgs = 0
                    resp.text = [Util.title("Lista de packs:"), ""]
                    for (const pack in Data.cards) {
                        let pinf = Card.packInfo(pack)
                        resp.text.push(`**${Util.upperFirst(pack)}:** ${pinf.gifs} gifs y ${pinf.imgs} imgs - Total: $${pinf.totalValue} - Promedio: $${Math.round(pinf.averageValue)} - ${pinf.cardsOwned}/${Card.cardsIn(pack)} con dueño`)
                        totalValue += pinf.totalValue
                        ownedCards += pinf.cardsOwned
                        gifs += pinf.gifs
                        imgs += pinf.imgs
                    }
                    resp.text.push("")
                    let tot = Card.totalAmount()
                    resp.text.push(`${Util.title("Totales:")} ${gifs} gifs y ${imgs} imgs - Total: $${totalValue} - Promedio: $${Math.round(totalValue/tot)} - ${ownedCards}/${tot} (${Math.round(ownedCards/tot*100)}%) con dueño`)

                } else if (args[1] in Data.cards) {

                    Data.cache.packInWebsite = args[1]
                    resp.text = Data.cards[args[1]].filter(c => c.isCard).map(c =>
                        Util.bold(c.getLong() + ":") + ` ${c.type} - Valor: $${c.value} - x${c.multiplier}`
                        + (c.owner === "" ? " - Sin dueño" : " - Dueño: " + Data.users[c.owner].defaultName)    
                    )
                    resp.text.unshift("")
                    resp.text.unshift(Util.title("Pack " + Util.upperFirst(args[1]) + ":"))
                    let pinf = Card.packInfo(args[1])
                    resp.text.push("")
                    resp.text.push(`${Util.title("Totales:")} Total: $${pinf.totalValue} - Promedio: $${Math.round(pinf.averageValue)} - ${pinf.cardsOwned}/${Card.cardsIn(args[1])} con dueño`)
                
                } else {
                    resp.text = ["No existe el pack " + Util.code(args[1])]
                }
            } else { resp.text = ["Uso correcto: " + Util.code("pack <pack>")] }
            break

        case "top":
            if (act > 1) {
                switch (args[1]) {
                    case "u":
                    case "user":
                    case "users":
                        resp.text = User.getTop().map((u, i) => `${Util.bold("#" + (i+1) + " - " + u.defaultName + ":")} ${u.collectionSize()} cartas - $${Math.floor(u.updateEconomy().bal)}`)
                        resp.text.unshift(Util.title("Top usuarios:"))
                        break

                    case "c":
                    case "card":
                    case "cards":
                        resp.text = Card.getTop().slice(0, 20).map((c, i) =>
                            `${Util.bold("#" + (i+1) + " - " + c.getLong() + ":")} Valor: $${c.value} - x${c.multiplier}`
                            + (c.owner === "" ? " - Sin dueño" : " - Dueño: " + Data.users[c.owner].defaultName) 
                            + (c.inAuction ? " - En subasta" : ""))
                        resp.text.unshift(Util.title("Top cartas:"))
                        break

                    case "p":
                    case "pack":
                    case "packs":
                        resp.text = Card.getTopPacks().slice(0, 10).map((c, i) => {
                            let pinfo = Card.packInfo(c)
                            return `${Util.bold("#" + (i+1) + " - " + Util.upperFirst(c) + ":")} Valor promedio: $${Math.round(pinfo.averageValue)}`
                                + ` - Valor total: $${pinfo.totalValue} - ${pinfo.cardsOwned}/${Card.cardsIn(c)} con dueño`
                        })
                        resp.text.unshift(Util.title("Top packs:"))
                        break

                    case "col":
                        resp.text = Card.getTop().filter( c => c.owner === ogId ).map((c, i) =>
                        `${Util.bold("#" + (i+1) + " - " + c.getLong() + ":")} Valor: $${c.value} - x${c.multiplier}`
                        + (c.inAuction ? " - En subasta" : ""))
                        resp.text.unshift(Util.title("Top cartas tuyas:"))
                        break

                    default:
                        resp.text = [`Uso correcto: ${Util.code("top <categoría>")} (${Util.code("users")}, ${Util.code("cards")} o ${Util.code("packs")})`]
                }
            } else { resp.text = [`Uso correcto: ${Util.code("top <categoría>")} (${Util.code("users")}, ${Util.code("cards")} o ${Util.code("packs")})`] }
            break

        case "exit":
            let suc = true
            if (act > 1) {
                if (args[1] === "nosave") {
                    ch.send("Apagando bot sin guardar...")
                } else {
                    suc = false
                    resp.text = [Util.code("exit nosave") + " apaga el bot sin guardar"]
                }
            } else {
                ch.send("Guardando y apagando bot...")
            }
            if (suc) {
                await Database.file("w")
                client.destroy()
                process.exit()
            }
            break
    
    
        case "id":
            if (act > 1) {
                switch (args[1]) {
                    case "list":
                        resp.text = [Util.title("Lista de IDs y nombres:"), ""]
                        for (const c in Data.users) {
                            let u = Data.users[c]
                            resp.text.push(`${Util.bold(u.defaultName + ":")} ID: ${Util.code(u.id)} - Nombres: \`` + u.nicks.join("`, `") + "`")
                        }
                        break

                    case "-":
                        if (act > 2) {
                            if (ogUser.nicks.includes(args[2])) {
                                ogUser.nicks.splice(ogUser.nicks.indexOf(args[2]), 1)
                                resp.text = ["Nombre " + Util.code(args[2]) + " removido"]
                            } else { resp.text = [Util.code(args[2]) + " no es un nombre tuyo"]}
                        } else { resp.text = ["Uso correcto: " + Util.code("id - <nombre>")]}
                        break

                    default:
                        if (!ogUser.nicks.includes(args[1])) {
                            ogUser.nicks.push(args[1])
                            resp.text = ["Nombre " + Util.code(args[1]) + " agregado"]
                        } else { resp.text = ["El nombre " + Util.code(args[1]) + " ya es tuyo"]}
                }
            } else {
                resp.text = [`Tu ID es ${Util.code(ogId)} y los nombres asociados a la misma son: \`` + ogUser.nicks.join("`, `") + "`"]
            }
            break


        case "config":
        case "cfg":
            resp.text = [JSON.stringify(Data.config).split("").map( v => v === "," ? "\n" : v).filter( v => v !== "{" && v !== "}" && v !== '"').join("")]
            break


        case "-":
        case "remove":
            if (act > 1) {
                if (args[1] in Data.cards) {
                    delete Data.cards[args[1]]
                    for (const u in Data.users) {
                        delete Data.users[u].collection[args[1]]
                    }
                    resp.text = [`Comando ${Util.code(args[1])} removido`]
                } else { resp.text = ["No existe el comando " + Util.code(args[1])]}
            } else { resp.text = ["Uso correcto: " + Util.code("- <comando>")]}
            break

        case "+":
        case "add":
            if (act > 1) {
                if (!(args[1] in Data.cards)) {
                    Data.cards[args[1]] = []
                    for (const u in Data.users) {
                        Data.users[u].collection[args[1]] = []
                    }
                    resp.text = [`Comando ${Util.code(args[1])} agregado`]
                } else { resp.text = ["Ya existe el comando " + Util.code(args[1])]}
            } else { resp.text = ["Uso correcto: " + Util.code("+ <comando>")]}
            break


        case "roll":
        case "r":
            if (ogUser.updateEconomy().rolls >= 1) {
                ogUser.modifyData("rolls", -1)
                let crd = Card.rollCard(ogId)!
                let embed = crd.getEmbed()
                let msg = await ch.send(embed)
                Data.cache.rollCache[Data.cache.rollCacheIndex] = { message: msg, card: crd, reactedBy: [], timeRolled: Date.now() }
                if (crd.owner === "") {
                    msg.react("💰")
                }
                msg.react("🔥")
                return

            } else { 
                let wait = ogUser.waitingTimes().rolls
                resp.text = ["No tenés rolls disponibles" + `, siguiente en ${Math.round(wait)} minutos`]}
            break


        default:
            if (main in Data.cards) {
                resp.text = await customCommand(main, act, args, normalArgs, ogId)
                if (resp.text[0].startsWith("Esta carta le pertenece a")) {
                    askedForConfirm = true
                }
            } else { resp.text = [`No existe el comando ${Util.code(main)}`]}
        }

    if (resp?.text) {
        Util.chunkAndSend(resp.text, 20, ch)
    }
    if (resp?.embed) {
        ch.send(resp.embed)
    }

    if (!askedForConfirm) {
        Data.cache.waitingForConfirm = false
    } else {
        Data.cache.waitingForConfirm = true
    }
}

async function ReactionHandler(r: MessageReaction, u: Discord.User | Discord.PartialUser) {
    let id = u.id
    let username = u.username!
    let guild = r.message.guild
    let channel = r.message.channel
    let emoji = r.emoji.name
    let msg = r.message

    if (u.bot) {return} // avoid self and other bots
    if (guild === null) {return} // avoid DMs
    if (!(channel instanceof TextChannel)) {return} // avoid weird channels

    User.createNew(id, guild, username)

    let user = Data.users[id]

    let response: string = ""
    if (Data.cache.rollCache.map( m => m.message ).includes(msg)) {
        let rollCacheObject = Data.cache.rollCache[Data.cache.rollCache.map( m => m.message ).indexOf(msg)]
        if (Date.now() - rollCacheObject.timeRolled < Data.config.maxTimeToInteract*1000*60*60) {
            if (emoji === "🔥") {
                let resp = user.intWithCard("react", {card: rollCacheObject.card, msg: {reactedBy: rollCacheObject.reactedBy.map( v => v.id )}} )
                response = resp.result!
                if (resp.success) {
                    rollCacheObject.reactedBy.push(Data.users[id])
                }
            } else if (emoji === "💰") {
                let resp = user.intWithCard("buy", {card: rollCacheObject.card})
                response = resp.result!
                if (resp.success) {
                    rollCacheObject.message.edit(resp.updatedCard.getEmbed())
                }
            }
        }
    }

    if (response !== "") {
        channel.send(response)
    }

}

function verifyInput(args: Array<string>, act: number, correctUse: string, requireExtra: boolean = false) {
    let tans: Array<string> = []
    let success = false
    let card: Card | undefined
    if (act > 1) {
        if (act > 2) {
            let response = Card.validate(args[1], args[2])
            let c = response.card
            if (response.success) {
                if (c) {
                    if (act > 3 || !requireExtra) {
                        card = c
                        success = true
                    } else { tans = ["Uso correcto: " + Util.code(correctUse)] }
                }
            } else {
                tans = [response.message!]
            }
        } else { tans = ["Uso correcto: " + Util.code(correctUse)] }
    } else { tans = ["Uso correcto: " + Util.code(correctUse)] }     
    return {tans: tans, success: success, card: card}  
}

async function customCommand(main: string, act: number, args: Array<string>, normalArgs: Array<string>, ogId: string) {
    let arr = Data.cards[main]
    let tans: Array<string> = []
    if (act > 1) {
        switch (args[1]) {
            case "list":
                tans = [Util.title("Opciones del comando " + Util.code(main)), ""]
                for (const c of arr) {
                    tans.push(`Opción ${c.id+1}: ${c.type}`)
                }
                break

            case "+":
            case "add":
                if (act > 2) {
                    let cont = normalArgs.slice(2).join(" ")
                    if (cont.includes("tenor") && !cont.endsWith(".gif")) {
                        let gifRequest: {success: boolean, link: string} = await Request.getTenorGif(cont)
                        console.log(gifRequest)
                        if (gifRequest.success) {
                            cont = gifRequest.link
                        } else {
                            tans = ["Hubo un error"]
                            break
                        }
                    }
                    let nw = new Card({pack: main, content: cont})
                    Data.cards[main].push(nw)
                    let niceType = "Texto"
                    if (nw.type === "gif") {
                        niceType = "Gif"
                    } else if (nw.type === "img") {
                        niceType = "Imagen"
                    }
                    tans = [niceType + " agregado/a al comando " + Util.code(main)]
                } else { tans = ["Uso correcto: " + Util.code("<comando> + <contenido>")]}
                break

            case "-":
            case "remove":
                let toRemoveId = Data.cards[main].length-1
                let success = true
                console.log("a")
                if (act > 2) {
                    console.log("b")
                    let num = Number(args[2])
                    if (!isNaN(num)) {
                        console.log("c")
                        if (num > 0 && num <= Data.cards[main].length) {
                            toRemoveId = num - 1
                            console.log("d")
                        } else { 
                            tans = ["El comando " + Util.code(main) + " no contiene la opción número " + num]
                            success = false    
                        }
                    } else { 
                        tans = ["Uso correcto: " + Util.code("<comando> - (<número>)")]
                        success = false
                    }
                    console.log("e")
                    toRemoveId = Number(args[2])-1
                }
                if (success) {
                    console.log("f")
                    tans = []
                    let c = Data.cards[main][toRemoveId]
                    let cancel = false
                    console.log("g")
                    if (c.owner === ogId) {
                        console.log("h")
                        tans = ["Fuiste compensado $" + c.value]
                        Data.users[ogId].modifyData("bal", c.value)
                        Data.users[ogId].removeCard(c)
                        console.log("i")
                    } else if (c.owner !== "") {
                        console.log("j")
                        tans = ["Esta carta le pertenece a " + Data.users[c.owner].defaultName + ", escribí" + Util.code("confirm") + " y se le compensará su valor"]
                        cancel = true
                        console.log("k")
                    }
                    if (!cancel) {
                        console.log(main)
                        Data.cards[main].splice(toRemoveId, 1)
                        console.log("here")
                        Card.updatePackIndexes(main)
                        console.log("here?")
                        User.updateDueToDeletion(main, toRemoveId)
                        console.log("there!")
                        tans.unshift("Opción " + (toRemoveId+1) + " del comando " + Util.code(main) + " removida")
                        console.log("m")
                    }
                }
                break

            default:
                let response = Card.validate(main, args[1])
                if (response.success) {
                    tans = [response.card?.content!]
                } else {
                    tans = [response.message!]
                }
        }
    } else {
        tans = [Util.selectRandom(arr).content]
    }
    return tans
}