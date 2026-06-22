import { Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import * as ExpoSymbols from 'expo-symbols';

// Color mapping definition
const mapColor = (c: any): any => {
  if (typeof c !== 'string') return c;
  const lower = c.toLowerCase().trim();
  if (lower === '#051c2c' || lower === '#07151c' || lower === '#03161a' || lower === '#000000' || lower === '#000' || lower === 'black') return '#03161A';
  if (lower === '#b5f639' || lower === '#bee757' || lower === '#adff2f' || lower === '#baeb51') return '#BAEB51';
  if (lower === '#2e9f64' || lower === '#2e8b57' || lower === '#2b9463') return '#2B9463';
  if (lower === '#e63946' || lower === '#e30613' || lower === '#ba4a5a' || lower === '#d9534f' || lower === '#ba4b4b' || lower === '#ba4756') return '#BA4756';
  if (lower === '#666666' || lower === '#8a8a8a' || lower === '#666' || lower === '#888' || lower === '#717171') return '#717171';
  if (lower === '#e5e5e5') return '#D8DCE0';
  return c;
};

// Helper to resolve custom styles (fonts & colors)
const resolveCustomStyle = (style: any): any => {
  if (!style) return style;

  if (Array.isArray(style)) {
    return style.map(resolveCustomStyle).filter(s => s !== null && s !== undefined);
  }

  const flattened = { ...StyleSheet.flatten(style) };
  if (!flattened) return style;

  // Force bold / 700 / 800 to be 800
  let targetFontWeight = flattened.fontWeight;
  if (targetFontWeight === 'bold' || targetFontWeight === '700' || targetFontWeight === 700 || targetFontWeight === '800' || targetFontWeight === 800) {
    targetFontWeight = '800';
    flattened.fontWeight = '800';
  }

  // Determine if this text element behaves like a Title/Header/Button or Body text
  let fontFamily = flattened.fontFamily;
  if (fontFamily) {
    const familyLower = fontFamily.toLowerCase();
    if (familyLower.includes('nunito')) {
      if (familyLower.includes('bold') || targetFontWeight === '800') fontFamily = 'NunitoSans-Bold';
      else if (familyLower.includes('semi')) fontFamily = 'NunitoSans-SemiBold';
      else fontFamily = 'NunitoSans-Regular';
    } else if (familyLower.includes('urbanist')) {
      if (familyLower.includes('light') || targetFontWeight === '300' || targetFontWeight === '200') fontFamily = 'Urbanist-Light';
      else if (familyLower.includes('extra') || targetFontWeight === '800') fontFamily = 'Urbanist-ExtraBold';
      else if (familyLower.includes('semi')) fontFamily = 'Urbanist-SemiBold';
      else if (familyLower.includes('medium')) fontFamily = 'Urbanist-Medium';
      else fontFamily = 'Urbanist-Regular';
    } else if (familyLower.includes('parkinsans') || familyLower.includes('logo')) {
      if (familyLower.includes('extra') || familyLower.includes('bold') || targetFontWeight === '800') fontFamily = 'Parkinsans-ExtraBold';
      else fontFamily = 'Parkinsans-Bold';
    }
  } else {
    const fontSize = flattened.fontSize || 14;
    const fontWeight = String(targetFontWeight || '400');
    
    const isTitleOrButton = 
      fontSize >= 16 || 
      fontWeight === 'bold' || 
      fontWeight === '700' || 
      fontWeight === '800' || 
      fontWeight === '900' || 
      fontWeight === '600' || 
      fontWeight === '500';

    fontFamily = isTitleOrButton ? 'Urbanist-Regular' : 'NunitoSans-Regular';

    if (isTitleOrButton) {
      if (fontWeight === '800' || fontWeight === '900') {
        fontFamily = 'Urbanist-ExtraBold';
      } else if (fontWeight === '700' || fontWeight === 'bold') {
        fontFamily = 'Urbanist-ExtraBold';
      } else if (fontWeight === '600') {
        fontFamily = 'Urbanist-SemiBold';
      } else if (fontWeight === '500') {
        fontFamily = 'Urbanist-Medium';
      } else if (fontWeight === '300' || fontWeight === '200') {
        fontFamily = 'Urbanist-Light';
      } else {
        fontFamily = 'Urbanist-Regular';
      }
    } else {
      if (fontWeight === '700' || fontWeight === 'bold' || fontWeight === '800') {
        fontFamily = 'NunitoSans-Bold';
      } else if (fontWeight === '600' || fontWeight === '500') {
        fontFamily = 'NunitoSans-SemiBold';
      } else {
        fontFamily = 'NunitoSans-Regular';
      }
    }
  }

  // Map colors
  let color = flattened.color;
  let backgroundColor = flattened.backgroundColor;
  let borderColor = flattened.borderColor;
  let textDecorationColor = flattened.textDecorationColor;

  if (color !== undefined) color = mapColor(color);
  if (backgroundColor !== undefined) backgroundColor = mapColor(backgroundColor);
  if (borderColor !== undefined) borderColor = mapColor(borderColor);
  if (textDecorationColor !== undefined) textDecorationColor = mapColor(textDecorationColor);

  return {
    ...flattened,
    fontFamily,
    ...(color !== undefined ? { color } : {}),
    ...(backgroundColor !== undefined ? { backgroundColor } : {}),
    ...(borderColor !== undefined ? { borderColor } : {}),
    ...(textDecorationColor !== undefined ? { textDecorationColor } : {}),
  };
};

// Deep map function for styles inside StyleSheet.create
const mapStyleObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapped: any = {};
  for (const key of Object.keys(obj)) {
    let val = obj[key];
    if (val && typeof val === 'object') {
      mapped[key] = mapStyleObject(val);
    } else {
      // Map colors
      if (
        key === 'color' || 
        key === 'backgroundColor' || 
        key === 'borderColor' || 
        key === 'shadowColor' || 
        key === 'textDecorationColor' ||
        key === 'borderBottomColor' ||
        key === 'borderTopColor' ||
        key === 'borderLeftColor' ||
        key === 'borderRightColor'
      ) {
        val = mapColor(val);
      }
      mapped[key] = val;
    }
  }
  
  // Inject or map fonts dynamically
  if (mapped.fontSize !== undefined || mapped.fontWeight !== undefined || mapped.fontStyle !== undefined || mapped.fontFamily !== undefined) {
    // Force bold / 700 / 800 to be 800
    let targetFontWeight = mapped.fontWeight;
    if (targetFontWeight === 'bold' || targetFontWeight === '700' || targetFontWeight === 700 || targetFontWeight === '800' || targetFontWeight === 800) {
      targetFontWeight = '800';
      mapped.fontWeight = '800';
    }

    let fontFamily = mapped.fontFamily;
    if (fontFamily) {
      const familyLower = fontFamily.toLowerCase();
      if (familyLower.includes('nunito')) {
        if (familyLower.includes('bold') || targetFontWeight === '800') fontFamily = 'NunitoSans-Bold';
        else if (familyLower.includes('semi')) fontFamily = 'NunitoSans-SemiBold';
        else fontFamily = 'NunitoSans-Regular';
      } else if (familyLower.includes('urbanist')) {
        if (familyLower.includes('light') || targetFontWeight === '300' || targetFontWeight === '200') fontFamily = 'Urbanist-Light';
        else if (familyLower.includes('extra') || familyLower.includes('bold') || targetFontWeight === '800') fontFamily = 'Urbanist-ExtraBold';
        else if (familyLower.includes('semi')) fontFamily = 'Urbanist-SemiBold';
        else if (familyLower.includes('medium')) fontFamily = 'Urbanist-Medium';
        else fontFamily = 'Urbanist-Regular';
      } else if (familyLower.includes('parkinsans') || familyLower.includes('logo')) {
        if (familyLower.includes('extra') || familyLower.includes('bold') || targetFontWeight === '800') fontFamily = 'Parkinsans-ExtraBold';
        else fontFamily = 'Parkinsans-Bold';
      }
      mapped.fontFamily = fontFamily;
    } else {
      const fontSize = mapped.fontSize || 14;
      const fontWeight = String(targetFontWeight || '400');
      const isTitleOrButton = 
        fontSize >= 16 || 
        fontWeight === 'bold' || 
        fontWeight === '700' || 
        fontWeight === '800' || 
        fontWeight === '900' || 
        fontWeight === '600' || 
        fontWeight === '500';

      let resolvedFont = isTitleOrButton ? 'Urbanist-Regular' : 'NunitoSans-Regular';
      if (isTitleOrButton) {
        if (fontWeight === '800' || fontWeight === '900') {
          resolvedFont = 'Urbanist-ExtraBold';
        } else if (fontWeight === '700' || fontWeight === 'bold') {
          resolvedFont = 'Urbanist-ExtraBold';
        } else if (fontWeight === '600') {
          resolvedFont = 'Urbanist-SemiBold';
        } else if (fontWeight === '500') {
          resolvedFont = 'Urbanist-Medium';
        } else if (fontWeight === '300' || fontWeight === '200') {
          resolvedFont = 'Urbanist-Light';
        }
      } else {
        if (fontWeight === '700' || fontWeight === 'bold' || fontWeight === '800') {
          resolvedFont = 'NunitoSans-Bold';
        } else if (fontWeight === '600' || fontWeight === '500') {
          resolvedFont = 'NunitoSans-SemiBold';
        }
      }
      mapped.fontFamily = resolvedFont;
    }
  }

  return mapped;
};

