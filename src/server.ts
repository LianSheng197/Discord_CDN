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
app.use(express.urlencoded({
    extended: true
}));

app.get('/data', (req, res) => {
    let visitCounter: number = getVisit();
    let convertCounter: number = getConvert();
    let redirectCounter: number = getRedirect();

    return res.send({
        visit: visitCounter,
        generate: convertCounter,
        redirect: redirectCounter
    });
});

app.post('/api/link', async (req, res) => {
    if (discord == null) {
        return res.status(500).send("Server error.");
    }

    if (req.body.url === undefined) {
        return res.send("Required parameters");
    }

    const fullLink = await discord.fetchLatestLink(req.body.url);
    return res.send(fullLink);
});

app.get('/:url(*)', async (req, res) => {
    if (discord == null) {
        return res.status(500).send("Server error.");
    }

    const encodedUrl = req.params.url;
    const decodedUrl = decodeURIComponent(encodedUrl);

    if (decodedUrl != "favicon.ico") {
        addVisit();
    }

    if (!decodedUrl.includes("attachments")) {
        return res.sendFile(path.join(__dirname, "index.html"));
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