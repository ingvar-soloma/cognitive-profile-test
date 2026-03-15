import { APHANTASIA_CATEGORIES } from '../db/aphantasia_test.ts';

const args = process.argv.slice(2);
const langArg = args.find(arg => arg.startsWith('--lang='));
const lang = langArg ? langArg.split('=')[1] : 'en';

/**
 * Recursively traverses the object and replaces LocalizedString objects
 * with a single string for the target language.
 */
function localize(obj: any, language: string): any {
  if (Array.isArray(obj)) {
    return obj.map(item => localize(item, language));
  } else if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);
    
    // Check if it's a LocalizedString object (only contains known language keys)
    const knownLanguages = ['uk', 'en', 'ru'];
    const isLocalizedString = keys.length > 0 && keys.every(key => knownLanguages.includes(key));
    
    if (isLocalizedString) {
      // Return requested language, or fallback to English, or first available
      return obj[language] || obj['en'] || obj[keys[0]] || '';
    }
    
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = localize(obj[key], language);
    }
    return newObj;
  }
  return obj;
}

const localizedData = localize(APHANTASIA_CATEGORIES, lang);
process.stdout.write(JSON.stringify(localizedData, null, 2) + '\n');
