import Company from '../models/Company.js';
import { handleControllerError, escapeRegex } from '../utils/errorHandler.js';

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
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'El nombre de la empresa es obligatorio y debe ser texto' });
    }

    const cleanName = name.trim();
    if (cleanName.length > 80) {
      return res.status(400).json({ message: 'El nombre de la empresa no puede superar los 80 caracteres' });
    }
    const safeName = escapeRegex(cleanName);
    const companyExists = await Company.findOne({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });
    
    if (companyExists) {
      return res.status(400).json({ message: 'La empresa ya se encuentra registrada' });
    }

    const company = new Company({ name: cleanName });

    const createdCompany = await company.save();
    res.status(201).json(createdCompany);
  } catch (error) {
    handleControllerError(res, error, 'Error al registrar la empresa');
  }
};
