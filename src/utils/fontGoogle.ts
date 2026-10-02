export interface FontOptions {
  weight?: string | string[];
  subsets?: string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  variable?: string;
  preload?: boolean;
  fallback?: string[];
  adjustFontFallback?: boolean;
}

export interface FontResult {
  className: string;
  variable: string;
  style: {
    fontFamily: string;
    fontWeight?: string;
  };
}

function createGoogleFont(fontName: string, defaultWeight = '400'): (options?: FontOptions) => FontResult {
  return function (options: FontOptions = {}): FontResult {
    const variableName = options.variable || `--font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
    const weight = Array.isArray(options.weight) ? options.weight[0] : options.weight || defaultWeight;

    if (options.preload !== false && typeof document !== 'undefined') {
      const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${weight}&display=${options.display || 'swap'}`;
      if (!document.querySelector(`link[href*="${fontName}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    }

    return {
      className: `font-${fontName.toLowerCase().replace(/\s+/g, '-')}`,
      variable: variableName,
      style: {
        fontFamily: `'${fontName}', sans-serif`,
        fontWeight: weight,
      },
    };
  };
}

export const Anton = createGoogleFont('Anton', '400');
export const Outfit = createGoogleFont('Outfit', '400');
export const Lilita_One = createGoogleFont('Lilita One', '400');
export const Bebas_Neue = createGoogleFont('Bebas Neue', '400');
export const DM_Sans = createGoogleFont('DM Sans', '500');

export const anton = Anton({ subsets: ['latin'], weight: '400', display: 'swap', preload: true });
export const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', preload: true });
