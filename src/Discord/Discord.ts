import IConfig from "../Types/IConfig";
import ELinkIssue from "./Types/ELinkIssue";
import IRefreshUrlsRes from "./Types/IRefreshUrlsRes";
import ParseLink from "./Utils/ParseLink";
import { getResult, getConvert, updateResult, addConvert } from "./Utils/StoreJSON";

import axios, { AxiosRequestConfig } from "axios"

class Discord {
    constructor(private config: IConfig) { };

    /**
     * Fetches the latest link for a given Discord download link
     * @param oldLink Discord Link in any of the supported formats
     * @returns An updated link which can be requested immediatelty
     * @throws If the given link fails to parse OR the Request to Discord fails.
     * @todo Fallback to V1 lookup if the HTTP request fails.
     */
    public async fetchLatestLink(oldLink: string, retry: number = 0): Promise<string> {
        const num = getConvert();

        if (!oldLink.includes("https://"))
            oldLink = `https://cdn.discordapp.com/${oldLink}`;
        const linkData = ParseLink(oldLink);
        if (linkData.error != ELinkIssue.NONE) {
            throw new Error(linkData.error);
        }

        const key = `${linkData.data.channelID}/${linkData.data.fileID}/${linkData.data.fileName}`;
        const dResult = getResult(key);

        // Discord's current policy is to set the past due date at 14 days after the request. 
        // Here the cache date is set to 7 days.
        if (dResult !== null && Date.now() - dResult.lastGenerateTime < 7 * 86400 * 1000) {
            return dResult.link;
        }

        try {
            const { data, status } = await axios.post("https://discord.com/api/v9/attachments/refresh-urls", {
                attachment_urls: [oldLink]
            }, this.getHTTPConfig(num));

            if (status === 429) {
                // wait 3 second and use same token.
                await new Promise(r => setTimeout(r, 3000));

                if (retry >= 3) {
                    throw new Error("Discord returned 429 several times, please try again later.");
                }

                return await this.fetchLatestLink(oldLink, retry + 1);
            }

            let response = data as IRefreshUrlsRes;
            if (!response || !response.refreshed_urls || response.refreshed_urls.length == 0) {
                console.log("response:", data);
                throw new Error("Unexpected Discord response.");
            }

            let updatedLink = response.refreshed_urls[0].refreshed;
            addConvert();
            updateResult(key, updatedLink);
            return updatedLink;
        } catch (ex) {
            console.log(ex)
        }

        return "";
    }

    private getHTTPConfig(num: number): AxiosRequestConfig {
        const token: string = this.config.TOKENS[num % this.config.TOKENS.length];
        return {
            headers: {
                "Authorization": token
            }
        }
    }
}

export default Discord;