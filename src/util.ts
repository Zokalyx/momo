import { hsv } from "color-convert"
import { RGB } from "color-name"
import { TextChannel } from "discord.js"

export default class Util {
    
    static upperFirst(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    static valueToRgb(value: number): RGB { /* Value must be in the range [0, 1] */
        console.log(value)
        let hue: number = 360 * value - 50
        hue < 0 ? hue += 360 : {}
        let saturation: number = hue * 120
        return hsv.rgb([0, 0, 0])
    }

    static chunk(array: Array<any>, size: number): Array<Array<any>> {
        let ans = []
        if (array.length > size) {
            let first = array.slice(0, size)
            let last = array.slice(size)
            ans = [first, ...Util.chunk(last, size)]
        } else {
            ans = [array]
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

    static debug(args: Array<string>, Data: any, Card: any, User: any) {
        console.log(eval(args.join(" ")))
    }

    static selectRandom(array: Array<any>) {
        return array[Math.floor(Math.random()*array.length)]
    }
}