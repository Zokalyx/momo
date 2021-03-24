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
const bent = require('bent');
const getJSON = bent('json');
class Requests {
    static getTenorGif(string) {
        return __awaiter(this, void 0, void 0, function* () {
            let splitString = string.split("-");
            let id = splitString[splitString.length - 1];
            let url = "https://api.tenor.com/v1/gifs?ids=" + id + "&key=" + process.env.TENOR_KEY;
            return { success: true, link: (yield getJSON(url))["results"][0]["media"][0]["gif"]["url"] };
        });
    }
}
exports.default = Requests;
;
