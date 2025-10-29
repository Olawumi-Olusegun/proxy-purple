import { Request, Response } from "express";
import { apiClient } from "../utils/apiClient";

const servers = [
  {
    name: "intelxeon",
    description:
      "Intel Xeon CPUs - Industry standard for server workloads with high core counts and ECC memory support",
  },
  {
    name: "ipv6onlygen1",
    description:
      "IPv6-only infrastructure - Budget-friendly servers leveraging next-generation internet protocol",
  },
  {
    name: "ryzengen2",
    description:
      "AMD Ryzen Gen 2 - High core density and competitive pricing for parallel processing workloads",
  },
  {
    name: "intelxeongold",
    description:
      "Intel Xeon Gold - Enterprise-grade processors with advanced RAS features and optimal performance per watt",
  },
  {
    name: "intelxeonv4",
    description:
      "Intel Xeon v4 (Broadwell-EP) - Proven architecture with wide software compatibility and stable performance",
  },
];

export const getServers = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: { servers },
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch server data",
    });
  }
};

export const getServerByName = async (req: Request, res: Response) => {
  const serverName = req.params.serverName;

  try {
    if (!serverName) {
      return res.status(404).json({
        success: false,
        error: "Server name required",
      });
    }

    const response = await apiClient.get(`/kvmserver/line/${serverName}`);

    if (!response.data) {
      return res.status(404).json({
        success: false,
        error: "Server not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        servers: response.data,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch server data",
    });
  }
};
