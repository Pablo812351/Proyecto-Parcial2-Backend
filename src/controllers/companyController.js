import Company from '../models/Company.js';
import { handleControllerError, escapeRegex, ensure } from '../utils/errorHandler.js';
import { validateCompanyInput } from '../utils/validators.js';

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la lista de empresas');
  }
};

export const createCompany = async (req, res) => {
  try {
    validateCompanyInput(req.body);

    const cleanName = req.body.name.trim();
    const companyExists = await Company.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(cleanName)}$`, 'i') }
    });
    ensure(!companyExists, 'La empresa ya se encuentra registrada', 400);

    const createdCompany = await Company.create({ name: cleanName });
    res.status(201).json(createdCompany);
  } catch (error) {
    handleControllerError(res, error, 'Error al registrar la empresa');
  }
};
