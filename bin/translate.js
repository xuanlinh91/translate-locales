#! /usr/bin/env node
const path = require('path');
const TranslateLocale = require('../index');

const configFilePath = path.join(process.cwd(), 'translate-locale.config.js');
let config = require(`${configFilePath}`)
config.localeKeyFile = path.resolve(process.cwd(), config.localeKeyFile);
config.localePath = path.resolve(process.cwd(), config.localePath);
const translateLocale = new TranslateLocale(config)
translateLocale.translate()