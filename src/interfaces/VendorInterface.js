/**
 * Base Vendor Interface
 * All vendors must implement these methods
 */
class VendorInterface {
  constructor() {
    if (this.constructor === VendorInterface) {
      throw new Error('VendorInterface is abstract and cannot be instantiated directly');
    }
  }

  /**
   * Authenticate with vendor
   * @returns {Promise<boolean>} Authentication success
   */
  async authenticate() {
    throw new Error('authenticate method must be implemented');
  }

  /**
   * Get products from vendor
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Array of products
   */
  async getProducts(filters = {}) {
    throw new Error('getProducts method must be implemented');
  }

  /**
   * Validate inventory for given items
   * @param {Array} items - Array of items with sku and quantity
   * @returns {Promise<Object>} Validation result
   */
  async validateInventory(items) {
    throw new Error('validateInventory method must be implemented');
  }

  /**
   * Place order with vendor
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Order result
   */
  async placeOrder(orderData) {
    throw new Error('placeOrder method must be implemented');
  }

  /**
   * Check if location is serviceable
   * @param {Object} location - Location with lat, lng
   * @returns {Promise<boolean>} Service availability
   */
  async checkServiceability(location) {
    throw new Error('checkServiceability method must be implemented');
  }
}

module.exports = VendorInterface;