export interface Product {
  id: string;
  name: string;
  type: string;
  image: string;
  label: string;
  prices: {
    mrp: string;
    discount?: string | null;
    discounted_price?: string | null;
  };
  rx_required?: boolean;
  vendor: string;
  denominations?: string[];
  category?: string;
  description?: string;
  redemption_type?: string;
  online_redemption_url?: string | null;
  stock_available?: boolean;
}

export interface ProductFilters {
  query?: string;
  type?: string;
  category?: string;
  rx_required?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  vendor: string;
}

export interface InventoryItem {
  sku: string;
  quantity: number;
  vendor?: string;
  denomination?: string;
}

export interface InventoryValidationSku {
  price: number;
  quantity: number;
  offered_price: number;
  discounted_price: number;
}

export interface VasCharge {
  type: string;
  amount: number;
  display_text: string;
}

export interface VasCharges {
  details: VasCharge[];
  total_amount: number;
}

export interface EcomInventoryValidation {
  eta: string | null;
  skus: Record<string, InventoryValidationSku>;
  vas_charges: VasCharges;
  payable_amount: number;
}

export interface VoucherInventoryItem {
  brand_code: string;
  denomination: number;
  quantity: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
}

export interface VoucherUnavailableItem {
  brand_code: string;
  denomination: number;
  requested_quantity: number;
  available_quantity: number;
  reason: string;
}

export interface VoucherInventoryValidation {
  available_items: VoucherInventoryItem[];
  unavailable_items: VoucherUnavailableItem[];
  total_amount: number;
  vendor: string;
}

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
}

export interface PaymentInfo {
  method: 'ONLINE' | 'COD';
  transaction_id?: string;
}

export interface OrderItem {
  sku: string;
  quantity: number;
  denomination?: string;
  name?: string;
  price?: number;
}

export interface OrderData {
  items: OrderItem[];
  customer_info: CustomerInfo;
  payment_info: PaymentInfo;
  total_amount: number;
  merchant_order_id?: string;
  external_order_id?: string;
}

export interface EcomOrderResponse {
  order_id: string;
  merchant_order_id: string;
  status: string;
  items: OrderItem[];
  total_amount: number;
  estimated_delivery: string;
  tracking_link: string;
  vendor: string;
}

export interface Voucher {
  brand_code: string;
  voucher_code: string;
  voucher_pin: string;
  denomination: string;
  expiry_date: string;
  redemption_instructions: string;
}

export interface VoucherOrderResponse {
  order_id: string;
  external_order_id: string;
  status: string;
  message: string;
  vouchers: Voucher[];
  total_amount: number;
  vendor: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ServiceabilityResponse {
  serviceable: boolean;
  otc_available?: boolean;
  pharma_available?: boolean;
  voucher_available?: boolean;
  digital_delivery?: boolean;
  vendor: string;
}

export interface ShopDetail {
  shop_id: string;
  shop_name: string;
  shop_guid: string;
  shop_code: string;
  address: string;
  city: string;
  state: string;
  shop_contact: string;
  shop_status: string;
}

export interface StoreInfo {
  brand_id: string;
  brand_name: string;
  brand_status: string;
  shop_details: ShopDetail[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ValidationResult {
  success: boolean;
  data?: EcomInventoryValidation | VoucherInventoryValidation;
  error?: string;
}

export interface InventoryValidationResponse {
  validation_results: Record<string, ValidationResult>;
  total_amount: number;
  items_count: number;
  vendors_involved: string[];
}