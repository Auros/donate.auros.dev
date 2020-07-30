import { NextApiRequest, NextApiResponse } from 'next';
import { fetchPostJSON } from '../../../utils/api-helpers'
import { formatAmountForStripe } from '../../../utils/stripe-helpers'

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2020-03-02'
})

const streamlabsToken = process.env.STREAMLABS_TOKEN

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { amount }: { amount: number } = req.body
        try {
            if (!(amount >= 1)) {
                throw new Error('Invalid Amount.')
            }
            const params: Stripe.PaymentIntentCreateParams = {
                payment_method_types: ['card'],
                amount: formatAmountForStripe(amount, 'usd'),
                currency: 'usd',
                description: req.body.description,
                metadata: req.body.metadata
            }
            const payment_intent: Stripe.PaymentIntent = await stripe.paymentIntents.create(
                params
            )

            res.status(200).json(payment_intent)
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