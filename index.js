const fs = require('fs')
const OpenAI = require('openai')

class TranslateLocale {
    constructor(config) {
        this.languages = config.languages;
        this.localePath = config.localePath;
        this.localeKeyFile = config.localeKeyFile;
        this.delayTime = config.delayTime;
        this.aiModel = config.aiModel;
        this.openai = new OpenAI({
            apiKey: config.openAiKey
        })

    }

    sleep(ms) {
        console.log(`sleep ${this.delayTime} millisecond`)
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async translateText(input, targetLang) {
        console.log('Start translating into ' + targetLang + ':', input)
        const prompt = `Translate original_text into ${targetLang}, grammatically correct, never break words. Remove quotation marks at the beginning and end of the response, return only translated text, do not include original_text.\noriginal_text: "${input}"`
        console.log('prompt:', prompt)
        const completion = await this.openai.chat.completions.create({
            messages: [{role: 'user', content: prompt}],
            model: this.aiModel
        })

        console.log('result:', completion.choices[0].message.content)

        // Add delay between each api call to avoid openai rate limit
        await this.sleep(this.delayTime);
        return completion.choices[0].message.content
    }

// to create a directory recursively if it doesn't exist
    createDirectoryIfNotExists(directoryPath) {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, {recursive: true});
            console.log(`Created directory: ${directoryPath}`);
        } else {
            console.log(`Directory already exists: ${directoryPath}`);
        }
    }

// to create or update language JSON files
    async processLanguage(language) {
        this.createDirectoryIfNotExists(this.localePath)
        const languageFilePath = `${this.localePath}/${language.code}.json` // Path to language JSON file
        const inputData = require(`${this.localeKeyFile}`)
        try {
            // Check if the language file exists
            if (fs.existsSync(languageFilePath)) {
                // Read the existing language JSON file
                let existingLanguageData = require(`${languageFilePath}`)

                console.log("existingLanguageData", existingLanguageData)
                // Update the existing language JSON with keys from input JSON
                existingLanguageData = await this.updateLanguageData(existingLanguageData, inputData, language.name)

                // Remove keys that don't exist in the input JSON
                this.removeExtraKeys(existingLanguageData, inputData)

                // Write the updated language JSON back to the file
                fs.writeFileSync(languageFilePath, JSON.stringify(existingLanguageData, null, 2))
            } else {
                // Create a new language JSON and copy keys from input JSON
                const newLanguageData = await this.createNewLanguageData(inputData, language.name)

                // Write the new language JSON to the file
                fs.writeFileSync(languageFilePath, JSON.stringify(newLanguageData, null, 2))
            }
        } catch (error) {
            console.error(`Error processing ${language.code}.json:`, error)
        }
    }

// to update language JSON with keys from input JSON
    async updateLanguageData(languageData, inputData, language) {
        for (const key in inputData) {
            if (typeof inputData[key] === 'object' && !Array.isArray(inputData[key])) {
                if (!languageData[key] || languageData[key] === "") {
                    languageData[key] = {}
                }

                languageData[key] = await this.updateLanguageData(languageData[key], inputData[key], language)
            } else {
                if (!languageData.hasOwnProperty(key) || languageData[key] === "") {
                    languageData[key] = await this.translateText(inputData[key], language) // Fill with translation value
                }
            }
        }

        return languageData
    }

// to create new language JSON with keys from input JSON
    async createNewLanguageData(inputData, language) {
        const newLanguageData = {}

        for (const key in inputData) {
            if (typeof inputData[key] === 'object' && !Array.isArray(inputData[key])) {
                newLanguageData[key] = await this.createNewLanguageData(inputData[key], language)
            } else {
                newLanguageData[key] = await this.translateText(inputData[key], language) // Fill with translation value
            }
        }

        return newLanguageData
    }

// to remove keys that don't exist in the input JSON
    removeExtraKeys(languageData, inputData) {
        for (const key in languageData) {
            if (!inputData.hasOwnProperty(key)) {
                delete languageData[key]
            } else if (typeof languageData[key] === 'object' && typeof inputData[key] === 'object') {
                this.removeExtraKeys(languageData[key], inputData[key])
            }
        }
    }

    translate() {
        fs.readFile(this.localeKeyFile, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading input JSON file:', err)
                return
            }

            try {
                const inputData = JSON.parse(data)

                // Process each language
                this.languages.forEach(async (lang) => {
                    await this.processLanguage(lang, inputData)
                })
            } catch (parseError) {
                console.error('Error parsing input JSON:', parseError)
            }
        })
    }
}

module.exports = TranslateLocale; // Export the class