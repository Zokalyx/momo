import { hsv } from "color-convert"
import { RGB } from "color-name"
import { Client, TextChannel } from "discord.js"

export default class Util {
    
    static upperFirst(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    static valueToRgb(value: number): RGB { /* Value must be in the range [0, 1] */
        value = Math.pow(value, 0.3)
        return hsv.rgb([value*360, value*100, value*100])
    }

    static chunk(array: Array<any>, characterLimit: number): Array<Array<any>> {
        let ans = []
        let len = 0
        let maxInd = 0
        for (const c of array) {
            len += c.length
            if (len >= characterLimit) {
                break
            }
            maxInd++
        }
        if (maxInd === array.length) {
            ans = [array]
        } else {
            let first = array.slice(0, maxInd)
            let last = array.slice(maxInd)
            ans = [first, ...Util.chunk(last, characterLimit)]
        }
        return ans
    }

    static chunkAndSend(array: Array<string>, size: number, channel: TextChannel) { /* For read only data */
        for (const msgArr of Util.chunk(array, size)) {
            channel.send(msgArr.join("\n"))
        }
    }

    static truncateTo(value: number, decimals: number) {
        let powerOfTen = Math.pow(10, decimals)
        return Math.floor(value * powerOfTen)/powerOfTen
    }

    static title(string: string) {
        return `__**${string}**__`
    }

    static bold(string: string) {
        return `**${string}**`
    }

    static code(string: string) {
        return `\`${string}\``
    }

    static nice(string: "rolls" | "reacts" | "buys" | "invs", singular: boolean = false): string {
        switch (string) {
            case "rolls":
                return singular ? "roll" : "rolls"
            case "reacts":
                return singular ? "reacción" : "reacciones"
            case "invs":
                return singular ? "inversión" : "inversiones"
            case "buys":
                return singular ? "compra" : "compras"
        }
    }

    static async debug(args: Array<string>, Data: any, Card: any, User: any, channel: TextChannel, client: Client) {
        console.log(eval(args.join(" ")))
    }

    static selectRandom(array: Array<any>) {
        return array[Math.floor(Math.random()*array.length)]
    }
}