import { Pool } from "pg"

export default class Database {

    static async file(mode: string, pool: Pool) {
        let stringy: string = JSON.stringify(global.data)
        const database = await pool.connect()

        if (mode === "r") {
            let response = await database.query("SELECT value FROM data;")
            database.release()
            global.data = response["rows"][0]["value"]
            console.log("Data loaded")
        } else if (mode === "w") {
            await database.query(`UPDATE data SET value = '${stringy}'`)
            database.release()
            console.log("Data saved")
        }
    }

}