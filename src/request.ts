const bent = require('bent')
const getJSON = bent('json')
import cheerio from "cheerio" // web scraping (for images)

export default class Requests {

    static async getTenorGif(string: string) {
        let splitString = string.split("-")
        let id = splitString[splitString.length - 1]
        let url = "https://api.tenor.com/v1/gifs?ids=" + id + "&key=" + process.env.TENOR_KEY

        return {success: true, link: (await getJSON(url))["results"][0]["media"][0]["gif"]["url"]}
    }

};