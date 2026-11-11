// Mock data for the admin dashboard. Replace with API calls after backend integration.

export type ContactRequest = {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  country: string;
  product: string;
  status: "new" | "in-progress" | "closed";
  date: string;
};

export type QuoteRequest = {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  country: string;
  product: string;
  quantity: string;
  status: "pending" | "sent" | "won" | "lost";
  date: string;
};

export type Product = {
  id: string;
  name: string;
  category: "Fruits" | "Vegetables";
  trade: "Export Products" | "Import Products";
  description: string;
  image: string;
  order: number;
  published: boolean;
};

export type Market = {
  id: string;
  country: string;
  region: string;
  volume: string;
};

export const contactRequests: ContactRequest[] = [
  { id: "c1", company: "EuroFresh GmbH", contactPerson: "Hans Müller", email: "hans@eurofresh.de", country: "Germany", product: "Oranges", status: "new", date: "2026-07-24" },
  { id: "c2", company: "Al Noor Trading", contactPerson: "Ahmed Farouk", email: "ahmed@alnoor.ae", country: "UAE", product: "Grapes", status: "in-progress", date: "2026-07-22" },
  { id: "c3", company: "Nordic Produce AB", contactPerson: "Erik Larsson", email: "erik@nordic.se", country: "Sweden", product: "Pomegranates", status: "closed", date: "2026-07-20" },
  { id: "c4", company: "Fresh Bazaar Ltd", contactPerson: "Priya Sharma", email: "priya@freshbazaar.in", country: "India", product: "Mangoes", status: "new", date: "2026-07-18" },
  { id: "c5", company: "Meridian Foods", contactPerson: "James Carter", email: "j.carter@meridian.co.uk", country: "United Kingdom", product: "Strawberries", status: "in-progress", date: "2026-07-16" },
];

export const quoteRequests: QuoteRequest[] = [
  { id: "q1", company: "EuroFresh GmbH", contactPerson: "Hans Müller", email: "hans@eurofresh.de", country: "Germany", product: "Oranges", quantity: "20 tons", status: "pending", date: "2026-07-25" },
  { id: "q2", company: "Gulf Fruits Co", contactPerson: "Salem Al-Otaibi", email: "salem@gulffruits.sa", country: "Saudi Arabia", product: "Potatoes", quantity: "50 tons", status: "sent", date: "2026-07-23" },
  { id: "q3", company: "Nordic Produce AB", contactPerson: "Erik Larsson", email: "erik@nordic.se", country: "Sweden", product: "Pomegranates", quantity: "10 tons", status: "won", date: "2026-07-21" },
];

export const products: Product[] = [
  { id: "p1", name: "Oranges", category: "Fruits", trade: "Export Products", description: "Export-grade Valencia oranges", image: "/assets/oranges.jpg", order: 1, published: true },
  { id: "p2", name: "Grapes", category: "Fruits", trade: "Export Products", description: "Fresh table grapes", image: "/placeholder.svg", order: 2, published: true },
  { id: "p3", name: "Mangoes", category: "Fruits", trade: "Export Products", description: "Sweet Egyptian mangoes", image: "/placeholder.svg", order: 3, published: true },
  { id: "p4", name: "Pomegranates", category: "Fruits", trade: "Export Products", description: "Ruby-red pomegranates", image: "/placeholder.svg", order: 4, published: true },
  { id: "p5", name: "Potatoes", category: "Vegetables", trade: "Export Products", description: "Export-grade potatoes", image: "/placeholder.svg", order: 5, published: true },
  { id: "p6", name: "Onions", category: "Vegetables", trade: "Export Products", description: "Yellow and red onions", image: "/placeholder.svg", order: 6, published: true },
  { id: "p7", name: "Garlic", category: "Vegetables", trade: "Export Products", description: "White garlic bulbs", image: "/placeholder.svg", order: 7, published: false },
];

export const markets: Market[] = [
  { id: "m1", country: "Germany", region: "Europe", volume: "High" },
  { id: "m2", country: "United Kingdom", region: "Europe", volume: "High" },
  { id: "m3", country: "UAE", region: "Middle East", volume: "High" },
  { id: "m4", country: "Saudi Arabia", region: "Middle East", volume: "Medium" },
  { id: "m5", country: "Russia", region: "Europe", volume: "Medium" },
  { id: "m6", country: "India", region: "Asia", volume: "Medium" },
];

export const recentActivity = [
  { id: "a1", text: "New contact request from EuroFresh GmbH", time: "2h ago" },
  { id: "a2", text: "Quote sent to Gulf Fruits Co", time: "5h ago" },
  { id: "a3", text: "Product 'Mangoes' updated", time: "1d ago" },
  { id: "a4", text: "New market added: Russia", time: "2d ago" },
  { id: "a5", text: "SEO settings updated", time: "3d ago" },
];