// Safe patching
try {
  const originalCreate = StyleSheet.create;
  // @ts-ignore
  StyleSheet.create = function (styles: any) {
    const mappedStyles = mapStyleObject(styles);
    return originalCreate.call(this, mappedStyles);
  };
  console.log('[ThemeHelper] Patched StyleSheet.create successfully');
} catch (e) {
  console.warn('[ThemeHelper] Failed to patch StyleSheet.create:', e);
}

try {
  const textAny = Text as any;
  const originalTextRender = textAny.render;
  if (originalTextRender) {
    textAny.render = function (props: any, ref: any) {
      const resolvedStyle = resolveCustomStyle(props.style);
      return originalTextRender.call(this, { ...props, style: resolvedStyle }, ref);
    };
    console.log('[ThemeHelper] Patched Text.render successfully');
  }
} catch (e) {
  console.warn('[ThemeHelper] Failed to patch Text:', e);
}

try {
  const textInputAny = TextInput as any;
  const originalTextInputRender = textInputAny.render;
  if (originalTextInputRender) {
    textInputAny.render = function (props: any, ref: any) {
      const resolvedStyle = resolveCustomStyle(props.style);
      return originalTextInputRender.call(this, { ...props, style: resolvedStyle }, ref);
    };
    console.log('[ThemeHelper] Patched TextInput.render successfully');
  }
} catch (e) {
  console.warn('[ThemeHelper] Failed to patch TextInput:', e);
}

try {
  const activityIndicatorAny = ActivityIndicator as any;
  const originalIndicatorRender = activityIndicatorAny.render;
  if (originalIndicatorRender) {
    activityIndicatorAny.render = function (props: any, ref: any) {
      let color = props.color;
      if (color) color = mapColor(color);
      return originalIndicatorRender.call(this, { ...props, color }, ref);
    };
    console.log('[ThemeHelper] Patched ActivityIndicator.render successfully');
  }
} catch (e) {
  console.warn('[ThemeHelper] Failed to patch ActivityIndicator:', e);
}

try {
  if (ExpoSymbols && ExpoSymbols.SymbolView) {
    const symbolAny = ExpoSymbols.SymbolView as any;
    const originalSymbolRender = symbolAny.render;
    if (originalSymbolRender) {
      symbolAny.render = function (props: any, ref: any) {
        let tintColor = props.tintColor;
        if (tintColor) tintColor = mapColor(tintColor);
        return originalSymbolRender.call(this, { ...props, tintColor }, ref);
      };
      console.log('[ThemeHelper] Patched SymbolView.render successfully');
    }
  }
} catch (e) {
  console.warn('[ThemeHelper] Failed to patch SymbolView:', e);
}

export { resolveCustomStyle, mapColor };
