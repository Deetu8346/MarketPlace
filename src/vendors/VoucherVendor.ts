import VendorInterface from '../interfaces/VendorInterface';
import * as crypto from 'crypto';
import {
  ProductFilters,
  ProductsResponse,
  Product,
  InventoryItem,
  ValidationResult,
  VoucherInventoryValidation,
  OrderData,
  VoucherOrderResponse,
  Location,
  ServiceabilityResponse,
  ApiResponse,
  StoreInfo,
  Voucher
} from '../types';


class VoucherVendor extends VendorInterface {
  private baseUrl: string;
  private username: string;
  private password: string;
  private key: Buffer;
  private iv: Buffer;
  private token: string | null;
  private tokenExpiry: number | null;

  constructor() {
    super();
    this.baseUrl = 'https://staging.joinelixir.club/api/v1/voucher';
    this.username = 'vgUser';
    this.password = 'vgPass123';
    this.key = Buffer.from('6d66fb7debfd15bf716bb14752b9603b6d66fb7debfd15bf716bb14752b9603b', 'hex');
    this.iv = Buffer.from('716bb14752b9603b716bb14752b9603b', 'hex');
    this.token = null;
    this.tokenExpiry = null;
  }

  private encryptData(data: string | object): string {
    try {
      let dataString: string;
      if (typeof data === "object") {
        dataString = JSON.stringify(data);
      } else {
        dataString = data;
      }
      const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.iv);
      let encrypted = cipher.update(dataString, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (error) {
      console.error('VoucherVendor: Encryption error', error);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  private decryptData(encryptedData: string): string {
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", this.key, this.iv);
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('VoucherVendor: Decryption error', error);
      return encryptedData;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      const mockEncryptedToken = this.encryptData('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOiJ2OWJrRzBseW9lR25KSEFyNm1sclR3UDFrRUhkb1piUitlR3pBQmJ0QXlXa3YrNXpRVk4yQWtkdUxLd0lvVFRGZ1pCTW9KZ2JDNW42SGRHZHN6TWdEUVVGL3krQzJ5Y0VTZjJFTDVOQkpLbTlRblB2Q0Y0R2Z4cFNvOHN2bitMdiIsImlhdCI6MTY1ODgyOTk5NywiZXhwIjoxNjYxNDIxOTk3fQ.Vn-VXCxfd9a8bV6JpFfTeZk1gMAOSE01avGQSWNjfig');
      
      this.token = this.decryptData(mockEncryptedToken);
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      console.log('VoucherVendor: Authentication successful');
      return true;
    } catch (error) {
      console.error('VoucherVendor: Authentication failed', (error as Error).message);
      return false;
    }
  }

  private isTokenValid(): boolean {
    return this.token !== null && this.tokenExpiry !== null && Date.now() < this.tokenExpiry;
  }

  
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      const mockBrands: Product[] = [
        {
          id: "Bata4xfRrUnT46Uv4iol",
          name: "Bata",
          type: "VOUCHER",
          image: "https://cdn.gyftr.com/comm_engine/stag/images/brands/1593693691875_u3qtc3vzkc4s2qqr.png",
          label: "Fashion footwear brand",
          prices: {
            mrp: "Variable",
            discount: null,
            discounted_price: null
          },
          denominations: ["100", "500", "1000"],
          category: "Lifestyle",
          description: "If you're looking for the best-in-class footwear, Bata is your go-to brand.",
          redemption_type: "2", 
          online_redemption_url: "https://www.bata.in/",
          stock_available: true,
          vendor: "voucher"
        },
        {
          id: "Baskin_RobinshStD6pXnAIEG2wi2",
          name: "Baskin Robbins",
          type: "VOUCHER",
          image: "https://cdn.gyftr.com/comm_engine/stag/images/brands/baskin_robbins.png",
          label: "Ice cream brand",
          prices: {
            mrp: "Variable",
            discount: null,
            discounted_price: null
          },
          denominations: ["100", "200", "500"],
          category: "Food & Beverages",
          description: "Enjoy delicious ice cream at Baskin Robbins with these vouchers.",
          redemption_type: "3", // Both online and offline
          online_redemption_url: "https://www.baskinrobbins.in/",
          stock_available: true,
          vendor: "voucher"
        },
        {
          id: "WestsidemFqa2lBrMls187j0",
          name: "Westside",
          type: "VOUCHER",
          image: "https://cdn.gyftr.com/comm_engine/stag/images/brands/westside.png",
          label: "Fashion brand",
          prices: {
            mrp: "Variable",
            discount: null,
            discounted_price: null
          },
          denominations: ["500", "1000", "2000"],
          category: "Lifestyle",
          description: "Shop for trendy fashion at Westside stores.",
          redemption_type: "2", // Offline
          online_redemption_url: null,
          stock_available: true,
          vendor: "voucher"
        }
      ];

      let filteredBrands = mockBrands;
      
      if (filters.query) {
        filteredBrands = filteredBrands.filter(brand => 
          brand.name.toLowerCase().includes(filters.query!.toLowerCase()) ||
          (brand.category && brand.category.toLowerCase().includes(filters.query!.toLowerCase()))
        );
      }

      if (filters.category) {
        filteredBrands = filteredBrands.filter(brand => 
          brand.category && brand.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      return {
        products: filteredBrands,
        total: filteredBrands.length,
        vendor: 'voucher'
      };

    } catch (error) {
      console.error('VoucherVendor: Failed to get products', (error as Error).message);
      throw new Error('Failed to fetch products from voucher vendor');
    }
  }

  async validateInventory(items: InventoryItem[]): Promise<ValidationResult> {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      const stockValidation: VoucherInventoryValidation = {
        available_items: [],
        unavailable_items: [],
        total_amount: 0,
        vendor: 'voucher'
      };

      for (const item of items) {
        const availableQty = Math.floor(Math.random() * 50) + 1; 
        const denomination = parseInt(item.denomination || "100");
        
        if (availableQty >= item.quantity) {
          stockValidation.available_items.push({
            brand_code: item.sku,
            denomination: denomination,
            quantity: item.quantity,
            available_quantity: availableQty,
            unit_price: denomination,
            total_price: denomination * item.quantity
          });
          stockValidation.total_amount += denomination * item.quantity;
        } else {
          stockValidation.unavailable_items.push({
            brand_code: item.sku,
            denomination: denomination,
            requested_quantity: item.quantity,
            available_quantity: availableQty,
            reason: availableQty > 0 ? 'Insufficient stock' : 'Out of stock'
          });
        }
      }

      return {
        success: true,
        data: stockValidation
      };

    } catch (error) {
      console.error('VoucherVendor: Failed to validate inventory', (error as Error).message);
      throw new Error('Failed to validate inventory with voucher vendor');
    }
  }

  async placeOrder(orderData: OrderData): Promise<ApiResponse<VoucherOrderResponse>> {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      const orderId = `VOUCHER_${Date.now()}`;
      
      const mockVouchers: Voucher[] = [];
      
      for (const item of orderData.items) {
        for (let i = 0; i < item.quantity; i++) {
          mockVouchers.push({
            brand_code: item.sku,
            voucher_code: `VCH${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
            voucher_pin: Math.random().toString().substring(2, 8),
            denomination: item.denomination || "100",
            expiry_date: "31 Dec 2024",
            redemption_instructions: "Present this voucher at any participating outlet"
          });
        }
      }

      const mockOrderResponse: VoucherOrderResponse = {
        order_id: orderId,
        external_order_id: orderData.external_order_id || `EXT_${Date.now()}`,
        status: "SUCCESS",
        message: "Vouchers generated successfully",
        vouchers: mockVouchers,
        total_amount: orderData.total_amount || mockVouchers.length * 100,
        vendor: 'voucher'
      };

      console.log(`VoucherVendor: Order placed successfully - ${orderId}`);
      return {
        success: true,
        data: mockOrderResponse
      };

    } catch (error) {
      console.error('VoucherVendor: Failed to place order', (error as Error).message);
      throw new Error('Failed to place order with voucher vendor');
    }
  }

  async checkServiceability(location: Location): Promise<ServiceabilityResponse> {
    try {
      
      return {
        serviceable: true,
        voucher_available: true,
        digital_delivery: true,
        vendor: 'voucher'
      };
    } catch (error) {
      console.error('VoucherVendor: Failed to check serviceability', (error as Error).message);
      throw new Error('Failed to check serviceability with voucher vendor');
    }
  }

  async getStoreList(brandCode: string | null = null): Promise<ApiResponse<StoreInfo[]>> {
    try {
      if (!this.isTokenValid()) {
        await this.authenticate();
      }

      const mockStores: StoreInfo[] = [
        {
          brand_id: "28",
          brand_name: "Westside",
          brand_status: "Y",
          shop_details: [
            {
              shop_id: "16907",
              shop_name: "Westside - Iscon Mall Ahmedabad",
              shop_guid: "f251437b-3ee3-40f9-8971-4054cfaca174",
              shop_code: "W029",
              address: "Iscon Mall, SG Highway, Ahmedabad",
              city: "Ahmedabad",
              state: "Gujarat",
              shop_contact: "+91-79-12345678",
              shop_status: "A"
            },
            {
              shop_id: "16908",
              shop_name: "Westside - Phoenix Mall Mumbai",
              shop_guid: "a351437b-3ee3-40f9-8971-4054cfaca175",
              shop_code: "W030",
              address: "Phoenix Mills, Lower Parel, Mumbai",
              city: "Mumbai",
              state: "Maharashtra",
              shop_contact: "+91-22-87654321",
              shop_status: "A"
            }
          ]
        }
      ];

      return {
        success: true,
        data: mockStores
      };

    } catch (error) {
      console.error('VoucherVendor: Failed to get store list', (error as Error).message);
      throw new Error('Failed to get store list from voucher vendor');
    }
  }
}

export default VoucherVendor;