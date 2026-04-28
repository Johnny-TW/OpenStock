import { NextRequest } from "next/server";
import { BUSINESS_STATUS_CODE } from "@/config/constants";
import { error } from "@/utils/apiResponse";

export function withApiHandler(
  handler: (req: NextRequest) => Promise<Response>,
  defaultStatus = BUSINESS_STATUS_CODE.ERROR,
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (err: any) {
      console.error("API Error:", err);
      return Response.json(error(err.message || "Internal Server Error", defaultStatus), {
        status: defaultStatus,
      });
    }
  };
}
