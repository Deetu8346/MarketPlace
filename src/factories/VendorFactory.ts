import EcomVendor from '../vendors/EcomVendor';
import VoucherVendor from '../vendors/VoucherVendor';
import VendorInterface from '../interfaces/VendorInterface';

class VendorFactory {
  private static vendors = new Map<string, VendorInterface>();

  
  static getVendor(vendorType: string): VendorInterface {
    if (!vendorType) {
      throw new Error('Vendor type is required');
    }

    const vendorKey = vendorType.toLowerCase();

    if (this.vendors.has(vendorKey)) {
      return this.vendors.get(vendorKey)!;
    }

    let vendor: VendorInterface;
    switch (vendorKey) {
      case 'ecom':
        vendor = new EcomVendor();
        break;
      case 'voucher':
        vendor = new VoucherVendor();
        break;
      default:
        throw new Error(`Unsupported vendor type: ${vendorType}`);
    }

    this.vendors.set(vendorKey, vendor);
    return vendor;
  }


  static getSupportedVendors(): string[] {
    return ['ecom', 'voucher'];
  }

  static isSupported(vendorType: string): boolean {
    return this.getSupportedVendors().includes(vendorType.toLowerCase());
  }

  static clearCache(): void {
    this.vendors.clear();
  }
}

export default VendorFactory;