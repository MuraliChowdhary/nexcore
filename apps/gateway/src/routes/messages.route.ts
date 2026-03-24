import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "../middleware/auth"

const router:Router = Router()
const CHAT_SERVICE = process.env.CHAT_SERVICE_URL!



const fixRequestBody = (proxyReq: any, req: any) => {
  if (!req.body) return;

  const bodyData = JSON.stringify(req.body);

  proxyReq.setHeader("Content-Type", "application/json");
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

  proxyReq.write(bodyData);
};

const proxy = createProxyMiddleware({
  target: CHAT_SERVICE,
  changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  pathRewrite: { "^/api/messages": "/messages" },
})

router.use(verifyToken)
router.use(proxy)

export default router