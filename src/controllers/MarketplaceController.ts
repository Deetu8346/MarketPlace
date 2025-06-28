import { Request, Response } from 'express';
import VendorFactory from '../factories/VendorFactory';
import * as Joi from 'joi';
import { 
  ProductFilters, 
  InventoryItem, 
  OrderData, 
  ApiResponse, 
  InventoryValidationResponse 
} from '../types';



class MarketplaceController {
  
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { vendor } = req.query;
      
      if (!vendor) {
        res.status(400).json({
          success: false,
          error: 'Vendor parameter is required'
        });
        return;
      }

      if (!VendorFactory.isSupported(vendor as string)) {
        res.status(400).json({
          success: false,
          error: `Unsupported vendor: ${vendor}. Supported vendors: ${VendorFactory.getSupportedVendors().join(', ')}`
        });
        return;
      }

      const vendorInstance = VendorFactory.getVendor(vendor as string);
      
      const filters: ProductFilters = {
        query: req.query.query as string,
        type: req.query.type as string,
        category: req.query.category as string,
        rx_required: req.query.rx_required === 'true'
      };

      const result = await vendorInstance.getProducts(filters);

      res.json({
        success: true,
        data: result,
        vendor: vendor,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('MarketplaceController.getProducts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: (error as Error).message
      });
    }
  }

  static async validateInventory(req: Request, res: Response): Promise<void> {
    try {
      const schema = Joi.object({
        items: Joi.array().items(
          Joi.object({
            sku: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
            vendor: Joi.string().valid(...VendorFactory.getSupportedVendors()).required(),
            denomination: Joi.string().optional() 
          })
        ).min(1).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.details
        });
        return;
      }

      const { items }: { items: InventoryItem[] } = value;
      
      const itemsByVendor: Record<string, InventoryItem[]> = {};
      items.forEach(item => {
        if (!itemsByVendor[item.vendor!]) {
          itemsByVendor[item.vendor!] = [];
        }
        itemsByVendor[item.vendor!].push(item);
      });

      const validationResults: Record<string, any> = {};
      const promises: Promise<void>[] = [];

      for (const [vendorType, vendorItems] of Object.entries(itemsByVendor)) {
        const vendorInstance = VendorFactory.getVendor(vendorType);
        promises.push(
          vendorInstance.validateInventory(vendorItems)
            .then(result => {
              validationResults[vendorType] = result;
            })
            .catch(error => {
              validationResults[vendorType] = {
                success: false,
                error: (error as Error).message
              };
            })
        );
      }

      await Promise.all(promises);


      const overallSuccess = Object.values(validationResults).every((result: any) => result.success);
      let totalAmount = 0;

      if (overallSuccess) {
        Object.values(validationResults).forEach((result: any) => {
          if (result.data && result.data.payable_amount) {
            totalAmount += result.data.payable_amount;
          } else if (result.data && result.data.total_amount) {
            totalAmount += result.data.total_amount;
          }
        });
      }

      const response: ApiResponse<InventoryValidationResponse> = {
        success: overallSuccess,
        data: {
          validation_results: validationResults,
          total_amount: totalAmount,
          items_count: items.length,
          vendors_involved: Object.keys(itemsByVendor)
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      console.error('MarketplaceController.validateInventory error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate inventory',
        message: (error as Error).message
      });
    }
  }

  static async placeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { vendor } = req.query;
      
      if (!vendor) {
        res.status(400).json({
          success: false,
          error: 'Vendor parameter is required'
        });
        return;
      }

      if (!VendorFactory.isSupported(vendor as string)) {
        res.status(400).json({
          success: false,
          error: `Unsupported vendor: ${vendor}. Supported vendors: ${VendorFactory.getSupportedVendors().join(', ')}`
        });
        return;
      }

      const schema = Joi.object({
        items: Joi.array().items(
          Joi.object({
            sku: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
            denomination: Joi.string().optional() 
          })
        ).min(1).required(),
        customer_info: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          phone: Joi.string().required(),
          address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            pincode: Joi.string().required(),
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
          }).required()
        }).required(),
        payment_info: Joi.object({
          method: Joi.string().valid('ONLINE', 'COD').required(),
          transaction_id: Joi.string().when('method', {
            is: 'ONLINE',
            then: Joi.required(),
            otherwise: Joi.optional()
          })
        }).required(),
        total_amount: Joi.number().min(0).required(),
        merchant_order_id: Joi.string().optional(),
        external_order_id: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.details
        });
        return;
      }

      const orderData: OrderData = value;

      const vendorInstance = VendorFactory.getVendor(vendor as string);
      
      if (orderData.customer_info.address.lat && orderData.customer_info.address.lng) {
        const serviceabilityResult = await vendorInstance.checkServiceability({
          lat: orderData.customer_info.address.lat,
          lng: orderData.customer_info.address.lng
        });

        if (!serviceabilityResult.serviceable) {
          res.status(400).json({
            success: false,
            error: 'Service not available in this location',
            serviceability: serviceabilityResult
          });
          return;
        }
      }

      const orderResult = await vendorInstance.placeOrder(orderData);

      res.json({
        success: orderResult.success,
        data: orderResult.data,
        vendor: vendor,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('MarketplaceController.placeOrder error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to place order',
        message: (error as Error).message
      });
    }
  }

  static async getSupportedVendors(req: Request, res: Response): Promise<void> {
    try {
      const vendors = VendorFactory.getSupportedVendors();
      
      res.json({
        success: true,
        data: {
          vendors: vendors,
          count: vendors.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('MarketplaceController.getSupportedVendors error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get supported vendors',
        message: (error as Error).message
      });
    }
  }

  static async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Marketplace API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}

export default MarketplaceController;