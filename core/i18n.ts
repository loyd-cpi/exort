import { ContextHandler, Service } from './handler';
import { KeyValuePair, _ } from './misc';
import { Context } from './service';
import { Store } from './store';
import { Error } from './error';

/**
 * Retrieve lines from language files
 */
export function __(context: ContextHandler | Context, key: string, params?: KeyValuePair): string {
  if (context instanceof ContextHandler) {
    context = context.getContext();
  }

  let message = context.getLocale().getMessage(key);
  if (typeof message == 'string') {
    if (message && message.indexOf('${') != -1) {
      return _.template(message)(params || {});
    }
    return message;
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
export class Language {

  /**
   * Store object contains messages
   */
  private messages: Store;

  /**
   * Store object contains validation messages
   */
  private validation: Store;

  /**
   * Language constructor
   */
  constructor(protected readonly name: string, content: LanguageContent) {
    this.messages = new Store(content.messages);
    this.validation = new Store(content.validation);
  }

  /**
   * Get messages translation
   */
  public getMessage(key: string) {
    return this.messages.get(key);
  }

  /**
   * Get validation translation
   */
  public getValidation(key: string) {
    return this.validation.get(key);
  }

  /**
   * Get language name
   */
  public getName() {
    return this.name;
  }
}
