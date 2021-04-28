"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    static chunk(array, characterLimit) {
        let ans = [];
        let len = 0;
        let maxInd = 0;
        for (const c of array) {
            len += c.length;
            if (len >= characterLimit) {
                break;
            }
            maxInd++;
        }
        if (maxInd === array.length) {
            ans = [array];
        }
        else {
            let first = array.slice(0, maxInd);
            let last = array.slice(maxInd);
            ans = [first, ...Util.chunk(last, characterLimit)];
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
    static debug(args, Data, Card, User, channel, client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(eval(args.join(" ")));
        });
    }
    static selectRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
exports.default = Util;
