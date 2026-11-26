import { handleRequest, startServer } from "../lib/requestHandler.js";

export { handleRequest };
export default handleRequest;

if (process.env.VERCEL !== "1") {
  startServer();
}
