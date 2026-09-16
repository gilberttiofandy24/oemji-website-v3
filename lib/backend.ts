import "server-only";
import crypto from "node:crypto";

const BASE_URL = (process.env.API_URL ?? "http://localhost:5050/api/v2").replace(/\/$/, "");
const SIGNATURE_SECRET = process.env.API_SIGNATURE_SECRET ?? "";

function signRequest() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", SIGNATURE_SECRET).update(timestamp).digest("hex");
  return { "X-Timestamp": timestamp, "X-Signature": signature };
}

async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...signRequest(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`backend ${path} returned ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface PublicProductInputFieldOption {
  label: string;
  value: string;
}

export interface PublicProductInputField {
  key: string;
  label: string;
  type: string;
  show: boolean;
  sort_order: number;
  options?: PublicProductInputFieldOption[];
}

export interface PublicProductItem {
  id: string;
  name: string;
  slug: string;
  display_name: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  input_fields: PublicProductInputField[];
  customer_no_format: string | null;
  seo_aliases: string[];
  is_hot: boolean;
}

export interface PublicProductDenomItem {
  id: string;
  group_id: string | null;
  group_name: string | null;
  group_sort_order: number;
  denom: string;
  denom_type: string | null;
  sell_price: string;
  stock_status: boolean;
  sort_order: number;
  image_url: string | null;
}

interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    has_prev_page: boolean;
    limit: number;
  };
}

interface ResponseData<T> {
  message: string;
  data: T;
}

export interface GetPublicProductsQuery {
  page?: number;
  limit?: number;
  name?: string;
  category?: string;
  take_all?: boolean;
  is_hot?: boolean;
}

const PRODUCT_REVALIDATE_SECONDS = 300;

export async function getPublicProducts(
  query: GetPublicProductsQuery = {},
): Promise<PaginatedResponse<PublicProductItem>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return backendFetch(`/public/product?${params.toString()}`, {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<ResponseData<{ product: PublicProductItem; denoms: PublicProductDenomItem[] }>> {
  return backendFetch(`/public/product/${slug}`, {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });
}

export interface PublicCarouselItem {
  id: string;
  image_url: string | null;
  title: string | null;
  product_slug: string | null;
  link_url: string | null;
  sort_order: number;
}

export async function getPublicCarousels(): Promise<ResponseData<PublicCarouselItem[]>> {
  return backendFetch("/carousel", {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });
}

export async function getPublicTerms(): Promise<ResponseData<{ content: string }>> {
  return backendFetch("/terms", {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });
}

export interface ContactUsPayload {
  email: string;
  phone_number: string;
  message: string;
}

export async function submitContactUs(
  payload: ContactUsPayload,
): Promise<ResponseData<{ id: string }>> {
  return backendFetch("/contact-us", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
