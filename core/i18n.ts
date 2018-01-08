import { ContextHandler, Service } from './handler';
import { KeyValuePair, _ } from './misc';
import { Store } from './store';
import { Error } from './error';

/**
 * Retrieve lines from language files
 */
export function __(handler: ContextHandler, key: string, params?: KeyValuePair): string {
  let messages = handler.getContext().getLocale().get('messages');
  if (typeof messages[key] == 'string') {
    if (messages[key] && messages[key].indexOf('${') != -1) {
      return _.template(messages[key])(params || {});
    }
    return messages[key];
  }
  return '';
}

/**
 * I18nService class
 */
export class I18nService extends Service {

  /**
   * Compose and get language object from language folder
   */
  public getTranslations(locale: string): Language {
    let messages = _.require(`${this.app.dir}/lang/${locale}/messages`);
    if (messages) {
      messages = messages.default;
    } else {
      throw new Error(`Language '${locale}' doesn't have messages module`);
    }

    let validation = _.require(`${this.app.dir}/lang/${locale}/validation`);
    if (validation) {
      validation = validation.default;
    } else {
      throw new Error(`Language '${locale}' doesn't have validation module`);
    }

    return new Language(locale, { messages, validation });
  }
}

/**
 * LanguageContent interface
 */
export interface LanguageContent {
  messages: KeyValuePair<string>;
  validation: KeyValuePair;
}

/**
 * Language class
 */
export class Language extends Store {

  /**
   * Language constructor
   */
  constructor(protected readonly name: string, content: LanguageContent) {
    super(content);
  }

  /**
   * Get messages translations
   */
  public getMessages() {
    return this.get('messages');
  }

  /**
   * Get validation translations
   */
  public getValidation() {
    return this.get('validation');
  }

  /**
   * Get language name
   */
  public getName() {
    return this.name;
  }
}
