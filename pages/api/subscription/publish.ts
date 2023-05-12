import {NextApiRequest, NextApiResponse} from "next";
import cookieWrapper from "@/pages/api/utils";

export default async function publish(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await cookieWrapper(req, res, {
        method: 'post',
        url: '/subscription/get-subscription-payment-status',
        data: req.body as string,
    });
};