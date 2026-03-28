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

export class UazapiClient {
  private readonly client: AxiosInstance;
  private readonly instanceId: string;

  constructor(config: UazapiConfig) {
    this.instanceId = config.instanceId;
    this.client = axios.create({
      baseURL: config.apiBaseUrl.replace(/\/$/, ""),
      timeout: 20_000,
      headers: {
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

  async getInstanceStatus() {
    return this.request<Record<string, unknown>>(() =>
      this.client.get(`/instance/status/${this.instanceId}`)
    );
  }

  async configureWebhook(url: string) {
    return this.request<Record<string, unknown>>(() =>
      this.client.post(`/webhook/edit/${this.instanceId}`, {
        url,
        enabled: true,
        local_map: false,
      })
    );
  }

  async sendTextMessage(phoneNumber: string, message: string) {
    return this.request<Record<string, unknown>>(() =>
      this.client.post(`/message/sendText/${this.instanceId}`, {
        number: phoneNumber.replace(/\D/g, ""),
        text: message,
      })
    );
  }
}

export function normalizeWhatsAppPhone(value: string) {
  return value.replace(/\D/g, "");
}
