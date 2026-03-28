import axios, { AxiosError, type AxiosInstance } from "axios";

export type AsaasEnvironment = "sandbox" | "production";
export type AsaasBillingType = "PIX" | "BOLETO";
export type AsaasSubscriptionCycle =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

export type AsaasCustomerPayload = {
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
};

export type AsaasPaymentPayload = {
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
};

export type AsaasSubscriptionPayload = {
  customer: string;
  billingType: AsaasBillingType;
  cycle: AsaasSubscriptionCycle;
  value: number;
  nextDueDate: string;
  description: string;
  externalReference?: string;
};

export type AsaasInvoicePayload = {
  payment?: string;
  customer?: string;
  serviceDescription: string;
  value: number;
  effectiveDate?: string;
  observations?: string;
  municipalServiceId?: string;
  municipalServiceCode?: string;
  municipalServiceName?: string;
  deductions?: number;
  taxes?: {
    retainIss?: boolean;
    iss?: number;
    cofins?: number;
    csll?: number;
    inss?: number;
    ir?: number;
    pis?: number;
  };
};

export type AsaasListResponse<T extends Record<string, unknown>> = {
  object?: string;
  hasMore?: boolean;
  totalCount?: number;
  limit?: number;
  offset?: number;
  data: T[];
};

export type AsaasCustomerRecord = Record<string, unknown> & {
  id: string;
  name?: string | null;
  cpfCnpj?: string | null;
  email?: string | null;
  mobilePhone?: string | null;
  address?: string | null;
  externalReference?: string | null;
};

export type AsaasPaymentRecord = Record<string, unknown> & {
  id: string;
  customer: string;
  subscription?: string | null;
  status?: string | null;
  billingType?: string | null;
  description?: string | null;
  value?: number | string | null;
  dueDate?: string | null;
  externalReference?: string | null;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  deleted?: boolean | string | null;
};

export type AsaasPixQrCodeRecord = Record<string, unknown> & {
  encodedImage?: string | null;
  payload?: string | null;
  copyPasteKey?: string | null;
};

export type AsaasSubscriptionRecord = Record<string, unknown> & {
  id: string;
  customer: string;
  status?: string | null;
  billingType?: string | null;
  cycle?: string | null;
  description?: string | null;
  value?: number | string | null;
  nextDueDate?: string | null;
  externalReference?: string | null;
};

export type AsaasInvoiceRecord = Record<string, unknown> & {
  id: string;
  payment?: string | null;
  status?: string | null;
  value?: number | string | null;
  effectiveDate?: string | null;
  invoiceNumber?: string | number | null;
  serviceDescription?: string | null;
  pdfUrl?: string | null;
  xmlUrl?: string | null;
  verificationCode?: string | null;
  validationCode?: string | null;
  errorDescription?: string | null;
  observations?: string | null;
  authorizedAt?: string | null;
  cancelledAt?: string | null;
};

export type AsaasTransferRecord = Record<string, unknown> & {
  id: string;
  status?: string | null;
  value?: number | string | null;
  amount?: number | string | null;
  netValue?: number | string | null;
  transferDate?: string | null;
  effectiveDate?: string | null;
  scheduleDate?: string | null;
  scheduledDate?: string | null;
  transferType?: string | null;
  operationType?: string | null;
  externalReference?: string | null;
  bankAccount?: Record<string, unknown> | null;
};

export type AsaasFinancialTransactionRecord = Record<string, unknown> & {
  id?: string | number | null;
  type?: string | null;
  transactionType?: string | null;
  entryType?: string | null;
  status?: string | null;
  value?: number | string | null;
  amount?: number | string | null;
  balance?: number | string | null;
  description?: string | null;
  date?: string | null;
  transactionDate?: string | null;
  effectiveDate?: string | null;
  payment?: string | Record<string, unknown> | null;
  transfer?: string | Record<string, unknown> | null;
  invoice?: string | Record<string, unknown> | null;
};

export type AsaasBalanceRecord = Record<string, unknown> & {
  balance?: number | string | null;
};

export class AsaasRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "AsaasRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export function getAsaasBaseUrl(environment: AsaasEnvironment, apiBaseUrl?: string | null) {
  if (apiBaseUrl) return apiBaseUrl;
  return environment === "production"
    ? "https://api.asaas.com"
    : "https://api-sandbox.asaas.com";
}

function normalizeDigits(value?: string | null) {
  return value?.replace(/\D/g, "") || undefined;
}

