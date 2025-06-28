const VendorInterface = require('../interfaces/VendorInterface');
const axios = require('axios');

/**
 * eCommerce Vendor Implementation
 * Integrates with the marketplace partner API for pharmacy/medicine orders
 */
class EcomVendor extends VendorInterface {
  constructor() {
    super();
    this.baseUrl = 'http://staging.joinelixir.club/api/v1/marketplace';
    this.merchantId = 'your_merchant_id';
    this.accessKey = 'client_access_key';
    this.jwtToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with eCommerce vendor using JWT
   */
  async authenticate() {
    try {
      // Mock JWT generation since we don't have real credentials
      this.jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudF9pZCI6InlvdXJfbWVyY2hhbnRfaWQiLCJpYXQiOjE2NTg4Mjk5OTcsImV4cCI6MTY2MTQyMTk5N30.mock_signature';
      this.tokenExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes
      
      console.log('EcomVendor: Authentication successful');
      return true;
    } catch (error) {
      console.error('EcomVendor: Authentication failed', error.message);
      return false;
    }
  }

  /**
   * Check if JWT token is valid
   */
  isTokenValid() {
    return this.jwtToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  /**
   * Get products from eCommerce vendor
   */
  async getProducts(filters = {}) {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      // Mock product data based on the API documentation
      const mockProducts = [
        {
          id: "340679",
          name: "Telma 40 Tablet",
          type: "drug",
          image: "https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/exeejvtktce67qrqtcfh.png",
          label: "strip of 30 tablets",
          prices: {
            mrp: "₹222.1",
            discount: null,
            discounted_price: null
          },
          rx_required: true,
          vendor: "ecom"
        },
        {
          id: "340680",
          name: "Paracetamol 500mg",
          type: "otc",
          image: "https://example.com/paracetamol.png",
          label: "strip of 10 tablets",
          prices: {
            mrp: "₹45.0",
            discount: "10%",
            discounted_price: "₹40.5"
          },
          rx_required: false,
          vendor: "ecom"
        },
        {
          id: "340681",
          name: "Vitamin D3 Tablets",
          type: "otc",
          image: "https://example.com/vitamind3.png",
          label: "bottle of 60 tablets",
          prices: {
            mrp: "₹299.0",
            discount: "15%",
            discounted_price: "₹254.15"
          },
          rx_required: false,
          vendor: "ecom"
        }
      ];

      // Apply filters if provided
      let filteredProducts = mockProducts;
      
      if (filters.query) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(filters.query.toLowerCase())
        );
      }

      if (filters.type) {
        filteredProducts = filteredProducts.filter(product => 
          product.type === filters.type
        );
      }

      if (filters.rx_required !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.rx_required === filters.rx_required
        );
      }

      return {
        products: filteredProducts,
        total: filteredProducts.length,
        vendor: 'ecom'
      };

    } catch (error) {
      console.error('EcomVendor: Failed to get products', error.message);
      throw new Error('Failed to fetch products from ecom vendor');
    }
  }

  /**
   * Validate inventory for items
   */
  async validateInventory(items) {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      // Mock inventory validation response
      const mockValidation = {
        eta: null,
        skus: {},
        vas_charges: {
          details: [{
            type: "handling_fee",
            amount: 99,
            display_text: "Handling Fee"
          }],
          total_amount: 99
        },
        payable_amount: 0
      };

      let totalAmount = 99; // handling fee

      for (const item of items) {
        // Mock stock check - assume all items are available
        const mockPrice = Math.floor(Math.random() * 200) + 50; // Random price between 50-250
        const availableQty = Math.floor(Math.random() * 20) + 1; // Random qty between 1-20
        
        mockValidation.skus[item.sku] = {
          price: mockPrice,
          quantity: Math.min(item.quantity, availableQty), // Available quantity
          offered_price: mockPrice,
          discounted_price: mockPrice * 0.85 // 15% discount
        };

        totalAmount += (mockPrice * 0.85) * Math.min(item.quantity, availableQty);
      }

      mockValidation.payable_amount = totalAmount;

      return {
        success: true,
        data: mockValidation,
        vendor: 'ecom'
      };

    } catch (error) {
      console.error('EcomVendor: Failed to validate inventory', error.message);
      throw new Error('Failed to validate inventory with ecom vendor');
    }
  }

  /**
   * Place order with eCommerce vendor
   */
  async placeOrder(orderData) {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      // Mock order placement
      const orderId = `ECOM_${Date.now()}`;
      
      const mockOrderResponse = {
        order_id: orderId,
        merchant_order_id: orderData.merchant_order_id || `MERCHANT_${Date.now()}`,
        status: "CONFIRMED",
        items: orderData.items.map(item => ({
          sku: item.sku,
          name: `Product ${item.sku}`,
          quantity: item.quantity,
          price: Math.floor(Math.random() * 200) + 50
        })),
        total_amount: orderData.total_amount || Math.floor(Math.random() * 1000) + 500,
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        tracking_link: `https://mock.1mg.com/track/${orderId}`,
        vendor: 'ecom'
      };

      console.log(`EcomVendor: Order placed successfully - ${orderId}`);
      return {
        success: true,
        data: mockOrderResponse
      };

    } catch (error) {
      console.error('EcomVendor: Failed to place order', error.message);
      throw new Error('Failed to place order with ecom vendor');
    }
  }

  /**
   * Check if location is serviceable
   */
  async checkServiceability(location) {
    try {
      // Mock serviceability check
      // Assume serviceable if coordinates are within reasonable bounds
      const { lat, lng } = location;
      
      if (lat >= 8.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0) {
        // Rough bounds for India
        return {
          serviceable: true,
          otc_available: true,
          pharma_available: true,
          vendor: 'ecom'
        };
      }

      return {
        serviceable: false,
        otc_available: false,
        pharma_available: false,
        vendor: 'ecom'
      };

    } catch (error) {
      console.error('EcomVendor: Failed to check serviceability', error.message);
      throw new Error('Failed to check serviceability with ecom vendor');
    }
  }
}

module.exports = EcomVendor;