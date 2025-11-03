// apps/backend/src/controllers/reports.controller.ts

import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service.js';

export class ReportsController {
  constructor(private readonly reportsService = new ReportsService()) {}

  handleGetSalesReport = async (req: Request, res: Response) => {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({
          message: 'Los parámetros from y to son requeridos',
        });
      }

      const report = await this.reportsService.getSalesReport(
        from as string,
        to as string
      );

      return res.status(200).json(report);
    } catch (error) {
      console.error('Error generating sales report:', error);

      if (error instanceof Error && error.message === 'Invalid date range provided') {
        return res.status(400).json({ message: 'Rango de fechas inválido' });
      }

      return res
        .status(500)
        .json({ message: 'Error al generar el reporte de ventas' });
    }
  };
}

export default ReportsController;
