import express from "express"
import Data from "./data"
import Card from "./card"

const server = express();
server.all('/', (req, res)=>{
    res.send(displayPackInfo())
})
export default function keepAlive(){
    console.log("Opening server...")
    server.listen(3000, ()=>{console.log("Server online!")});
}

function displayPackInfo() {
    let ans = ""
    let arr = Data.cards[Data.cache.packInWebsite]
    for (const ci of arr) {
        let c = JSON.parse(JSON.stringify(ci))
        Object.setPrototypeOf(c, Card.prototype)
        let cont = c.content
        delete c.content
        delete c.isCard
        delete c.cardIndex
        delete c.type
        ans += `<strong>${c.getName()}</strong> ${JSON.stringify(c)} <br> <img height=300 src="${cont}"> <br> <br>`
    }
    return ans
}