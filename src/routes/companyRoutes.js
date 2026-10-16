import express from 'express';
import { getCompanies, createCompany } from '../controllers/companyController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCompanies)
  .post(protect, admin, createCompany);

export default router;
