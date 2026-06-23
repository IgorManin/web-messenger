import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

const ONLINE_KEY_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.get<string>("redis.url")!);
  }

  async setOnline(userId: number): Promise<void> {
    await this.client.set(`online:${userId}`, "1", "EX", ONLINE_KEY_TTL_SECONDS);
  }

  async clearOnline(userId: number): Promise<void> {
    await this.client.del(`online:${userId}`);
  }

  async isOnline(userId: number): Promise<boolean> {
    const value = await this.client.get(`online:${userId}`);
    return value !== null;
  }

  async filterOnline(userIds: number[]): Promise<number[]> {
    if (userIds.length === 0) return [];

    const keys = userIds.map((id) => `online:${id}`);
    const values = await this.client.mget(...keys);

    return userIds.filter((_, index) => values[index] !== null);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
