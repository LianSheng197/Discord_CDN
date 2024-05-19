import IConfig from "../Types/IConfig";
import ELinkIssue from "./Types/ELinkIssue";
import IRefreshUrlsRes from "./Types/IRefreshUrlsRes";
import ParseLink from "./Utils/ParseLink";
import VerifyTokens from "./Utils/VerifyToken";

import axios, { AxiosRequestConfig } from "axios"

class Discord {
    constructor(private config: IConfig) {};


    /**
     * Fetches the latest link for a given Discord download link
     * @param oldLink Discord Link in any of the supported formats
     * @param num Determine which token to use based on how many times it has been converted.
     * @returns An updated link which can be requested immediatelty
     * @throws If the given link fails to parse OR the Request to Discord fails.
     * @todo Fallback to V1 lookup if the HTTP request fails.
     */
    public async fetchLatestLink(oldLink: string, num: number): Promise<string> {
        if (!oldLink.includes("https://")) 
            oldLink = `https://cdn.discordapp.com/${oldLink}`;
        const linkData = ParseLink(oldLink);
        if (linkData.error != ELinkIssue.NONE) {
            throw new Error(linkData.error);
        }

        try {
            const { data } = await axios.post("https://discord.com/api/v9/attachments/refresh-urls", {
                attachment_urls: [oldLink]
            }, this.getHTTPConfig(num));

            let response = data as IRefreshUrlsRes;
            if (!response || !response.refreshed_urls || response.refreshed_urls.length == 0) {
                console.log("response:", data);
                throw new Error("Unexpected Discord response.");
            }

            let updatedLink = response.refreshed_urls[0].refreshed;
            return updatedLink;

        } catch (ex) {
            console.log(ex)
        }

        return "";
    }

    private getHTTPConfig(num: number): AxiosRequestConfig {
        const token: string = this.config.TOKENS[num % this.config.TOKENS.length];
        console.log(`Now using ${num} % ${this.config.TOKENS.length} => ${token}`)
        return {
            headers: {
                "Authorization": token
            }
        }
    }
}

export default Discord;