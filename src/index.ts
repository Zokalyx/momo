import Discord from "discord.js"
import dotenv from "dotenv"
import cron from "node-cron"
import Distube from "distube"
import ytdl from "ytdl-core-discord"
dotenv.config()
require("console-stamp")(console, "HH:MM:ss");

import keepAlive from "./server"
import Database from "./database"
import Data from "./data"
import Main from "./main"
import User from "./user"
import Card from "./card"

const client = new Discord.Client()
const distube = new Distube(client, { searchSongs: false, emitNewSongOnly: true, leaveOnFinish: true } )

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
    client.user!.setPresence({
        status: "online",
        activity: {
            name: "new",
            type: "LISTENING"
        }
    })
    await Database.loadChannel(client)
    if (process.env.IN_DEV === "false") {
        // @ts-ignore
        Data.storage.autoRollChannel.send("✅ Bot en línea")
    }
    cron.schedule("0 * * * *", () => Main.autoRoll(client))
    cron.schedule("0 * * * * *", () => {
        if (Data.cache.thereWasChange) {
            Database.file("w")
            Data.cache.thereWasChange = false
        }    
    })
})

client.on("message", (msg) => {
    Main.cmdHandler(msg, client, distube)
})
client.on("messageReactionAdd", Main.rctHandler)

