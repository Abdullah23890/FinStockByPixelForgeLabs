export function calcSaleProfit(sale) {
    let itemsProfit = 0;
    let totalQty = 0;
    let returnedQty = 0;

    for (const item of sale.items || []) {
        const qty = Number(item.quantity || 0);
        const retQty = Number(item.returnQuantity || 0);
        const purchasePrice = Number(item.purchasePrice ?? item.batch?.purchasePrice ?? 0);
        const unitPrice = Number(item.unitPrice || 0);
        const itemDiscount = Number(item.discount || 0);

        // Use stored item.profit if available, else compute from unitPrice, purchasePrice, and discount
        const itemProfit = item.profit != null
            ? Number(item.profit)
            : ((unitPrice - purchasePrice) * qty - itemDiscount);

        const returnedProfit = qty > 0 ? (itemProfit / qty) * retQty : 0;
        itemsProfit += itemProfit - returnedProfit;

        totalQty += qty;
        returnedQty += retQty;
    }

    const billDiscount = Number(sale.discount || 0);
    const remainingRatio = totalQty > 0 ? Math.max((totalQty - returnedQty) / totalQty, 0) : 1;
    const effectiveBillDiscount = billDiscount * remainingRatio;

    return itemsProfit - effectiveBillDiscount;
}

export function calcTotalProfit(sales = []) {
    return sales.reduce((sum, sale) => sum + calcSaleProfit(sale), 0);
}