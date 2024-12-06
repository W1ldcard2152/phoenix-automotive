import { Router } from 'express';
import dismantledVehiclesRouter from './routes/DismantledVehicles.js';
import retailVehiclesRouter from './routes/RetailVehicles.js';
import partRequestsRouter from './routes/PartRequests.js';  

const router = Router();

// Mount the routers at their respective paths
console.log('Mounting routes...');
router.use('/dismantled-vehicles', dismantledVehiclesRouter);
router.use('/retail-vehicles', retailVehiclesRouter);  
router.use('/part-requests', partRequestsRouter);
console.log('Routes mounted');

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Router error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message });
});

export default router;