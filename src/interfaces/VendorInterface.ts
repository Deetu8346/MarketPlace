import { 
  ProductFilters, 
  ProductsResponse, 
  InventoryItem, 
  ValidationResult, 
  OrderData, 
  Location, 
  ServiceabilityResponse,
  ApiResponse,
  EcomOrderResponse,
  VoucherOrderResponse
} from '../types';


abstract class VendorInterface {
  constructor() {
    if (this.constructor === VendorInterface) {
      throw new Error('VendorInterface is abstract and cannot be instantiated directly');
    }
  }

  abstract authenticate(): Promise<boolean>;

  
  abstract getProducts(filters?: ProductFilters): Promise<ProductsResponse>;


  abstract validateInventory(items: InventoryItem[]): Promise<ValidationResult>;

  
  abstract placeOrder(orderData: OrderData): Promise<ApiResponse<EcomOrderResponse | VoucherOrderResponse>>;

  
  abstract checkServiceability(location: Location): Promise<ServiceabilityResponse>;
}

export default VendorInterface;