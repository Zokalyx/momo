import { Client, VoiceChannel } from "discord.js"
import { Pool } from "pg"
import Data from "./data"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

export default class Database {

    static async file(mode: "r" | "w") {
        const database = await pool.connect()

        if (mode === "r") {
            let response = await database.query("SELECT value FROM data;")
            database.release()
            console.log("Data loaded!")
            return response["rows"][0]["value"]

        } else if (mode === "w") {
            let vc = Data.storage.voiceChannel
            let vc2 = Data.cache.vconnection
            delete Data.storage["voiceChannel"]
            delete Data.cache["vconnection"]
            let toSave = JSON.parse(JSON.stringify(Data))
            delete toSave["cache"] // Don't save cache
            let stringy: string = JSON.stringify(toSave)
            await database.query(`UPDATE data SET value = '${stringy}'`)
            database.release()
            console.log("Data saved!")
            Data.storage.voiceChannel = vc
            Data.cache.vconnection = vc2
        }
    }

    static async autosave() {
        setInterval(() => {
            if (Data.cache.thereWasChange) {
                Data.cache.thereWasChange = false
                Database.file("w")
            }
        }, Data.config.autosaveFrequency*60*1000)
    }

    static async loadChannel(client: Client) {
        Data.storage.autoRollChannel = await((await client.guilds.fetch("722283351792287826")).channels.cache.get("765251560179367976")?.fetch())!
    }

    static async loadDefaultVoiceChannel(client: Client) {
        // @ts-ignore
        Data.storage.voiceChannel = await((await client.guilds.fetch("722283351792287826")).channels.cache.get("734284181777154050")!)!
    }

    static migrate() {
        console.log("Loading json...")
        let fs = require("fs")
        let read = JSON.parse(fs.readFileSync("C:\\Users\\White Python\\Desktop\\Momo\\backup.json", 'utf8'))
        Data.users = read.users
        Data.config = read.config
        Data.cards = read.cards
        Data.storage = read.storage
        Database.file("w")
    }

    static createBackup() {
        let fs = require("fs")
        let toSave = JSON.parse(JSON.stringify(Data))
        delete toSave["cache"] // Don't save cache
        let stringy: string = JSON.stringify(toSave)
        fs.writeFile('C:\\Users\\White Python\\Desktop\\Momo\\backup.json', stringy, (err: any) => {
            if (err) {
                console.error(err)
                return
            }
        })
        console.log("Creating a backup...")
    }

}