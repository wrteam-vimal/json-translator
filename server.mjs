import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import translate from 'translate';

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Set the translation engine
translate.engine = 'google'; // or 'yandex' for Yandex Translate, or others supported by 'translate' module

// Serve the index.html file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/translate', async (req, res) => {
    const { json, targetLanguage } = req.body;

    // Function to translate a text
    const translateText = async (text, targetLanguage) => {
        return await translate(text, targetLanguage);
    };

    // Recursive function to translate all values in the JSON
    const translateJson = async (obj, targetLanguage) => {
        const keys = Object.keys(obj);
        for (const key of keys) {
            if (typeof obj[key] === 'object') {
                await translateJson(obj[key], targetLanguage);
            } else if (typeof obj[key] === 'string') {
                obj[key] = await translateText(obj[key], targetLanguage);
            }
        }
        return obj;
    };

    try {
        const translatedJson = await translateJson(JSON.parse(JSON.stringify(json)), targetLanguage);
        res.json(translatedJson);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while translating the JSON.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
