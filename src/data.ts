import { Message, MessageEmbed } from "discord.js"
import Card from "./card"
import User from "./user"

interface data { 
    users: {[key: string]: User}
    cards: {[key: string]: Array<Card>}
    config: {
        prefix: string
        autosaveFrequency: number
        maxRollCacheIndex: number
        maxTimeToInteract: number
        [key: string]: Object
        economy: {
            hoursToClaim: number
            minimumOfferIncrease: number
            sellMultiplier: number
            reactorBaseRewardMultiplier: number
            reactorNonOwnerMultiplier: number
            passiveIncomeMultiplier: number /* Multiplies card value */
            completePackPassiveIncomeMultiplier: number
            startingMoney: number
            rates: { // Per hour - /3600000ms
                [key: string]: number
                reacts: number
                rolls: number
                invs: number
                buys: number
            }
            max: {
                [key: string]: number
                reacts: number
                rolls: number
                invs: number
                buys: number
            }
        }
        card: {
            baseValue: number
            baseRarity: number
            gifRarityMultiplier: number
        }
    }
    storage: {
        topCardValue: number
        auctions: Array<{
            card: {
                pack: string
                id: number
            },
            offerValue: number
            offeredBy: string
            offeredAt: number
        }>
        auctionsLog: Array<{
            card: {
                pack: string
                id: number
            },
            exOwner: string
            offerValue: number
            offeredBy: string
            offeredAt: number
        }>
    }
    cache: {
        packInWebsite: string
        waitingForConfirm: boolean
        thereWasChange: boolean
        rollCache: Array<{
            card: Card
            timeRolled: number
            reactedBy: Array<User>
            message: Message
        }>
        rollCacheIndex: number
    }
}

let Data: data = {
    users: {},
    cards: {},
    config: {
        prefix: "-",
        autosaveFrequency: 2, // minutes
        maxRollCacheIndex: 5,
        maxTimeToInteract: 1, // hours
        economy: {
            hoursToClaim: 48, // auction
            minimumOfferIncrease: 50, // auction
            sellMultiplier: 0.5,
            reactorBaseRewardMultiplier: 0.1,
            reactorNonOwnerMultiplier: 0.65,
            passiveIncomeMultiplier: 0.002,
            completePackPassiveIncomeMultiplier: 0.2,
            startingMoney: 500,
            rates: { // per hour
                reacts: 2,
                rolls: 5,
                invs: 0.085,
                buys: 1,
            },
            max: {
                reacts: 10,
                rolls: 20,
                invs: 3,
                buys: 5,
            }
        },
        card: {
            baseValue: 100,
            baseRarity: 10,
            gifRarityMultiplier: 2,
        }
    },
    storage: {
        topCardValue: 0,
        auctions: [],
        auctionsLog: [],
    },
    cache: {
        packInWebsite: "zuko",
        waitingForConfirm: false,
        thereWasChange: false,
        rollCache: [],
        rollCacheIndex: 0,
    }
}

export default Data

