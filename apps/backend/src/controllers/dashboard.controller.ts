// apps/backend/src/controllers/dashboard.controller.ts

import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  handleGetDashboardStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error in handleGetDashboardStats:', error);
      res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
  };

  handleGetChartsData = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }

      const chartsData = await this.dashboardService.getChartsData(
        startDate as string,
        endDate as string
      );
      res.status(200).json(chartsData);
    } catch (error) {
      console.error('Error in handleGetChartsData:', error);
      res.status(500).json({ message: 'Error fetching charts data' });
    }
  };
}