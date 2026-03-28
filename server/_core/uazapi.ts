import axios, { AxiosError, type AxiosInstance } from "axios";

export class UazapiRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "UazapiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export type UazapiConfig = {
  apiBaseUrl: string;
  apiToken: string;
  instanceId: string;
};

function isLegacyRouteError(error: unknown) {
  return error instanceof UazapiRequestError && (error.status === 404 || error.status === 405);
}

export class UazapiClient {
  private readonly client: AxiosInstance;
  private readonly instanceId: string;

  constructor(config: UazapiConfig) {
    this.instanceId = config.instanceId;
    this.client = axios.create({
      baseURL: config.apiBaseUrl.replace(/\/$/, ""),
      timeout: 20_000,
      headers: {
        token: config.apiToken,
        apikey: config.apiToken,
        "Content-Type": "application/json",
      },
    });
  }

  private async request<T>(fn: () => Promise<{ data: T }>): Promise<T> {
    try {
      const { data } = await fn();
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new UazapiRequestError(
          (error.response?.data as any)?.message ||
            (error.response?.data as any)?.error ||
            error.message,
          error.response?.status ?? 500,
          error.response?.data
        );
      }
      throw error;
    }
  }

  private async withLegacyFallback<T>(primary: () => Promise<T>, legacy: () => Promise<T>): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      if (!isLegacyRouteError(error)) {
        throw error;
      }
    }

    return legacy();
  }

  async getInstanceStatus() {
    return this.withLegacyFallback(
      () =>
        this.request<Record<string, unknown>>(() =>
          this.client.get("/instance/status")
        ),
      () =>
        this.request<Record<string, unknown>>(() =>
          this.client.get(`/instance/status/${this.instanceId}`)
        )
    );
  }

  async configureWebhook(url: string) {
    return this.withLegacyFallback(
      () =>
        this.request<Record<string, unknown>>(() =>
          this.client.post("/webhook", {
            enabled: true,
            url,
            events: ["messages", "connection"],
            excludeMessages: ["wasSentByApi"],
            addUrlEvents: false,
            addUrlTypesMessages: false,
          })
        ),
      () =>
        this.request<Record<string, unknown>>(() =>
          this.client.post(`/webhook/edit/${this.instanceId}`, {
            url,
            enabled: true,
            local_map: false,
          })
        )
    );
  }

  async sendTextMessage(phoneNumber: string, message: string) {
    const normalizedNumber = phoneNumber.includes("@")
      ? phoneNumber.trim()
      : phoneNumber.replace(/\D/g, "");

    return this.withLegacyFallback(
      () =>
        this.request<Record<string, unknown>>(() =>
          this.client.post("/send/text", {
            number: normalizedNumber,
            text: message,
          })
        ),
      () =>
        this.request<Record<string, unknown>>(() =>
          this.client.post(`/message/sendText/${this.instanceId}`, {
            number: normalizedNumber,
            text: message,
          })
        )
    );
  }
}

export function normalizeWhatsAppPhone(value: string) {
  return value.includes("@") ? value.trim() : value.replace(/\D/g, "");
}
