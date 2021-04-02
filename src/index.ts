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
        Database.autosave()

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
    Data.storage.autoRollChannel = await((await client.guilds.fetch("722283351792287826")).channels.cache.get("765251560179367976")?.fetch())!
    if (process.env.IN_DEV === "false") {
        // @ts-ignore
        Data.storage.autoRollChannel.send("✅ Bot en línea")
    }
    cron.schedule("0 * * * *", Main.autoRoll)
})

client.on("message", (msg) => {
    Main.cmdHandler(msg, client)
})
client.on("messageReactionAdd", Main.rctHandler)

