import * as net from "node:net";
import { LRUCache } from "../cache";
import { handleCommand } from "../protocol/commands";

const PROMPT = "> ";

export function createTcpServer(cache: LRUCache, port = 8080): net.Server {
  const server = net.createServer((socket: net.Socket) => {
    console.log("Client connected!");

    socket.setEncoding("utf-8");
    socket.write(`Welcome to the VeloCache server\r\n${PROMPT}`);

    socket.on("data", (data: string) => {
      const response = handleCommand(cache, data.trim());
      socket.write(`${response}\r\n${PROMPT}`);
    });

    socket.on("end", () => {
      console.log("Client disconnected");
    });

    socket.on("error", (err: Error) => {
      console.error("Socket error:", err);
    });
  });

  server.listen(port, () => {
    console.log(`VeloCache Server running on port ${port}`);
  });

  return server;
}
