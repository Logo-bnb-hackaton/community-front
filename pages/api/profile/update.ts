import cookieWrapper from "@/pages/api/utils";
import {NextApiRequest, NextApiResponse} from "next";

export default async function update(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await cookieWrapper(req, res, {
        method: 'post',
        url: '/profile/update',
        data: req.body as string,
    });
}