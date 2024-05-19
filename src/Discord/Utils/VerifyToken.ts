import ETokenIssue from "../Types/ETokenIssue";
import GetUTF8Base64 from "./GetUTF8Base64";

function staticVerifyToken(token: string): ETokenIssue {
    //Dot amount check
    let tokenSplitByDots = token.split(".");
    if (tokenSplitByDots.length != 3) return ETokenIssue.INVALID_AMOUNT_OF_DOTS;

    //Ensure the first part is a valid Base64 and UTF-8
    const decodedID = GetUTF8Base64(tokenSplitByDots[0]);
    if (!decodedID) return ETokenIssue.NON_BASE64_UTF8;


    //Ensure the ID is a number
    if (isNaN(Number(decodedID))) return ETokenIssue.ID_NOT_A_NUMBER;

    //Ensure the ID is 17 numbers or more
    if (decodedID.length < 17) return ETokenIssue.ID_TOO_SHORT;

    return ETokenIssue.NONE;
}


/**
 * Ensures the given Token is a valid Discord Token.
 * @param allToken Discord Token (allowed multiple, just split by comma `,`)
 * @param performStatic ( Optional, default True ) If set, token will be checked statically without any requests to Discord. 
 * @returns a Promise<string[]> (0 elements is possible)
 * @throws If trying to pass `performStatic` as false. Read the Todo.
 * @todo Implemented the non static check
 */
async function VerifyTokens(allToken: string, performStatic: boolean = true): Promise<string[]> {
    const tokens: string[] = allToken
        .trim()                                     // remove origin's whitespace
        .split(/,[\ \t]*/g)                         // remove each token's whitespace
        .filter(String)                             // remove empty string
        .filter((v, i, a) => a.indexOf(v) === i);   // remove duplicate

    const mask: string = "*".repeat(72 - 7 * 2);
    console.log(`
Found ${tokens.length} tokens.
${tokens.reduce((out, t, i) => out += `${i + 1} - ${t.replace(/(^.{7}).+(.{7}$)/, `$1${mask}$2`)}\n`, "")}
    `);

    let isValidTokens: string[] = [];
    Object.entries(tokens).forEach(([i, token]) => {
        if (performStatic) {
            const tokenIssue = staticVerifyToken(token);
            if (tokenIssue != ETokenIssue.NONE) {
                console.log(`[ERROR] VerifyToken(#${i}): ${tokenIssue}`)
            }

            isValidTokens.push(token);
        } else {
            throw new Error("Non Static check is not yet implemented.");
        }
    });

    return isValidTokens;
}

export default VerifyTokens;