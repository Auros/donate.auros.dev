import { NextApiRequest, NextApiResponse } from 'next';
import { fetchPostJSON } from '../../../utils/api-helpers'

const streamlabsToken = process.env.STREAMLABS_TOKEN

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { amount }: { amount: number } = req.body
        try {

            await fetchPostJSON('https://streamlabs.com/api/v1.0/donations', {
                name: req.body.displayName,
                message: req.body.message,
                identifier: req.body.displayName,
                amount,
                currency: 'usd',
                access_token: streamlabsToken
            })

            res.status(200).json({})
        }
        catch (err) {
            res.status(500).json({ statusCode: 500, message: err.message })
        }
    }
    else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method Not Allowed')
    }
}