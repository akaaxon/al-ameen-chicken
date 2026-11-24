// Per-browser memory of the customer, so the bag and the points page can show
// their points without a login. Order IDs are random UUIDs: holding one is what
// lets this device see that order's status (a phone number alone never does).

export type CustomerDetails = {
  name: string;
  phone: string;
  address: string;
};

const CUSTOMER_KEY = "chimkin_customer";
const ORDERS_KEY = "chimkin_orders";
const MAX_ORDERS = 20;

export function readSavedCustomer(): CustomerDetails | null {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "null");
    return saved?.phone ? saved : null;
  } catch {
    return null;
  }
}

export function saveCustomer(details: CustomerDetails) {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(details));
  } catch {}
}

export function readOrderIds(): string[] {
  try {
    const ids = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveOrderId(id: string) {
  try {
    const ids = [id, ...readOrderIds().filter((x) => x !== id)].slice(0, MAX_ORDERS);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(ids));
  } catch {}
}
