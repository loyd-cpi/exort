import { AppProvider } from './app';
/**
 * Install assets
 * @return {AppProvider}
 */
export declare function provideAssets(): AppProvider;
/**
 * Provide favicon
 * @param  {string} faviconPath
 * @return {AppProvider}
 */
export declare function provideFavicon(faviconPath: string): AppProvider;
