import { Request, Response } from "express"
import { MedusaError } from "@nedusa/utils"

export const GET = async (req: Request, res: Response) => {
  throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Not allowed")
}
