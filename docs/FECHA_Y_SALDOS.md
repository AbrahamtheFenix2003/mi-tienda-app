# Gestión de Fechas y Saldos en Movimientos de Caja y Compras

Este documento explica las mejoras y correcciones implementadas en el sistema para la gestión de fechas y la coherencia de saldos, especialmente en los módulos de Movimientos de Caja y Compras.

## 1. Contexto del Problema Original

El sistema funcionaba en un servidor configurado en la Zona Horaria Universal Coordinada (UTC), mientras que la operación del negocio se realiza en la Zona Horaria de Perú (America/Lima, UTC-5). Esta diferencia causaba varios problemas:

*   **Ordenamiento incorrecto de movimientos:** Los movimientos de caja registrados como "hoy" aparecían desordenados o "debajo" de movimientos anteriores, causando cálculos de saldo erróneos.
*   **Pérdida de precisión horaria:** Si un usuario registraba un movimiento manual para "hoy" con una hora específica (ej. "hoy a las 10 AM"), el sistema sobrescribía esa hora con el momento actual de registro (ej. "hoy a las 5 PM").
*   **Riesgo de "teletransporte":** Una lógica de desempate prematura podría haber enviado movimientos de "hoy" a fechas futuras si existían registros con fechas erróneas o programadas.
*   **Desorden en la lista de compras:** Las compras del mismo día no se mostraban consistentemente ordenadas.

## 2. Soluciones Implementadas

Para abordar estos problemas, se realizaron las siguientes modificaciones:

### 2.1 Detección Inteligente de "Hoy" en Movimientos de Caja (`apps/backend/src/services/cash.service.ts`)

*   **Problema resuelto:** La interpretación de "hoy" era errónea debido a la diferencia horaria UTC vs. Perú. Un registro de "hoy" (2 de diciembre 8 PM Perú) era interpretado como "ayer" (1 de diciembre 7 PM Perú) por la conversión de UTC a hora peruana.
*   **Cómo se solucionó:**
    *   Se utiliza `Intl.DateTimeFormat` configurado con `timeZone: 'America/Lima'` para obtener la fecha de "hoy" y la fecha de entrada del usuario, ambas en el contexto de la zona horaria de Perú.
    *   Esto permite una comparación precisa: `inputDateString === todayPeru` ahora realmente verifica si el usuario se refiere al mismo día calendario en Perú.
*   **Resultado esperado:** Los movimientos manuales registrados para "hoy" son ahora correctamente identificados como tales, sin importar la hora del servidor UTC.

### 2.2 Preservación de Hora Específica en Movimientos Manuales (`apps/backend/src/services/cash.service.ts`)

*   **Problema resuelto:** Se sobrescribía la hora específica del usuario (ej. 10 AM) con la hora actual de registro (ej. 5 PM) si la fecha era "hoy".
*   **Cómo se solucionó:**
    *   Se añade una verificación (`isDateOnlyInput`) para determinar si el input original (`data.date`) era solo una fecha (ej. "YYYY-MM-DD", longitud 10).
    *   Si la fecha es "hoy" **Y** el input era solo la fecha, se usa la hora actual (`now`).
    *   Si la fecha es "hoy" **Y** el input incluía una hora específica (ej. "YYYY-MM-DDTHH:mm:ss"), se respeta esa hora específica.
*   **Resultado esperado:** Los movimientos manuales de "hoy" ahora preservan la hora exacta si el usuario la especificó, o usan la hora actual si solo se dio la fecha.

### 2.3 Desempate Temporal y Protección contra Futuros (`apps/backend/src/services/cash.service.ts`)

*   **Problema resuelto:**
    1.  Colisión de movimientos: Si dos movimientos se registraban casi al mismo tiempo (ej. una Compra y un Movimiento Manual), podían aparecer desordenados o con saldos incorrectos.
    2.  Teletransporte: Si por error existía un movimiento con fecha lejana en el futuro (ej. año 2030), la lógica anterior podía empujar un movimiento de "hoy" a esa fecha futura.
*   **Cómo se solucionó:**
    *   **Desempate:** Si la fecha del movimiento es "hoy" y se detecta que hay un movimiento previo con la misma fecha o posterior (lo que indica una colisión o un orden incorrecto), el nuevo movimiento se registra `1 segundo después` del último movimiento válido. Esto asegura un orden cronológico estricto y correcto para el cálculo de saldos.
    *   **Protección contra futuros:** La búsqueda del "último movimiento" ahora está limitada a fechas hasta `el momento actual + 1 minuto`. Esto garantiza que movimientos erróneos o programados en el futuro no sean considerados, evitando que los movimientos de "hoy" sean "teletransportados".
*   **Resultado esperado:** Todos los movimientos de caja para "hoy" se ordenan correctamente y reflejan el saldo real en tiempo real. La robustez del sistema frente a datos atípicos mejora.

### 2.4 Ordenamiento Consistente en Listado de Compras (`apps/backend/src/services/purchases.service.ts`)

*   **Problema resuelto:** Las compras del mismo día podían aparecer en un orden inconsistente.
*   **Cómo se solucionó:**
    *   Se modificó la cláusula `orderBy` en la consulta `getAllPurchases` para ordenar primero por `purchaseDate` de forma descendente, y luego, en caso de empate (compras el mismo día), por `createdAt` (fecha de creación del registro) también de forma descendente.
*   **Resultado esperado:** Las compras ahora se listan de la más reciente a la más antigua. Si hay varias compras el mismo día, se mostrará primero la que fue registrada más recientemente en el sistema.

## 3. Consideración Importante: Fecha de Compra vs. Movimiento de Caja de Compra

Se debatió la coherencia entre la `purchaseDate` (fecha contable de la compra) y la fecha del `CashMovement` asociado a esa compra.

*   **Decisión:** Se mantuvo la práctica de que el `CashMovement` asociado a una compra siempre usa `new Date()` (fecha y hora actual del registro).
*   **Razón:** Debido a que la caja funciona como un reflejo en tiempo real de un saldo bancario (sin cierres diarios/mensuales), es crítico que el saldo se actualice matemáticamente de forma estricta en el momento en que se registra la operación. Forzar el movimiento de caja a una fecha pasada habría introducido complejidad en la recalculación de saldos y podría haber roto la integridad del saldo en tiempo real, lo cual es la prioridad para el cliente.
*   **Impacto:** Si se registra una compra con fecha de ayer, la compra en sí tendrá fecha de ayer, pero el dinero se verá reflejado como salida de caja "hoy", garantizando la integridad del saldo "en este momento".

---
