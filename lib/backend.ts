import "server-only";
import crypto from "node:crypto";

const BASE_URL = (process.env.API_URL ?? "http://localhost:5050/api/v2").replace(/\/$/, "");
const SIGNATURE_SECRET = process.env.API_SIGNATURE_SECRET ?? "";

function signRequest() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", SIGNATURE_SECRET).update(timestamp).digest("hex");
  return { "X-Timestamp": timestamp, "X-Signature": signature };
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...signRequest(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? `backend ${path} returned ${res.status}`, body?.code);
  }
  return res.json() as Promise<T>;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
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

export interface PaginatedResponse<T> {
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

export interface PaymentMethodItem {
  id: string;
  name: string;
  group_name: string;
  type: string;
  bank_name: string | null;
  image_url: string | null;
  fee_flat: string;
  fee_percent: string;
  sort_order: number;
}

export interface PaymentMethodGroup {
  group: string;
  methods: PaymentMethodItem[];
}

function groupPaymentMethods(items: PaymentMethodItem[]): PaymentMethodGroup[] {
  const groups = new Map<string, PaymentMethodItem[]>();
  for (const item of items) {
    const list = groups.get(item.group_name) ?? [];
    list.push(item);
    groups.set(item.group_name, list);
  }
  return Array.from(groups.entries()).map(([group, methods]) => ({
    group,
    methods: [...methods].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getPublicPaymentMethods(): Promise<ResponseData<PaymentMethodGroup[]>> {
  const res = await backendFetch<ResponseData<PaymentMethodItem[]>>("/payment-methods", {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });
  return { ...res, data: groupPaymentMethods(res.data) };
}

export interface ValidatePromoCodePayload {
  code: string;
  product_id: string;
  subtotal: string;
}

export interface ValidatePromoCodeData {
  code: string;
  discount_amount: string;
  final_amount: string;
}

export async function validatePromoCode(
  payload: ValidatePromoCodePayload,
): Promise<ResponseData<ValidatePromoCodeData>> {
  return backendFetch("/promo-code/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ValidatePublicOrderPayload {
  product_denom_id: string;
  inputs: Record<string, string>;
}

export interface ValidatePublicOrderData {
  customer_no: string;
  nickname: string | null;
  region: string | null;
  skipped: boolean;
}

export async function validatePublicOrder(
  payload: ValidatePublicOrderPayload,
): Promise<ResponseData<ValidatePublicOrderData>> {
  return backendFetch("/public/order/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface UserAccount {
  id: string;
  username: string;
  full_name: string;
  email: string;
}

export interface SignInResponse {
  token: string;
  account: UserAccount;
}

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
  phone: string;
  is_reseller: boolean;
}

export async function signUpUser(payload: SignUpPayload): Promise<ResponseData<SignInResponse>> {
  return backendFetch("/auth/user/sign-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifySignUpOtp(
  token: string,
  otp: string,
): Promise<ResponseData<SignInResponse>> {
  return backendFetch("/auth/user/sign-up-otp", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ otp }),
  });
}

export async function signInUser(payload: {
  identifier: string;
  password: string;
}): Promise<ResponseData<SignInResponse>> {
  return backendFetch("/auth/user/sign-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(token: string): Promise<void> {
  await backendFetch("/auth/user/logout", {
    method: "POST",
    headers: authHeader(token),
  });
}

export async function logoutAllUser(token: string): Promise<void> {
  await backendFetch("/auth/user/logout-all", {
    method: "POST",
    headers: authHeader(token),
  });
}

export interface MeUserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  is_reseller: boolean;
  is_verified: boolean;
  last_login_at?: string;
}

export async function getMeUser(token: string): Promise<ResponseData<MeUserData>> {
  return backendFetch("/auth/user/me", {
    headers: authHeader(token),
    cache: "no-store",
  });
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export async function changePasswordUser(token: string, payload: ChangePasswordPayload): Promise<void> {
  await backendFetch("/auth/user/change-password", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export interface CartItemData {
  id: string;
  product_denom_id: string;
  product_name: string;
  denom_name: string;
  image_url: string | null;
  sell_price: string;
  quantity: number;
  inputs: Record<string, string>;
  is_available: boolean;
  created_at: string;
}

export async function getCart(token: string): Promise<ResponseData<CartItemData[]>> {
  return backendFetch("/cart", { headers: authHeader(token) });
}

export interface AddCartItemPayload {
  product_denom_id: string;
  quantity: number;
  inputs: Record<string, string>;
}

export async function addCartItem(
  token: string,
  payload: AddCartItemPayload,
): Promise<ResponseData<CartItemData>> {
  return backendFetch("/cart", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function updateCartItemQuantity(
  token: string,
  id: string,
  quantity: number,
): Promise<ResponseData<CartItemData>> {
  return backendFetch(`/cart/${id}`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(token: string, id: string): Promise<void> {
  await backendFetch(`/cart/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

export async function clearCart(token: string): Promise<void> {
  await backendFetch("/cart", {
    method: "DELETE",
    headers: authHeader(token),
  });
}

export interface CheckoutItemPayload {
  product_denom_id: string;
  inputs: Record<string, string>;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItemPayload[];
  payment_method_id: string;
  phone_number: string;
}

export interface CheckoutData {
  batch_id: string;
  ref_id: string;
  total_amount: string;
  partner_service_id: string;
  va_number: string;
  expired_at: string;
}

export async function checkout(
  token: string,
  payload: CheckoutPayload,
): Promise<ResponseData<CheckoutData>> {
  return backendFetch("/order/checkout", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export interface CheckoutStatusItem {
  ref_id: string;
  product_name: string;
  denom_name: string;
  nickname: string | null;
  status: string;
  serial_number: string | null;
}

export interface CheckoutStatusData {
  batch_id: string;
  ref_id: string;
  status: string;
  total_amount: string;
  partner_service_id: string;
  va_number: string;
  expired_at: string;
  items: CheckoutStatusItem[];
}

export async function getCheckoutStatus(refId: string): Promise<ResponseData<CheckoutStatusData>> {
  return backendFetch(`/public/order/checkout/${refId}`, {
    cache: "no-store",
  });
}

export interface OrderHistoryItem {
  ref_id: string;
  status: string;
  total_amount: string;
  item_count: number;
  product_names: string[];
  created_at: string;
}

export async function getOrderHistory(
  token: string,
  page: number,
): Promise<PaginatedResponse<OrderHistoryItem>> {
  return backendFetch(`/order/history?page=${page}`, {
    headers: authHeader(token),
    cache: "no-store",
  });
}
