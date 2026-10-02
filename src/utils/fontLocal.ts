export interface LocalFontOptions {
  src: string | Array<{ path: string; weight?: string; style?: string }>;
  variable?: string;
  preload?: boolean;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface LocalFontResult {
  className: string;
  variable: string;
  style: {
    fontFamily: string;
  };
}

export function localFont(options: LocalFontOptions): LocalFontResult {
  const familyName = 'local-font-' + Math.random().toString(36).slice(2, 7);
  return {
    className: `font-${familyName}`,
    variable: options.variable || `--font-${familyName}`,
    style: {
      fontFamily: `'${familyName}', sans-serif`,
    },
  };
}

export default localFont;
