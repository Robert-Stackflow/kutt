const { Router } = require("express");
const path = require("node:path");
const i18n = require("i18n");

const env = require("./env");

const localeMapping = {
  zh_CN: { code: "zh_CN", name: "🇨🇳 简体中文" },
  zh_TW: { code: "zh_TW", name: "🇨🇳 繁體中文" },
  en: { code: "en", name: "🇬🇧 English" },
  en_US: { code: "en_US", name: "🇺🇸 English (US)" },
  en_GB: { code: "en_GB", name: "🇬🇧 English (UK)" },
  fr: { code: "fr", name: "🇫🇷 Français" },
  fr_FR: { code: "fr_FR", name: "🇫🇷 Français (France)" },
  de: { code: "de", name: "🇩🇪 Deutsch" },
  de_DE: { code: "de_DE", name: "🇩🇪 Deutsch (Deutschland)" },
  es: { code: "es", name: "🇪🇸 Español" },
  es_ES: { code: "es_ES", name: "🇪🇸 Español (España)" },
  ja: { code: "ja", name: "🇯🇵 日本語" },
  ja_JP: { code: "ja_JP", name: "🇯🇵 日本語 (日本)" },
  ko: { code: "ko", name: "🇰🇷 한국어" },
  ko_KR: { code: "ko_KR", name: "🇰🇷 한국어 (대한민국)" },
  ru: { code: "ru", name: "🇷🇺 Русский" },
  ru_RU: { code: "ru_RU", name: "🇷🇺 Русский (Россия)" },
  it: { code: "it", name: "🇮🇹 Italiano" },
  it_IT: { code: "it_IT", name: "🇮🇹 Italiano (Italia)" },
  pt: { code: "pt", name: "🇵🇹 Português" },
  pt_BR: { code: "pt_BR", name: "🇵🇹 Português (Brasil)" },
  ar: { code: "ar", name: "🇸🇦 العربية" },
  ar_SA: { code: "ar_SA", name: "🇸🇦 العربية (السعودية)" },
  hi: { code: "hi", name: "🇮🇳 हिन्दी" },
  hi_IN: { code: "hi_IN", name: "🇮🇳 हिन्दी (भारत)" },
};

const router = new Router();

// configure locales and translations
const locales = env.LOCALES.split(",");
const defaultLocale = locales[0];
i18n.configure({
  locales,
  defaultLocale,
  directory: path.join(__dirname, "locales"),
  objectNotation: true,
});
router.use(i18n.init);

const localesList = i18n.getLocales().map(locale => localeMapping[locale]);

// handle translations
function i18nHandler(req, res, next) {
  const queryLang = req.query.lang;
  const cookieLang = req.cookies.lang;
  
  let locale = defaultLocale;
  
  if (queryLang) {
    // set local from query string if provided
    locale = i18n.getLocales().find(l => l === queryLang) || defaultLocale;
  } else if (!req.cookies.lang) {
    // set locale from browser's language
    const acceptLanguage = req.get("Accept-Language");
    if (acceptLanguage) {
      const headerLang = acceptLanguage.replace("-", "_");
      locale = i18n.getLocales().find(l => l === headerLang) || defaultLocale;
    }
  } else {
    // get locale from cookie
    locale = i18n.getLocales().find(l => l === cookieLang) || defaultLocale;
  }

  i18n.setLocale(locale);
  res.locals.currentLocale = locale;
  res.locals.formattedLocales = localesList;
  console.log(i18n.getLocales());

  if (!req.cookies.lang || req.cookies.lang !== locale) {
    res.cookie("lang", locale, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
  }
  
  next();
}

router.use(i18nHandler);

module.exports = router;