# Translate-Locales

Translate-Locales is a npm package that enables you to automatically translate keys in a locale input file into multiple languages using the GPT model from OpenAI.

## Installation

To install the Translate-Locales package, run the following command:

```bash
npm install -g translate-locales
```


## Usage

1. **Add OpenAI API Key**

   In order to use the GPT model for translation, you'll need an OpenAI API key. If you don't have one, you can sign up on the [OpenAI website](https://openai.com) to get an API key.

2. **Create Configuration File**

   After installing the package, create a `translate-locale.config.json` file in your project root folder. This configuration file should contain the following information:

   ```json
   {
       "openaiApiKey": "YOUR_OPENAI_API_KEY",
       "locales": ["en", "fr", "es"]
   }
   ```
   
   Replace YOUR_OPENAI_API_KEY with your actual OpenAI API key. The locales array should include the language codes to which you want to translate the keys.
   
## Run Translation

Once you've set up the configuration file, you can run the translation process using the following command:

```bash
npm run translate-locales
```

This command will initiate the translation of keys in the locale input file into the specified languages using the GPT model.


## License
This project is licensed under the MIT License.
   
