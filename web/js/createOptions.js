import { fetchNui } from "./fetchNui.js";

const optionsWrapper = document.getElementById("options-wrapper");

// Configuration for radial layout
const CONFIG = {
  // Defaults (overridden by CSS variables if present).
  // Keeping JS in sync with CSS prevents options from overlapping.
  innerRingRadius: 180,  // Matches CSS variable --ring-radius-inner
  outerRingRadius: 280,  // Matches CSS variable --ring-radius-outer
  maxInnerRing: 8,       // Max options in inner ring before using outer ring
  startAngle: -90,       // Start from top (12 o'clock position)
};

// Sync radii with CSS variables (if set) so spacing stays consistent with your theme.
(() => {
  const styles = getComputedStyle(document.documentElement);
  const parsePx = (v) => {
    if (!v) return NaN;
    const n = parseFloat(String(v).replace('px', '').trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const inner = parsePx(styles.getPropertyValue('--ring-radius-inner'));
  const outer = parsePx(styles.getPropertyValue('--ring-radius-outer'));

  if (Number.isFinite(inner)) CONFIG.innerRingRadius = inner;
  if (Number.isFinite(outer)) CONFIG.outerRingRadius = outer;
})();

// Store all option elements for easy cleanup
let optionElements = [];

/**
 * Calculate position for option in radial layout
 * @param {number} index - Index of the option in the current page
 * @param {number} totalCount - Total number of options on this page
 * @returns {Object} - {x, y} coordinates relative to center
 */
function calculateRadialPosition(index, totalCount) {
  // Determine which ring to use
  let radius, ringIndex, optionsInRing;
  
  if (totalCount <= CONFIG.maxInnerRing) {
    // All options fit in inner ring
    radius = CONFIG.innerRingRadius;
    ringIndex = index;
    optionsInRing = totalCount;
  } else {
    // Use both rings
    if (index < CONFIG.maxInnerRing) {
      // Inner ring
      radius = CONFIG.innerRingRadius;
      ringIndex = index;
      optionsInRing = CONFIG.maxInnerRing;
    } else {
      // Outer ring
      radius = CONFIG.outerRingRadius;
      ringIndex = index - CONFIG.maxInnerRing;
      optionsInRing = totalCount - CONFIG.maxInnerRing;
    }
  }
  
  // Calculate angle for this option
  // Distribute evenly around the circle
  const angleStep = 360 / optionsInRing;
  const angle = CONFIG.startAngle + (ringIndex * angleStep);
  const angleRad = (angle * Math.PI) / 180;
  
  // Calculate x, y position
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;
  
  return { x, y };
}

/**
 * Handle click on option
 */
function onClick() {
  // Prevent multiple clicks
  this.style.pointerEvents = "none";
  
  fetchNui("select", [this.targetType, this.targetId, this.zoneId]);
  
  // Re-enable after short delay
  setTimeout(() => (this.style.pointerEvents = "auto"), 100);
}

/**
 * Create and position an option element
 * @param {string} type - Option type (zones, model, entity, etc.)
 * @param {Object} data - Option data (label, icon, etc.)
 * @param {number} id - Option ID
 * @param {number} zoneId - Zone ID (if applicable)
 * @param {number} displayIndex - Display index within current page
 */
export function createOptions(type, data, id, zoneId, displayIndex) {
  if (data.hide) return;
  
  // Create option element
  const option = document.createElement("div");
  option.className = "option-container";
  
  // Create icon element
  const iconElement = document.createElement("i");
  iconElement.className = `fa-fw ${data.icon || 'fas fa-hand-pointer'} option-icon`;
  if (data.iconColor) {
    iconElement.style.color = data.iconColor;
  }
  
  // Create label element
  const labelElement = document.createElement("p");
  labelElement.className = "option-label";
  labelElement.textContent = data.label || "Unknown Option";
  
  // Append icon and label
  option.appendChild(iconElement);
  option.appendChild(labelElement);
  
  // Store metadata for click handler
  option.targetType = type;
  option.targetId = id;
  option.zoneId = zoneId;
  
  // Add click handler
  option.addEventListener("click", onClick);
  
  // Calculate position based on total options currently displayed
  // We need to count how many options are already in the wrapper
  const currentOptionCount = optionsWrapper.children.length;
  const totalOptionsToDisplay = currentOptionCount + 1;
  
  // Calculate position for this option
  const pos = calculateRadialPosition(displayIndex, totalOptionsToDisplay);
  
  // Set position using CSS transform
  option.style.left = `${pos.x}px`;
  option.style.top = `${pos.y}px`;
  
  // Append to wrapper
  optionsWrapper.appendChild(option);
  optionElements.push(option);
  
  // Trigger animation by adding visible class after a tiny delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      option.classList.add("visible");
    });
  });
  
  // Recalculate ALL positions to maintain even distribution
  recalculateAllPositions();
}

/**
 * Recalculate positions for all options to maintain even spacing
 * This ensures perfect distribution when options are added/removed
 */
function recalculateAllPositions() {
  const allOptions = Array.from(optionsWrapper.children);
  const totalCount = allOptions.length;
  
  allOptions.forEach((option, index) => {
    const pos = calculateRadialPosition(index, totalCount);
    option.style.left = `${pos.x}px`;
    option.style.top = `${pos.y}px`;
  });
}

/**
 * Clear all options from the wrapper
 */
export function clearOptions() {
  optionsWrapper.innerHTML = "";
  optionElements = [];
}