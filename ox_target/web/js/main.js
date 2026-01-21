import { createOptions, clearOptions } from "./createOptions.js";
import { loadColorConfig } from "./colorConfig.js";

const optionsWrapper = document.getElementById("options-wrapper");
const body = document.body;
const eye = document.getElementById("eye");
const pageIndicator = document.getElementById("page-indicator");

// Pagination state
let currentPage = 0;
let totalPages = 1;
let allOptions = [];
const OPTIONS_PER_PAGE = 16; // Max 16 options visible at once (8 inner + 8 outer ring)

// Update pagination display
function updatePagination() {
  const currentPageSpan = document.getElementById("current-page");
  const totalPagesSpan = document.getElementById("total-pages");
  
  if (currentPageSpan && totalPagesSpan) {
    currentPageSpan.textContent = currentPage + 1;
    totalPagesSpan.textContent = totalPages;
  }
  
  // Show/hide pagination indicator
  if (totalPages > 1) {
    pageIndicator.style.display = "block";
    pageIndicator.classList.add("visible");
  } else {
    pageIndicator.style.display = "none";
    pageIndicator.classList.remove("visible");
  }
}

// Render current page of options
function renderCurrentPage() {
  clearOptions();
  
  const startIdx = currentPage * OPTIONS_PER_PAGE;
  const endIdx = Math.min(startIdx + OPTIONS_PER_PAGE, allOptions.length);
  const pageOptions = allOptions.slice(startIdx, endIdx);
  
  pageOptions.forEach((optionData, index) => {
    createOptions(optionData.type, optionData.data, optionData.id, optionData.zoneId, index);
  });
  
  updatePagination();
}

// Mouse wheel pagination
window.addEventListener("wheel", (event) => {
  if (allOptions.length <= OPTIONS_PER_PAGE) return;
  
  event.preventDefault();
  
  if (event.deltaY > 0) {
    // Scroll down - next page
    currentPage = (currentPage + 1) % totalPages;
  } else {
    // Scroll up - previous page
    currentPage = (currentPage - 1 + totalPages) % totalPages;
  }
  
  renderCurrentPage();
}, { passive: false });

// Main message handler
window.addEventListener("message", (event) => {
  switch (event.data.event) {
    case "visible": {
      const isVisible = event.data.state;
      body.style.visibility = isVisible ? "visible" : "hidden";
      
      if (isVisible) {
        body.classList.add("eye-visible");
      } else {
        body.classList.remove("eye-visible", "eye-hover");
        // Reset pagination
        allOptions = [];
        currentPage = 0;
        totalPages = 1;
        clearOptions();
        updatePagination();
      }
      
      return;
    }

    case "leftTarget": {
      // Immediately hide hover state and clear options when target is lost
      body.classList.remove("eye-hover");
      
      // Clear all options immediately
      allOptions = [];
      currentPage = 0;
      totalPages = 1;
      clearOptions();
      updatePagination();
      
      return;
    }

    case "setTarget": {
      body.classList.add("eye-hover");
      
      // Clear previous options
      allOptions = [];
      clearOptions();
      
      // Collect all options
      if (event.data.options) {
        for (const type in event.data.options) {
          event.data.options[type].forEach((data, id) => {
            allOptions.push({ type, data, id: id + 1, zoneId: undefined });
          });
        }
      }

      if (event.data.zones) {
        for (let i = 0; i < event.data.zones.length; i++) {
          event.data.zones[i].forEach((data, id) => {
            allOptions.push({ type: "zones", data, id: id + 1, zoneId: i + 1 });
          });
        }
      }
      
      // Calculate pagination
      totalPages = Math.ceil(allOptions.length / OPTIONS_PER_PAGE);
      currentPage = 0;
      
      // Render first page
      renderCurrentPage();
      
      return;
    }
  }
});

// Load custom colors when DOM is ready
// Since this script is loaded as defer module, DOM is already ready
loadColorConfig();