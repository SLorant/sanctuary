export interface ShopItem {
	id: number;
	name: string;
	pointCost: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface ShopItemWithPurchases extends ShopItem {
	purchaseCount: number;
}
