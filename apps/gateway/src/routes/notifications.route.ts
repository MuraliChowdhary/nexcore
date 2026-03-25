import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "../middleware/auth"

const router:Router = Router()

const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL;

if (!NOTIFICATION_SERVICE) {
  throw new Error("NOTIFICATION_SERVICE_URL not found ❌");
}

const fixRequestBody = (proxyReq: any, req: any) => {
  if (!req.body) return;

  const bodyData = JSON.stringify(req.body);

  proxyReq.setHeader("Content-Type", "application/json");
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

  proxyReq.write(bodyData);
};


const proxy = createProxyMiddleware({
  target: NOTIFICATION_SERVICE!,
  changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  pathRewrite: { "^/api/notifications": "" },
})

router.use(verifyToken)
router.use(proxy)

export default router