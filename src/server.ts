import express from "express"
import Data from "./data"
import User from "./user"
import Card from "./card"
import cors from "cors"
import bpars from "body-parser"
import path from "path"
import Database from "./database"

const server = express();
server.all('/', (req, res)=>{
    res.send(listPacks())
})

server.use(bpars.text({limit: '50mb'}))
server.use(cors())
server.use(bpars.urlencoded({
    limit: '50mb',
    extended: true
}));

export default function keepAlive(){
    console.log("Opening server...")
    server.listen(3000, ()=>{console.log("Server online!")});
}

for (const pack in Data.cards) {
    server.all("/" + pack, (req, res) => {
        res.send(displayPackInfo(pack))
    })
}

server.all("/editor", (req, res, next) => {
    res.sendFile("editor.html", {root: "./js/" })
})

server.get("/json", (req, res, next) => {
    let vc = Data.storage.voiceChannel
    let vc2 = Data.cache.vconnection
    let vc3 = Data.cache.dispatcher
    delete Data.storage["voiceChannel"]
    delete Data.cache["vconnection"]
    delete Data.cache["dispatcher"]
    let toSave = JSON.parse(JSON.stringify(Data))
    delete toSave["cache"] // Don't save cache
    let stringy: string = JSON.stringify(toSave)
    res.send(stringy)
    Data.storage.voiceChannel = vc
    Data.cache.vconnection = vc2
    Data.cache.dispatcher = vc3
})

server.post("/json", (req, res, next) => {
    console.log("Received POST request")
    let resp = JSON.parse(req.body)

    Database.createBackup()

    Data.users = resp.users
    Data.config = resp.config
    Data.cards = resp.cards
    Data.storage = resp.storage
    Data.cache.needToReloadChannel = true

    Card.populate()
    User.populate()

    console.log("Saved data from web editor")

    res.sendStatus(200)
    
})

server.all("/:pack", (req, res, next) => {
    let pack = req.params.pack
    if (pack in Data.cards) {
        res.send(displayPackInfo(pack))
    }
})



function displayPackInfo(pack: string) {
    let ans = "<a href='../'> Menú </a> <br> <br> <br>"
    let arr = Data.cards[pack]
    for (const ci of arr) {
        let c = JSON.parse(JSON.stringify(ci))
        Object.setPrototypeOf(c, Card.prototype)
        let cont = c.content
        delete c.content
        delete c.isCard
        delete c.id
        delete c.type
        ans += `<strong>${c.getName()}</strong> ${JSON.stringify(c)} <br> <a href="${cont}"> <img height=300 src="${cont}"> </a> <br> <br>`
    }
    return ans
}

function listPacks() {
    let ans = `<a href='/editor'> Editor de datos </a> <br> <br> <br>`
    for (const pack in Data.cards) {
        ans += `<a href='/${pack}'> ${pack} </a> <br>`
    }
    return ans
}

server.use(express.static("js"))