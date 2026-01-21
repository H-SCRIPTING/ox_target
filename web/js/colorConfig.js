/**
 * Color Configuration Loader
 * Loads colors from config.json and applies them to the UI
 */

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color (#RRGGBB)
 * @returns {Object} RGB values {r, g, b}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Apply colors to CSS variables and SVG filters
 * @param {Object} colors - Color configuration
 */
export function applyColors(colors) {
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-glow', colors.primaryGlow);
  root.style.setProperty('--color-hover', colors.hover);
  root.style.setProperty('--color-bg-dark', colors.background);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  
  // Update SVG hexagon colors
  const hexShape = document.getElementById('hexShape');
  const innerHexPolygons = document.querySelectorAll('#hexagon polygon');
  
  if (hexShape) {
    hexShape.setAttribute('stroke', colors.primary);
    hexShape.setAttribute('fill', colors.background);
  }
  
  // Update inner hexagon (second polygon)
  if (innerHexPolygons && innerHexPolygons.length > 1) {
    const primaryRgb = hexToRgb(colors.primary);
    if (primaryRgb) {
      innerHexPolygons[1].setAttribute('stroke', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
    }
  }
  
  // Update SVG glow filters dynamically
  updateGlowFilters(colors.primary, colors.hover);
}

/**
 * Update SVG glow filter colors
 * @param {string} primaryColor - Primary color hex
 * @param {string} hoverColor - Hover color hex
 */
function updateGlowFilters(primaryColor, hoverColor) {
  // Update normal glow filter
  const hexGlowFloods = document.querySelectorAll('#hexGlow feFlood');
  
  hexGlowFloods.forEach(flood => {
    flood.setAttribute('flood-color', primaryColor);
  });
  
  // Update hover glow filter
  const hoverGlowFloods = document.querySelectorAll('#hexGlowHover feFlood');
  
  hoverGlowFloods.forEach(flood => {
    flood.setAttribute('flood-color', hoverColor);
  });
}

/**
 * Load color configuration from config.json
 */
export async function loadColorConfig() {
  try {
    const response = await fetch('config.json');
    const config = await response.json();
    
    if (config && config.colors) {
      applyColors(config.colors);
      console.log('[ox_target] Custom colors loaded successfully');
    }
  } catch (error) {
    console.log('[ox_target] Using default colors (config.json not found or invalid)');
    // Use default colors if config fails to load
    applyColors({
      primary: '#DC2626',
      primaryGlow: 'rgba(220, 38, 38, 0.6)',
      hover: '#ff4444',
      background: 'rgba(15, 10, 10, 0.85)',
      text: '#ffffff',
      textMuted: '#cfd2da'
    });
  }
}