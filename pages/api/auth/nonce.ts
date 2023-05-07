import {NextApiRequest, NextApiResponse} from "next";
import cookieWrapper from "@/pages/api/auth/utils";

export default async function nonce(req: NextApiRequest, res: NextApiResponse) {
    await cookieWrapper(req, res, {
        method: 'get',
        url: '/api/nonce',
    });
}
;