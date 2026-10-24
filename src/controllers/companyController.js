import Company from '../models/Company.js';

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre de la empresa es obligatorio' });
    }

    const companyExists = await Company.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    
    if (companyExists) {
      return res.status(400).json({ message: 'La empresa ya existe' });
    }

    const company = new Company({ name });

    const createdCompany = await company.save();
    res.status(201).json(createdCompany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
