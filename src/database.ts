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
            let toSave = JSON.parse(JSON.stringify(Data))
            delete toSave["cache"] // Don't save cache
            let stringy: string = JSON.stringify(toSave)
            await database.query(`UPDATE data SET value = '${stringy}'`)
            database.release()
            console.log("Data saved!")
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

    static migrate() {
        let fs = require("fs")
        Data.users = JSON.parse(fs.readFileSync("C:\\Users\\White Python\\Desktop\\Momo\\src\\users.json", 'utf8'))
        Data.cards = JSON.parse(fs.readFileSync("C:\\Users\\White Python\\Desktop\\Momo\\src\\cards.json", 'utf8'))
    }
}