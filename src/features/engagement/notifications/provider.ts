export type NewArrivalNotification = {
  productId: string;
  productName: string;
  productUrl: string;
};

export interface NotificationProvider {
  notifyNewArrival(event: NewArrivalNotification): Promise<void>;
}

// Intentionally unconfigured until the shop approves a delivery channel/provider.
export function getNotificationProvider(): NotificationProvider | null {
  return null;
}
