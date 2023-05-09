import {NextApiRequest, NextApiResponse} from "next";
import cookieWrapper from "@/pages/api/utils";

export default async function update(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await cookieWrapper(req, res, {
        method: 'post',
        url: `/subscription/after-pay`,
        data: req.body as string,
    });
};