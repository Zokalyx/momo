import Discord from "discord.js"
import dotenv from "dotenv"
dotenv.config()
require("console-stamp")(console, "HH:MM:ss");

import keepAlive from "./server"
import Database from "./database"
import Data from "./data"
import Main from "./main"
import User from "./user"
import Card from "./card";

keepAlive()

const client = new Discord.Client()

console.log("Retrieving data...")
Database.file("r")
    .then(val => { 
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

client.on("ready", () => {
    console.log("Connection to Discord established!")
    client.user!.setPresence({
        status: "online",
        activity: {
            name: "new",
            type: "LISTENING"
        }
    })
})

client.on("message", (msg) => {
    Main.cmdHandler(msg, client)
})
client.on("messageReactionAdd", Main.rctHandler)
