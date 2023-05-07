import {NextApiRequest, NextApiResponse} from "next";
import cookieWrapper from "@/pages/api/auth/utils";

export default async function signOut(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await cookieWrapper(req, res, {
        method: 'post',
        url: '/api/sign_out',
    });
}
;