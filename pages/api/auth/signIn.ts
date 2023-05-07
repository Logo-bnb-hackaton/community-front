import {NextApiRequest, NextApiResponse} from "next";
import cookieWrapper from "@/pages/api/auth/utils";

export default async function signIn(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await cookieWrapper(req, res, {
        method: 'post',
        url: '/api/sign_in',
        data: req.body as string,
    });
}
;