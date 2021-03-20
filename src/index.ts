import Discord from "discord.js"
import { Pool } from "pg"
import Card from "./card"
import User from "./user"
import Database from "./database"

global.data = {}

const pool: Pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
Database.file("r", pool)

