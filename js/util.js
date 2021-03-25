"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_convert_1 = require("color-convert");
class Util {
    static upperFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    static valueToRgb(value) {
        value = Math.pow(value, 0.3);
        return color_convert_1.hsv.rgb([value * 360, value * 100, value * 100]);
    }
    static chunk(array, size) {
        let ans = [];
        if (array.length > size) {
            let first = array.slice(0, size);
            let last = array.slice(size);
            ans = [first, ...Util.chunk(last, size)];
        }
        else {
            ans = [array];
        }
        return ans;
    }
    static chunkAndSend(array, size, channel) {
        for (const msgArr of Util.chunk(array, size)) {
            channel.send(msgArr.join("\n"));
        }
    }
    static truncateTo(value, decimals) {
        let powerOfTen = Math.pow(10, decimals);
        return Math.floor(value * powerOfTen) / powerOfTen;
    }
    static title(string) {
        return `__**${string}**__`;
    }
    static bold(string) {
        return `**${string}**`;
    }
    static code(string) {
        return `\`${string}\``;
    }
    static nice(string, singular = false) {
        switch (string) {
            case "rolls":
                return singular ? "roll" : "rolls";
            case "reacts":
                return singular ? "reacción" : "reacciones";
            case "invs":
                return singular ? "inversión" : "inversiones";
            case "buys":
                return singular ? "compra" : "compras";
        }
    }
    static debug(args, Data, Card, User) {
        console.log(eval(args.join(" ")));
    }
    static selectRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
exports.default = Util;
