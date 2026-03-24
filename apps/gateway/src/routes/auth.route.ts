import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "../middleware/auth"

const router:Router = Router()
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL!

const fixRequestBody = (proxyReq: any, req: any) => {
  if (!req.body) return;

  const bodyData = JSON.stringify(req.body);

  proxyReq.setHeader("Content-Type", "application/json");
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

  proxyReq.write(bodyData);
};


// public routes — no token needed
router.post(
  "/register",
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  })
);


router.post(
  "/login",
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  })
);

// protected route — token required
router.get(
  "/profile",
  verifyToken,
  createProxyMiddleware({ target: AUTH_SERVICE, changeOrigin: true, on: { proxyReq: fixRequestBody } })
)

export default router