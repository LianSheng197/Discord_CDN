export interface IResult {
    // timestamp (ms). Date.now()
    lastGenerateTime: number
    link: string
}

export interface IStore {
    data: {
        [key: string]: IResult
    }
    visitCounter: number,
    convertCounter: number,
    redirectCounter: number
}