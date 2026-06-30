import * as net from "node:net";

const server = net.createServer((socket: net.Socket) => {
  console.log("Client connected!");

  socket.setEncoding("utf-8");

  socket.on("data", (data: string) => {
    console.log(`Received from client: ${data}`);

    socket.write(`Echo: ${data}`);
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err: Error) => {
    console.error("Socket error:", err);
  });

  socket.write("Welcome to the VeloCache server");
});

server.listen(8080, () => {
  console.log("VeloCache Server running on port 8080");
});
