import { Router } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { verifyToken } from "../middleware/auth"

const router:Router = Router()
const PROJECT_SERVICE = process.env.PROJECT_SERVICE_URL!



const fixRequestBody = (proxyReq: any, req: any) => {
  if (!req.body) return;

  const bodyData = JSON.stringify(req.body);

  proxyReq.setHeader("Content-Type", "application/json");
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

  proxyReq.write(bodyData);
};


const proxy = createProxyMiddleware({
  target: PROJECT_SERVICE,
  changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  pathRewrite: { "^/api/projects": "" },
})


// all project routes require auth
router.use(verifyToken)
router.use(proxy)

export default router