interface StreamClient {
  write: (chunk: string) => void;
}

const clients = new Map<string, Set<StreamClient>>();

export function registerClient(userId: string, client: StreamClient): () => void {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(client);

  return () => {
    const set = clients.get(userId);
    set?.delete(client);
    if (set && set.size === 0) {
      clients.delete(userId);
    }
  };
}

export function pushToClient(userId: string, event: string, id: string, data: unknown): void {
  const set = clients.get(userId);
  if (!set) {
    return;
  }

  const chunk = `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of set) {
    client.write(chunk);
  }
}
