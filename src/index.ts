import Discord from "discord.js"
import dotenv from "dotenv"
import cron from "node-cron"
dotenv.config()
require("console-stamp")(console, "HH:MM:ss");

import keepAlive from "./server"
import Database from "./database"
import Data from "./data"
import Main from "./main"
import User from "./user"
import Card from "./card"

const client = new Discord.Client()

console.log("Retrieving data...")
Database.file("r")
    .then(async val => {
        keepAlive()
        Object.assign(Data, val)
        //Database.autosave()

        console.log("Creating objects...")
        User.populate()
        Card.populate()
        console.log("Created objects!")

        console.log("Logging in to Discord...")
        client.login(process.env.DISCORD_TOKEN)
    })
    .catch(() => {
        console.log("Couldn't connect to database, shutting down...")
        process.exit()
    })

client.on("ready", async () => {
    console.log("Connection to Discord established!")
    /*client.user!.setPresence({
        status: "online",
        activity: {
            name: "new",
            type: "LISTENING"
        }
    })*/
    await Database.loadChannel(client)
    await Database.loadDefaultVoiceChannel(client)
    if (Data.storage.reconnect) {
        Data.cache.vconnection = await Data.storage.voiceChannel!.join()
        if (Data.storage.muted) {
            // @ts-ignore
            Data.cache.vconnection.voice?.setSelfMute(true)
        }
    }

    if (process.env.IN_DEV === "false") {
        // @ts-ignore
        Data.storage.autoRollChannel.send("✅ Bot en línea")
    }
    cron.schedule("0 * * * *", () => Main.autoRoll(client))
    cron.schedule("0 3,15 * * *", () => Main.autoInvest(client))
    cron.schedule("0 * * * * *", async () => {
        if (Data.cache.thereWasChange) {
            Database.file("w").catch(e => {
                // @ts-ignore
                Data.storage.autoRollChannel.send("❌ No se pudieron guardar los datos! Creando backup...\nLa próxima vez que se reinicie el bot se va a requerir una carga manual del backup <@284696251566391296>")
                Database.createBackup()
            })
            Data.cache.thereWasChange = false
        }    

        if (Data.cache.needToReloadVc) {
            Database.loadDefaultVoiceChannel(client)
            Data.cache.needToReloadVc = false

            if (Data.storage.reconnect && Data.cache.vconnection) {
                Data.cache.vconnection = await Data.storage.voiceChannel!.join()
            }
        }
    })
})

client.on("message", (msg) => {
    Main.cmdHandler(msg, client)
})
client.on("messageReactionAdd", Main.rctHandler)

