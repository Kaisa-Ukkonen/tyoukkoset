export type Entry = {
  id: number;
  date: string | Date;
  description: string | null;
  type: string;
  amount: number;
  vatRate: number;
  paymentMethod: string | null;

  // 🔥 Uusi suhde Kontaktiin
  contactId?: number | null;
  contact?: {
    id: number;
    name: string;
  } | null;

  category: {
    id: number;
    name: string;
    type: string;
    defaultVat: number;
  } | null;

  receipt?: {
    fileUrl: string;
  } | null;

  productUsage?: {
  productId: number;
  quantity: number;
  product: { id: number; name: string } | null;
}[] | null;
};