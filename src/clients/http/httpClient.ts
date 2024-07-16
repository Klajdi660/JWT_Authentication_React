import axios from "axios";
import config from "config";
import { GameConfig } from "../../types";

const { rwgUrl, rwgKey } = config.get<GameConfig>("gamesConfig");

const instance = axios.create({
  baseURL: rwgUrl,
  params: {
    key: rwgKey,
    // key: "f4ef000bfe6749038685cc5a314359e1",
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export class HttpClient {
  static instance = instance;

  static async get<T>(url: string, params?: unknown, options?: any) {
    const response = await this.instance.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data?: unknown, options?: object) {
    const response = await this.instance.post<T>(url, data, options);
    return response.data;
  }
}
