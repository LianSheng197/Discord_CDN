import { IResult, IStore } from "../../Types/IStore";
import path from 'path';
import fs from 'fs';

const FileName: string = "savedata.json";
const FilePath: string = path.join(__dirname, "../../..", FileName);
const StorePeriod: number = 30;

let StoreData: IStore = readFile();

/**
 * Set auto save data from object to file.  
 * **Do NOT call this function more than once!!**
 */
export function setAutoSaveData() {
    function run() {
        saveFile();
        console.log(`[Store] File saved. (${new Date().toUTCString()})`)
    }

    run();
    setInterval(run, StorePeriod * 1000);
}

/**
 * Update single result to global object.
 * @param key Discord file id that format like `1234567890/1234567890/image.png`
 * @param link Generated links.
 */
export function updateResult(key: string, link: string) {
    // If url format is expected or what, anyway, DO NOT save this data.
    if(link === null) {
        return;
    }

    StoreData.data[key] = {
        lastGenerateTime: Date.now(),
        link: link
    };
}

/**
 * Get single result by key. If key is not found will be return `null`.
 * @param key Discord file id that format like `1234567890/1234567890/image.png`
 * @returns 
 */
export function getResult(key: string): IResult | null {
    if (StoreData.data[key] === undefined) {
        return null;
    }

    return StoreData.data[key];
}

export function addVisit() {
    StoreData.visitCounter++;
}

export function getVisit(): number {
    return StoreData.visitCounter;
}

export function addConvert() {
    StoreData.convertCounter++;
}

export function getConvert(): number {
    return StoreData.convertCounter;
}

export function addRedirect() {
    StoreData.redirectCounter++;   
}

export function getRedirect(): number {
    return StoreData.redirectCounter;
}

/**
 * Read store data object from file.
 */
function readFile(): IStore {
    if(!fs.existsSync(FilePath)) {
        return {
            data: {},
            convertCounter: 0,
            visitCounter: 0,
            redirectCounter: 0
        };
    } 

    return JSON.parse(fs.readFileSync(FilePath).toString());
}

/**
 * Save the store data object to file.
 */
function saveFile() {
    fs.writeFileSync(FilePath, JSON.stringify(StoreData, null, 2));
}
