// apps/backend/src/controllers/cash.controller.ts

import { Request, Response } from 'express';
import { CashService } from '../services/cash.service.js';

export class CashController {
  private cashService: CashService;

  constructor() {
    this.cashService = new CashService();
  }

  handleGetCashMovements = async (req: Request, res: Response) => {
    try {
      const movements = await this.cashService.getCashMovements();
      res.status(200).json(movements);
    } catch (error) {
      console.error('Error in handleGetCashMovements:', error);
      res.status(500).json({ message: 'Error fetching cash movements' });
    }
  };
}