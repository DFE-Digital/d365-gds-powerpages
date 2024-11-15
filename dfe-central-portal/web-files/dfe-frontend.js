/**
 * IE polyfill for NodeList.forEach()
 */
if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
  
  /**
   * IE polyfill for Array.includes()
   */
  if (!Array.prototype.includes) {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'includes', {
      enumerable: false,
      value(obj) {
        return this.filter((el) => el === obj).length > 0;
      },
    });
  }
  
  /**
   * IE polyfill for Element.closest()
   */
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }
  
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
  
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
  
  /**
   * Toggle a boolean attribute on a HTML element
   * @param {HTMLElement} element
   * @param {string} attr
  */
  const toggleAttribute = (element, attr) => {
    // Return without error if element or attr are missing
    if (!element || !attr) return;
    // Toggle attribute value. Treat no existing attr same as when set to false
    const value = (element.getAttribute(attr) === 'true') ? 'false' : 'true';
    element.setAttribute(attr, value);
  };
  
  /**
   * Toggle a toggle a class on conditional content for an input based on checked state
   * @param {HTMLElement} input input element
   * @param {string} className class to toggle
  */
  const toggleConditionalInput = (input, className) => {
    // Return without error if input or class are missing
    if (!input || !className) return;
    // If the input has conditional content it had a data-aria-controls attribute
    const conditionalId = input.getAttribute('aria-controls');
    if (conditionalId) {
      // Get the conditional element from the input data-aria-controls attribute
      const conditionalElement = document.getElementById(conditionalId);
      if (conditionalElement) {
        if (input.checked) {
          conditionalElement.classList.remove(className);
          input.setAttribute('aria-expanded', true);
        } else {
          conditionalElement.classList.add(className);
          input.setAttribute('aria-expanded', false);
        }      
      }
    }
  };
  
  /**
   * Handle menu show and hide for mobile
  */
  const MenuToggle =  () => {
    // HTMLElements
    const toggleButton = document.querySelector('#toggle-menu');
    const closeButton = document.querySelector('#close-menu');
    const nav = document.querySelector('#header-navigation');
  
    /**
     * Toggle classes and attributes
     * @param {Object} event click event object
    */
    const toggleMenu = (event) => {
      event.preventDefault();
      // Toggle aria-expanded for accessibility
      toggleAttribute(toggleButton, 'aria-expanded');
      // Toggle classes to apply CSS
      toggleButton.classList.toggle('is-active');
      nav.classList.toggle('js-show');
    };
  
    // Check all necessary HTMLElements exist
    if (toggleButton && closeButton && nav) {
      // Attach toggleMenu as click to any elements which need it
      [toggleButton, closeButton].forEach((elem) => {
        elem.addEventListener('click', toggleMenu);
      });
    }
  };
  
  /**
   * Handle search show and hide for mobile
  */
  const SearchToggle = () => {
    // HTMLElements
    const toggleButton = document.querySelector('#toggle-search');
    const closeButton = document.querySelector('#close-search');
    const searchContainer = document.querySelector('#wrap-search');
    const menuSearchContainer = document.querySelector('#content-header');
  
    /**
     * Toggle classes and attributes
     * @param {Object} event click event object
    */
    const toggleSearch = (event) => {
      event.preventDefault();
      // Toggle aria-expanded for accessibility
      toggleAttribute(toggleButton, 'aria-expanded');
      // Toggle classes to apply CSS
      toggleButton.classList.toggle('is-active');
      searchContainer.classList.toggle('js-show');
      menuSearchContainer.classList.toggle('js-show');
    };
  
    // Check all necessary HTMLElements exist
    if (toggleButton && closeButton) {
      // Attach toggleSearch as click to any elements which need it
      [toggleButton, closeButton].forEach((elem) => {
        elem.addEventListener('click', toggleSearch);
      });
    }
  };
  
  // Initialize components
  document.addEventListener('DOMContentLoaded', () => {
    MenuToggle();
    SearchToggle();
  });