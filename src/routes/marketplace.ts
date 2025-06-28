import { Router } from 'express';
import MarketplaceController from '../controllers/MarketplaceController';

const router = Router();

router.get('/products', MarketplaceController.getProducts);

router.post('/validate-inventory', MarketplaceController.validateInventory);

router.post('/order', MarketplaceController.placeOrder);

router.get('/vendors', MarketplaceController.getSupportedVendors);

router.get('/health', MarketplaceController.healthCheck);

export default router;