export function mapClientToAsaasCustomer(input: {
  id: number;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  return {
    name: input.name,
    cpfCnpj: normalizeDigits(input.document),
    email: input.email || undefined,
    mobilePhone: normalizeDigits(input.phone),
    address: input.address || undefined,
    externalReference: `financepro-client-${input.id}`,
    notificationDisabled: false,
  } satisfies AsaasCustomerPayload;
}

export class AsaasClient {
  private readonly client: AxiosInstance;

  constructor(apiKey: string, environment: AsaasEnvironment, apiBaseUrl?: string | null) {
    this.client = axios.create({
      baseURL: getAsaasBaseUrl(environment, apiBaseUrl),
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
      timeout: 20_000,
    });
  }

  private async request<T>(fn: () => Promise<{ data: T }>): Promise<T> {
    try {
      const { data } = await fn();
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new AsaasRequestError(
          error.response?.data?.errors?.[0]?.description ||
            error.response?.data?.message ||
            error.message,
          error.response?.status ?? 500,
          error.response?.data
        );
      }
      throw error;
    }
  }

  async testConnection() {
    return this.request<AsaasListResponse<AsaasCustomerRecord>>(() =>
      this.client.get("/v3/customers", { params: { limit: 1 } })
    );
  }

  async listCustomers(params?: Record<string, unknown>) {
    return this.request<AsaasListResponse<AsaasCustomerRecord>>(() =>
      this.client.get("/v3/customers", { params })
    );
  }

  async createCustomer(payload: AsaasCustomerPayload) {
    return this.request<AsaasCustomerRecord>(() => this.client.post("/v3/customers", payload));
  }

  async updateCustomer(customerId: string, payload: Partial<AsaasCustomerPayload>) {
    return this.request<AsaasCustomerRecord>(() =>
      this.client.post(`/v3/customers/${customerId}`, payload)
    );
  }

  async listPayments(params?: Record<string, unknown>) {
    return this.request<AsaasListResponse<AsaasPaymentRecord>>(() =>
      this.client.get("/v3/payments", { params })
    );
  }

  async getPayment(paymentId: string) {
    return this.request<AsaasPaymentRecord>(() => this.client.get(`/v3/payments/${paymentId}`));
  }

  async createPayment(payload: AsaasPaymentPayload) {
    return this.request<AsaasPaymentRecord>(() => this.client.post("/v3/payments", payload));
  }

  async cancelPayment(paymentId: string) {
    return this.request<Record<string, unknown>>(() =>
      this.client.delete(`/v3/payments/${paymentId}`)
    );
  }

  async getPixQrCode(paymentId: string) {
    return this.request<AsaasPixQrCodeRecord>(() =>
      this.client.get(`/v3/payments/${paymentId}/pixQrCode`)
    );
  }

  async listSubscriptions(params?: Record<string, unknown>) {
    return this.request<AsaasListResponse<AsaasSubscriptionRecord>>(() =>
      this.client.get("/v3/subscriptions", { params })
    );
  }

  async getSubscription(subscriptionId: string) {
    return this.request<AsaasSubscriptionRecord>(() =>
      this.client.get(`/v3/subscriptions/${subscriptionId}`)
    );
  }

  async createSubscription(payload: AsaasSubscriptionPayload) {
    return this.request<AsaasSubscriptionRecord>(() =>
      this.client.post("/v3/subscriptions", payload)
    );
  }

  async cancelSubscription(subscriptionId: string) {
    return this.request<Record<string, unknown>>(() =>
      this.client.delete(`/v3/subscriptions/${subscriptionId}`)
    );
  }

  async listInvoices(params?: Record<string, unknown>) {
    return this.request<AsaasListResponse<AsaasInvoiceRecord>>(() =>
      this.client.get("/v3/invoices", { params })
    );
  }

  async listTransfers(params?: Record<string, unknown>) {
    return this.request<AsaasListResponse<AsaasTransferRecord>>(() =>
      this.client.get("/v3/transfers", { params })
    );
  }

  async getTransfer(transferId: string) {
    return this.request<AsaasTransferRecord>(() => this.client.get(`/v3/transfers/${transferId}`));
  }

  async listFinancialTransactions(params?: Record<string, unknown>) {
    return this.request<AsaasListResponse<AsaasFinancialTransactionRecord>>(() =>
      this.client.get("/v3/financialTransactions", { params })
    );
  }

  async getBalance() {
    return this.request<AsaasBalanceRecord>(() => this.client.get("/v3/finance/balance"));
  }

  async getInvoice(invoiceId: string) {
    return this.request<AsaasInvoiceRecord>(() => this.client.get(`/v3/invoices/${invoiceId}`));
  }

  async scheduleInvoice(payload: AsaasInvoicePayload) {
    const { taxes, ...rest } = payload;
    return this.request<AsaasInvoiceRecord>(() =>
      this.client.post("/v3/invoices", { ...rest, ...(taxes ?? {}) })
    );
  }

  async updateInvoice(invoiceId: string, payload: Partial<AsaasInvoicePayload>) {
    const { taxes, ...rest } = payload;
    return this.request<AsaasInvoiceRecord>(() =>
      this.client.put(`/v3/invoices/${invoiceId}`, { ...rest, ...(taxes ?? {}) })
    );
  }
}
