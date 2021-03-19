import Discord from "discord.js"
import { Pool } from "pg"

const pool = new Pool()
const client = new Discord.Client()

console.log("Hi")