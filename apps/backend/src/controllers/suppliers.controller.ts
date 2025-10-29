import { Request, Response } from 'express';
import * as supplierService from '../services/suppliers.service.js';

export const handleGetAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedores', error });
  }
};

export const handleGetSupplierById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de proveedor inválido' });
  }

  try {
    const supplier = await supplierService.getSupplierById(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el proveedor', error });
  }
};

export const handleCreateSupplier = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data || typeof data.name !== 'string' || data.name.trim() === '') {
    return res.status(400).json({ message: 'El campo "name" es requerido' });
  }

  try {
    const newSupplier = await supplierService.createSupplier(data);
    res.status(201).json(newSupplier);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Proveedor duplicado', error });
    }
    res.status(500).json({ message: 'Error al crear proveedor', error });
  }
};

export const handleUpdateSupplier = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de proveedor inválido' });
  }

  const data = req.body;

  try {
    const updated = await supplierService.updateSupplier(id, data);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Datos duplicados', error });
    }
    res.status(500).json({ message: 'Error al actualizar proveedor', error });
  }
};

export const handleDeleteSupplier = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de proveedor inválido' });
  }

  try {
    await supplierService.deleteSupplier(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.status(500).json({ message: 'Error al eliminar proveedor', error });
  }
};

export const handleRestoreSupplier = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de proveedor inválido' });
  }

  try {
    const supplier = await supplierService.restoreSupplier(id);
    res.status(200).json(supplier);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.status(500).json({ message: 'Error al reactivar proveedor', error });
  }
};