import { Injectable } from '@nestjs/common';
import { DeleteServerDto } from './dto/delete-server.dto';
export interface Server {
  name: string;
  ip: string;
  weight: number;
}
@Injectable()
export class ConsistentHashingService {
  private readonly hashRing = new Map<number, Server>();
  private readonly stableServers = new Map<string, number[]>(); // we need this for removal
  constructor() {}

  addServer(server: Server) {
    const stableServer =
      this.stableServers.get(`${server.ip}:${server.name}`) || [];
    //We need hash key and assign it to hashRing
    let hashKey: number;
    //Virtual nodes
    for (let i = 0; i < server.weight; i++) {
      hashKey = this.generateHashKey(
        `${server.ip}:${server.name}:virtual:${i}`,
      );
      let k = server.weight + 1;
      while (this.hashRing.has(hashKey)) {
        if (i === k) {
          k++;
          continue;
        }
        hashKey = this.generateHashKey(
          `${server.ip}:${server.name}:virtual:collision:${k}`,
        );
        k++;
      }
      stableServer.push(hashKey);
      this.hashRing.set(hashKey, server);
    }

    this.stableServers.set(`${server.ip}:${server.name}`, stableServer);

    return [...this.hashRing.entries()];
  }

  removeServer(server: DeleteServerDto) {
    //Virtual nodes
    const stableServer =
      this.stableServers.get(`${server.ip}:${server.name}`) || [];
    stableServer.forEach((hashKey) => {
      this.hashRing.delete(hashKey);
    });
    this.stableServers.delete(`${server.ip}:${server.name}`);

    return [...this.hashRing.entries()];
  }

  generateHashKey(dataToHash: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < dataToHash.length; i++) {
      hash ^= dataToHash.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  getServerByKey(key: string): Server | null {
    const hashKey = this.generateHashKey(key);
    const sortedHashKeys = [...this.hashRing.keys()].sort((a, b) => a - b);
    for (let i = 0; i < sortedHashKeys.length; i++) {
      if (sortedHashKeys[i] >= hashKey) {
        return this.hashRing.get(sortedHashKeys[i]) || null;
      }
    }
    return this.hashRing.get(sortedHashKeys[0]) || null;
  }
}
