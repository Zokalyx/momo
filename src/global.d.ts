import Card from "./card"
import User from "./user"

declare global {
    namespace NodeJS {
        interface Global {
            data: {
                users: {[key: string]: User}
                cards: {[key: string]: Array<Card>}
                config: {
                    economy: {
                        startingMoney: number
                        rates: {
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
                }
            } | {}
        }
    }
}