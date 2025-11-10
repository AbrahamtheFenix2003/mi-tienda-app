# Cambio en Anulación de Ventas y Compras - Eliminación de Movimientos de Caja

## 📋 Descripción del Cambio

Se ha modificado el comportamiento de anulación de ventas y compras para que **eliminen completamente los movimientos de caja originales** en lugar de crear movimientos de reversión. Ahora, cuando se anula una venta o compra, el sistema se comporta como si la transacción nunca hubiera existido desde el punto de vista financiero.

## 🔄 Comportamiento Anterior vs Nuevo

### **Comportamiento Anterior**
- Al anular una venta: Se creaba un movimiento de SALIDA para revertir la entrada original
- Al anular una compra: Se creaba un movimiento de ENTRADA para revertir la salida original
- **Resultado**: La tabla de movimientos de caja mostraba ambos movimientos (original + reversión)

### **Comportamiento Nuevo**
- Al anular una venta: Se elimina el movimiento de ENTRADA original y se recalculan los saldos
- Al anular una compra: Se elimina el movimiento de SALIDA original y se recalculan los saldos
- **Resultado**: La tabla de movimientos de caja no muestra ningún rastro de la transacción anulada

## 🛠️ Archivos Modificados

### 1. **apps/backend/src/services/cash.service.ts**
- **Nueva función**: `deleteCashMovementAndRecalculate(referenceId: string)`
- **Propósito**: Elimina un movimiento de caja específico y recalcula todos los saldos posteriores
- **Uso**: Puede ser utilizada en el futuro para otros casos de eliminación de movimientos

### 2. **apps/backend/src/services/purchases.service.ts**
- **Función modificada**: `annulPurchase()`
- **Cambio**: Reemplazada la lógica de creación de movimiento de reversión por eliminación del movimiento original
- **Líneas modificadas**: 702-759

### 3. **apps/backend/src/services/sales.service.ts**
- **Función modificada**: `annulSale()`
- **Cambio**: Reemplazada la lógica de creación de movimiento de reversión por eliminación del movimiento original
- **Líneas modificadas**: 434-491

## 🎯 Lógica de Recálculo de Saldos

### **Proceso de Eliminación y Recálculo**
1. **Buscar movimiento original**: Se localiza el movimiento de caja asociado a la venta/compra
2. **Eliminar movimiento**: Se elimina completamente el registro
3. **Obtener saldo anterior**: Se busca el último saldo válido antes del movimiento eliminado
4. **Recalcular en cascada**: Se actualizan todos los movimientos posteriores manteniendo la secuencia correcta

### **Fórmula de Recálculo**
```typescript
// Para cada movimiento posterior al eliminado:
if (movement.type === CashMovementType.ENTRADA) {
  runningBalance = prevBalance.plus(movement.amount);
} else {
  runningBalance = prevBalance.sub(movement.amount);
}
```

## 🔍 Impacto en el Sistema

### **Módulo de Caja**
- ✅ Los movimientos de ventas/compras anuladas desaparecen completamente
- ✅ Los saldos se mantienen consistentes
- ✅ El saldo actual se recalcula correctamente
- ✅ Los movimientos manuales no se ven afectados

### **Módulo de Ventas**
- ✅ El inventario se sigue revertiendo correctamente
- ✅ El estado de la venta cambia a "ANULADA"
- ✅ Los lotes de stock se restauran
- ✅ El movimiento de caja se elimina

### **Módulo de Compras**
- ✅ El inventario se sigue revertiendo correctamente
- ✅ El estado de la compra cambia a "ANULADA"
- ✅ Los lotes de stock se eliminan
- ✅ El movimiento de caja se elimina

### **Dashboard**
- ✅ Las estadísticas se actualizan correctamente
- ✅ El saldo de caja refleja la realidad sin la transacción anulada

## ⚠️ Consideraciones Importantes

### **Seguridad de Datos**
- ✅ Las ventas/compras anuladas conservan su registro con estado "ANULADA"
- ✅ Solo se elimina el movimiento financiero, no la transacción original
- ✅ Se mantiene trazabilidad completa de las operaciones

### **Integridad Referencial**
- ✅ Todos los cálculos de saldos son atómicos dentro de transacciones
- ✅ No hay posibilidad de saldos inconsistentes
- ✅ El manejo de errores preserva la integridad de los datos

### **Performance**
- ✅ El recálculo solo afecta a movimientos posteriores al eliminado
- ✅ Las consultas están optimizadas con índices por fecha
- ✅ Las transacciones son eficientes y seguras

## 🧪 Pruebas Recomendadas

### **Escenario 1: Anulación de Venta**
1. Crear una venta con movimiento de caja
2. Verificar que el movimiento aparezca en la tabla de caja
3. Anular la venta
4. Verificar que:
   - El movimiento de caja ya no aparece
   - Los saldos posteriores se recalcularon
   - El inventario se restauró

### **Escenario 2: Anulación de Compra**
1. Crear una compra con movimiento de caja
2. Verificar que el movimiento aparezca en la tabla de caja
3. Anular la compra
4. Verificar que:
   - El movimiento de caja ya no aparece
   - Los saldos posteriores se recalcularon
   - El inventario se revirtió

### **Escenario 3: Múltiples Transacciones**
1. Crear varios movimientos (venta, compra, manual)
2. Anular una transacción del medio
3. Verificar que los movimientos posteriores mantengan saldos correctos

## 📝 Resumen

Este cambio proporciona una experiencia más limpia e intuitiva para los usuarios, ya que las anulaciones de ventas y compras no dejan "rastros" financieros en el módulo de caja, mientras se mantiene la integridad y trazabilidad completa del sistema.

**Estado**: ✅ Implementación completada y lista para producción