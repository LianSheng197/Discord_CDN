import dotenv from "dotenv"
import IConfig from "./Types/IConfig";
import VerifyTokens from "./Discord/Utils/VerifyToken";
dotenv.config();


let cachedConfig: IConfig | null = null;

/**
 * Parses the .env file into a `IConfifg`
 * @returns A parsed `IConfig`
 * @throws If any  of the values in the .env file are incorrect.
 */
async function getConfig(): Promise<IConfig> {
    if (cachedConfig != null) return cachedConfig;

    //Required
    const { TOKEN, FALLBACK, PORT } = process.env;

    //Optionals
    let { bypassTokenChecks } = process.env;

    if (!bypassTokenChecks) {
        bypassTokenChecks = "NO";
    }

    if (!TOKEN) {
        throw new Error("`TOKEN` Field is missing from the .env file.");
    }

    if (!FALLBACK) {
        throw new Error("`FALLBACK` Field is missing from the .env file.")
    }

    if (!PORT) {
        throw new Error("`PORT` Field is missing from the .env file.");
    }


    const isValidTokens = await VerifyTokens(TOKEN);
    if (bypassTokenChecks.toUpperCase() != "YES" && isValidTokens.length == 0) {
        throw new Error("Invalid `TOKEN` was provided.");
    }
    
    if (FALLBACK.toUpperCase() != "YES" && FALLBACK.toUpperCase() != "NO") {
        throw new Error("`FALLBACK` Must be set to a `YES` or a `NO`.");
    }

    if (isNaN(Number(PORT))) {
        throw new Error("`PORT` Must be a valid integer.");
    }


    cachedConfig = {
        TOKENS: isValidTokens,
        FALLBACK: FALLBACK.toUpperCase() == "YES",
        PORT: Number(PORT),

        bypassTokenChecks: bypassTokenChecks.toUpperCase() == "YES"
    }

    return cachedConfig;
}

export default getConfig;