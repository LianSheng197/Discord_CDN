console.clear();
import express from 'express';
import getConfig from './config';
import Discord from './Discord/Discord';
import favicon from 'serve-favicon';
import path from 'path';
import { setAutoSaveData, addVisit, addRedirect, getVisit, getConvert, getRedirect } from "./Discord/Utils/StoreJSON";

setAutoSaveData();

const app = express();
let discord: Discord | null;

app.use(favicon(path.join(__dirname, '..', 'assets', 'favicon.png')));

app.get('/:url(*)', async (req, res) => {
    let visitCounter: number = getVisit();
    let convertCounter: number = getConvert();
    let redirectCounter: number = getRedirect();
    
    if (discord == null) return res.status(500).send("Server error.");

    const encodedUrl = req.params.url;
    const decodedUrl = decodeURIComponent(encodedUrl);

    if (decodedUrl != "favicon.ico") {
        addVisit();
    }

    if (!decodedUrl.includes("attachments")) {
        return res.send(`<h1>Usage:</h1>
        <p><span>__HOST__</span>/https://cdn.discordapp.com/attachments/xxx/xxx/xxxxx.ext</p>
        <p>Visits: ${visitCounter}</p>
        <p>Generated: ${convertCounter}</p>
        <p>Redirected: ${redirectCounter}</p>
        <script>
                const span = document.querySelector("span");
                span.innerText = location.origin;
        </script>
        `);
    }

    try {
        const fullLink = await discord.fetchLatestLink(decodedUrl);
        addRedirect();
        res.redirect(fullLink);
    } catch (ex) {
        if (ex.message) {
            console.error(ex.message);
        }
        else {
            console.log(ex)
        }

        res.status(502).send("Something went wrong. Please ask the Server Owner to check the Console to see the issue.")
    }
});

app.get('*', async (req, res) => {
    res.statusCode = 404;
    return res.send();
});


async function initServer() {
    const config = await getConfig();
    discord = new Discord(config);

    app.listen(config.PORT, "0.0.0.0", () => {
        console.log(`Server can be accessed from http://localhost:${config.PORT}`);
    })
}

initServer();