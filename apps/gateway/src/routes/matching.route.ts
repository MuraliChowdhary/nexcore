    import dotenv from "dotenv";
dotenv.config();
    import { Router } from "express"
    import { createProxyMiddleware } from "http-proxy-middleware"

    const router:Router = Router()
    const MATCHING_SERVICE = process.env.MATCHING_SERVICE_URL;

    if (!MATCHING_SERVICE) {
  throw new Error("MATCHING_SERVICE_URL is not defined");
}

    const fixRequestBody = (proxyReq: any, req: any) => {
    if (!req.body) return;

    const bodyData = JSON.stringify(req.body);

    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

    proxyReq.write(bodyData);
    };


    // public routes — no token needed
    router.get(
    "/match",
    createProxyMiddleware({
        target: MATCHING_SERVICE,
        changeOrigin: true,
        on: { proxyReq: fixRequestBody },
    })
    );


    router.post(
    "/index",
    createProxyMiddleware({
        target: MATCHING_SERVICE,
        changeOrigin: true,
        on: { proxyReq: fixRequestBody },
    })
    );



    export default router