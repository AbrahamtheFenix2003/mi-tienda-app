// utils/queryInvalidation.ts
/**
 * Utility hook centralizado para invalidar queries relacionadas
 * Asegura que todas las vistas se actualicen automáticamente después de mutaciones
 */

import { useQueryClient } from '@tanstack/react-query';

/**
 * Keys de todas las queries usadas en la aplicación
 */
export const QUERY_KEYS = {
  // Productos
  PRODUCTS: ['admin-products'] as const,

  // Compras
  PURCHASES: ['admin-purchases'] as const,

  // Proveedores
  SUPPLIERS: ['admin-suppliers'] as const,

  // Categorías
  CATEGORIES: ['categories'] as const,

  // Ventas (si existe)
  SALES: ['admin-sales'] as const,

  // Gastos
  EXPENSES: ['admin-expenses'] as const,

  // Caja
  CASH_MOVEMENTS: ['cashMovements'] as const,

  // Dashboard
  DASHBOARD_STATS: ['dashboardStats'] as const,

  // Usuarios
  USERS: ['admin-users'] as const,
} as const;

/**
 * Hook que proporciona funciones para invalidar queries relacionadas
 * Uso: const { invalidateProducts, invalidatePurchases, ... } = useInvalidateQueries();
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalida solo la lista de productos
     */
    invalidateProducts: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },

    /**
     * Invalida solo la lista de compras
     */
    invalidatePurchases: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PURCHASES });
    },

    /**
     * Invalida solo la lista de proveedores
     */
    invalidateSuppliers: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
    },

    /**
     * Invalida solo las categorías
     */
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
    },

    /**
     * Invalida solo las ventas
     */
    invalidateSales: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES });
    },

    /**
     * Invalida solo los gastos
     */
    invalidateExpenses: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
    },

    /**
     * Invalida solo los movimientos de caja
     */
    invalidateCashMovements: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASH_MOVEMENTS });
    },

    /**
     * Invalida solo las estadísticas del dashboard
     */
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida solo la lista de usuarios
     */
    invalidateUsers: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },

    /**
     * Invalida queries relacionadas con COMPRAS
     * Uso típico: después de crear/actualizar/anular una compra
     *
     * Invalida:
     * - Lista de compras
     * - Lista de productos (stock actualizado)
     * - Movimientos de caja (si la compra afecta caja)
     * - Dashboard (estadísticas)
     */
    invalidateAfterPurchase: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PURCHASES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASH_MOVEMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida queries relacionadas con VENTAS
     * Uso típico: después de crear/actualizar/anular una venta
     *
     * Invalida:
     * - Lista de ventas
     * - Lista de productos (stock actualizado)
     * - Movimientos de caja
     * - Dashboard (estadísticas)
     */
    invalidateAfterSale: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASH_MOVEMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida queries relacionadas con PRODUCTOS
     * Uso típico: después de crear/actualizar/eliminar un producto
     *
     * Invalida:
     * - Lista de productos
     * - Dashboard (estadísticas)
     */
    invalidateAfterProductChange: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida queries relacionadas con GASTOS
     * Uso típico: después de crear/actualizar/eliminar un gasto
     *
     * Invalida:
     * - Lista de gastos
     * - Movimientos de caja
     * - Dashboard (estadísticas)
     */
    invalidateAfterExpense: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASH_MOVEMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida queries relacionadas con CAJA
     * Uso típico: después de crear/actualizar movimiento manual de caja
     *
     * Invalida:
     * - Movimientos de caja
     * - Dashboard (estadísticas)
     */
    invalidateAfterCashMovement: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASH_MOVEMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida queries relacionadas con PROVEEDORES
     * Uso típico: después de crear/actualizar/eliminar un proveedor
     *
     * Invalida:
     * - Lista de proveedores
     * - Dashboard (si el dashboard muestra info de proveedores)
     */
    invalidateAfterSupplierChange: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    },

    /**
     * Invalida queries relacionadas con CATEGORÍAS
     * Uso típico: después de crear/actualizar/eliminar una categoría
     *
     * Invalida:
     * - Lista de categorías
     * - Lista de productos (productos usan categorías)
     */
    invalidateAfterCategoryChange: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },

    /**
     * Invalida TODAS las queries
     * Uso: solo en casos excepcionales donde se necesita refrescar toda la aplicación
     */
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}
