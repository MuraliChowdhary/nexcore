
import dotenv from "dotenv";
dotenv.config()
import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "../middleware/auth"

const router:Router = Router()
const TASK_SERVICE = process.env.TASK_SERVICE_URL;

if (!TASK_SERVICE) {
  throw new Error("TASK_SERVICE_URL not found ❌");
}

const fixRequestBody = (proxyReq: any, req: any) => {
  if (!req.body) return;

  const bodyData = JSON.stringify(req.body);

  proxyReq.setHeader("Content-Type", "application/json");
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

  proxyReq.write(bodyData);
};

const proxy = createProxyMiddleware({
  target: TASK_SERVICE,
  changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  pathRewrite: { "^/api/tasks": "" },
})

router.use(verifyToken)
router.use(proxy)

export default router