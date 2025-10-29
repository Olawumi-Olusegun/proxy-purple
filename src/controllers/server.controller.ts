import { Request, Response } from "express";
import { apiClient } from "../utils/apiClient";

export const getServers = async (req: Request, res: Response) => {
  try {
    const results = await Promise.allSettled([
      apiClient.get("/kvmserver/line/intelxeon"),
      apiClient.get("/kvmserver/line/ipv6onlygen1"),
      apiClient.get("/kvmserver/line/ryzengen2"),
      apiClient.get("/kvmserver/line/intelxeongold"),
      apiClient.get("/kvmserver/line/intelxeonv4"),
    ]);

    const [intelxeon, ipv6onlygen1, ryzengen2, intelxeongold, intelxeonv4] =
      results;

    return res.status(200).json({
      success: true,
      data: {
        servers: {
          intelxeon:
            intelxeon.status === "fulfilled" ? intelxeon.value.data : null,
          ipv6onlygen1:
            ipv6onlygen1.status === "fulfilled"
              ? ipv6onlygen1.value.data
              : null,
          ryzengen2:
            ryzengen2.status === "fulfilled" ? ryzengen2.value.data : null,
          intelxeongold:
            intelxeongold.status === "fulfilled"
              ? intelxeongold.value.data
              : null,
          intelxeonv4:
            intelxeonv4.status === "fulfilled" ? intelxeonv4.value.data : null,
        },
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch server data",
    });
  }
};
