const fs = require('fs')
const OpenAI = require('openai')
const path = require('path');


const languages = [{ code: 'ja', name: 'japanese' }] // List of language codes
// const languages = [{ code: 'en', name: 'english' }, { code: 'ja', name: 'japanese' }, {
//     code: 'zh',
//     name: 'chinese (simplified)'
// }] // List of language codes

const localePath = '../locales'
const openAiKey = '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'
const keyFile = './input.json' // Path to input JSON file
const delayTime = 10000
const aiModel = 'gpt-3.5-turbo'
// TODO fix: why calling api when deleting key
// TODO fix: Turn into npm library, adding command, config file
// TODO Adding exception, document, rate limit, author

const openai = new OpenAI({
    apiKey: openAiKey
})

async function translateText(input, targetLang) {
    console.log('Start translating into ' + targetLang + ':', input)
    const prompt = `Translate original_text into ${targetLang}, grammatically correct, never break words. Remove quotation marks at the beginning and end of the response, return only translated text, do not include original_text.\noriginal_text: "${input}"`
    console.log('prompt:', prompt)
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: aiModel
    })

    console.log('result:', completion.choices[0].message.content)
    return completion.choices[0].message.content
}

// Function to create a directory recursively if it doesn't exist
function createDirectoryIfNotExists(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`Created directory: ${directoryPath}`);
    } else {
        console.log(`Directory already exists: ${directoryPath}`);
    }
}

// Function to create or update language JSON files
async function processLanguage(language) {
    createDirectoryIfNotExists(localePath)
    const languageFilePath = `${localePath}/${language.code}.json` // Path to language JSON file
    const inputData = require(`${keyFile}`)
    try {
        // Check if the language file exists
        if (fs.existsSync(languageFilePath)) {
            // Read the existing language JSON file
            let existingLanguageData = require(`./${languageFilePath}`)

            // Update the existing language JSON with keys from input JSON
            existingLanguageData = await updateLanguageData(existingLanguageData, inputData, language.name)

            // Remove keys that don't exist in the input JSON
            removeExtraKeys(existingLanguageData, inputData)

            // Write the updated language JSON back to the file
            fs.writeFileSync(languageFilePath, JSON.stringify(existingLanguageData, null, 2))
        } else {
            // Create a new language JSON and copy keys from input JSON
            const newLanguageData = await createNewLanguageData(inputData, language.name)

            // Write the new language JSON to the file
            fs.writeFileSync(languageFilePath, JSON.stringify(newLanguageData, null, 2))
        }
    } catch (error) {
        console.error(`Error processing ${language.code}.json:`, error)
    }
}

// Function to update language JSON with keys from input JSON
async function updateLanguageData(languageData, inputData, language) {
    for (const key in inputData) {
        if (typeof inputData[key] === 'object' && !Array.isArray(inputData[key])) {
            languageData[key] = {}
            languageData[key] = await updateLanguageData(languageData[key], inputData[key], language)
        } else {
            if (!languageData.hasOwnProperty(key)) {
                languageData[key] = await translateText(key, language) // Fill with translation value
            }
        }
    }

    return languageData
}

// Function to create new language JSON with keys from input JSON
async function createNewLanguageData(inputData, language) {
    const newLanguageData = {}

    for (const key in inputData) {
        if (typeof inputData[key] === 'object' && !Array.isArray(inputData[key])) {
            newLanguageData[key] = await createNewLanguageData(inputData[key], language)
        } else {
            newLanguageData[key] = await translateText(key, language) // Fill with translation value
        }
    }

    return newLanguageData
}

// Function to remove keys that don't exist in the input JSON
function removeExtraKeys(languageData, inputData) {
    for (const key in languageData) {
        if (!inputData.hasOwnProperty(key)) {
            delete languageData[key]
        } else if (typeof languageData[key] === 'object' && typeof inputData[key] === 'object') {
            removeExtraKeys(languageData[key], inputData[key])
        }
    }
}

// Read the input JSON
function main() {
    fs.readFile(keyFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading input JSON file:', err)
            return
        }

        try {
            const inputData = JSON.parse(data)

            // Process each language
            languages.forEach(async (lang) => {
                await processLanguage(lang, inputData)
            })
        } catch (parseError) {
            console.error('Error parsing input JSON:', parseError)
        }
    })
}

main()