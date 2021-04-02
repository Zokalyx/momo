"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let Data = {
    users: {},
    cards: {},
    config: {
        prefix: "-",
        autosaveFrequency: 2,
        maxRollCacheIndex: 5,
        maxTimeToInteract: 1,
        economy: {
            subsidio: 500,
            lastBuyTimeLimit: 24,
            hoursToClaim: 48,
            minimumOfferIncrease: 50,
            sellMultiplier: 0.5,
            reactorBaseRewardMultiplier: 0.1,
            reactorNonOwnerMultiplier: 0.65,
            passiveIncomeMultiplier: 0.002,
            completePackPassiveIncomeMultiplier: 0.2,
            startingMoney: 500,
            rates: {
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
        categories: {},
    },
    cache: {
        packInWebsite: "zuko",
        waitingForConfirm: false,
        thereWasChange: false,
        rollCache: [],
        rollCacheIndex: 0,
        waitingForBulk: {
            status: false,
            pack: "",
        }
    }
};
exports.default = Data;
