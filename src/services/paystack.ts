import { workstationApi } from "./api";

interface PublicKeyResponse {
  publicKey: string;
}

let cachedPublicKey: string | null = null;
let inlineLoader: Promise<void> | null = null;

interface PaystackSetupOptions {
  email: string;
  amountKobo: number;
  reference: string;
  publicKey: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

interface PaystackPopHandle {
  openIframe: () => void;
}

interface PaystackPopGlobal {
  setup: (options: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackPopHandle;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopGlobal;
  }
}

export async function getPaystackPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;
  const res = await workstationApi.request<PublicKeyResponse>(
    "/paystack/public-key",
  );
  if (!res.publicKey) {
    throw new Error(
      "Paystack is not configured. Ask an admin to set PAYSTACK_PUBLIC_KEY.",
    );
  }
  cachedPublicKey = res.publicKey;
  return res.publicKey;
}

/**
 * Load Paystack's inline.js once. Subsequent calls reuse the same Promise so
 * we don't insert the script tag multiple times.
 */
export function loadPaystackInline(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (inlineLoader) return inlineLoader;
  inlineLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      inlineLoader = null;
      reject(new Error("Failed to load Paystack inline.js"));
    };
    document.head.appendChild(script);
  });
  return inlineLoader;
}

export async function openPaystackCheckout(
  options: PaystackSetupOptions,
): Promise<void> {
  await loadPaystackInline();
  if (!window.PaystackPop) {
    throw new Error("Paystack failed to initialize");
  }
  const handler = window.PaystackPop.setup({
    key: options.publicKey,
    email: options.email,
    amount: options.amountKobo,
    ref: options.reference,
    currency: options.currency ?? "NGN",
    metadata: options.metadata,
    callback: (response) => options.onSuccess(response.reference),
    onClose: () => options.onClose(),
  });
  handler.openIframe();
}

/**
 * Generate a fresh, locally-unique reference. Paystack just requires it to be
 * unique within the merchant account — `ws_` prefix makes workstation orders
 * easy to filter in the dashboard.
 */
export function newPaystackReference(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `ws_${Date.now()}_${random}`;
}
