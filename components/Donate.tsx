import React, { useState } from 'react'
import { fetchPostJSON } from '../utils/api-helpers';
import { formatAmountForDisplay } from '../utils/stripe-helpers';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const initialState = {
    customDonation: 1,
    cardholderName: '',
    displayName: '',
    message: ''
}

const CARD_OPTIONS = {
    iconStyle: 'solid' as const,
    style: {
        base: {
        iconColor: '#6772e5',
        color: '#6772e5',
        fontWeight: '500',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
            color: '#fce883',
        },
        '::placeholder': {
            color: '#6772e5',
        },
        },
        invalid: {
        iconColor: '#ef2961',
        color: '#ef2961',
        },
    }
}

const Donate = () => {
    const [input, setInput] = useState(initialState)
    const [payment, setPayment] = useState({ status: 'initial' })
    const [errorMessage, setErrorMessage] = useState('')
    const stripe = useStripe()
    const elements = useElements()

    const PaymentStatus = ({ status }: { status: string }) => {
        switch (status) {
            case 'processing':
            case 'requires_payment_method':
            case 'requires_confirmation':
                return <h5 className="subtitle is-5">Processing...</h5>

            case 'requires_action':
                return <h5 className="subtitle is-5">Authenticationg...</h5>

            case 'succeeded':
                return <h5 className="subtitle is-5 has-text-success">Payment Succeeded! Thank you!</h5>

            case 'error':
                return <h5 className="subtitle is-5 has-text-danger">Error! {errorMessage}</h5>

            default:
                return null
        }
    }

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
        setInput({
            ...input,
            [e.currentTarget.name]: e.currentTarget.value
        })

    const handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) =>
        setInput({
            ...input,
            [e.currentTarget.name]: e.currentTarget.value
        })

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault()

        if (!e.currentTarget.reportValidity()) return;
        setPayment({ status: 'processing' })

        const response = await fetchPostJSON('/api/payment_intents', {
            amount: input.customDonation,
            description: input.message ?? '',
            metadata: {
                displayName: input.displayName ?? 'Anonymous',
                message: input.message ?? ''
            }
        })
        setPayment(response);

        if (response.statusCode === 500) {
            setPayment({ status: 'error' })
            setErrorMessage(response.message)
            return
        }

        const cardElement = elements!.getElement(CardElement);

        const { error, paymentIntent } = await stripe!.confirmCardPayment(
            response.client_secret,
            {
                payment_method: {
                card: cardElement!,
                billing_details: { name: input.cardholderName },
            }
        })

        if (error) {
            setPayment({ status: 'error' })
            setErrorMessage(error.message ?? 'An unknown error occured')
        }
        else if (paymentIntent) {
            setPayment(paymentIntent)
            await fetchPostJSON('/api/streamlabs', {
                amount: input.customDonation,
                message: paymentIntent.description,
                displayName: input.displayName ?? 'Anonymous'
            })
            //setInput(initialState)
        }
    }

  return (
    <>
        <form onSubmit={handleSubmit}>
            <fieldset>
                <h2 className="title is-2">
                    Donate
                </h2>
                <h4 className="subtitle is-4">
                    Thank you!
                </h4>
                <div className="field has-addons">
                    <p className="control">
                        <a className="button is-disabled">
                            <p className="subtitle">$</p>
                        </a>
                    </p>
                    <p className="control">
                        <input className="input" name="customDonation" type="number" placeholder="5.00" min="1" value={input.customDonation} onChange={handleInputChange} required/> 
                    </p>
                    <p className="control">
                        <a className="button is-disabled">
                            <p className="subtitle">USD</p>
                        </a>
                    </p>
                </div>
                <div className="field">
                    <div className="control">
                        <input className="input" name="displayName" type="Text" placeholder="Display Name" onChange={handleInputChange}/>
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <textarea className="textarea" name="message" placeholder="Message" onChange={handleTextAreaChange}></textarea>
                    </div>
                </div>
                <div className="box">
                    <div className="field">
                        <div className="control">
                            <input className="input" name="cardholderName" type="Text" placeholder="Cardholder Name" onChange={handleInputChange} required/>
                        </div>
                    </div>
                    <div className="field">
                        <CardElement options={CARD_OPTIONS} />
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <div className="buttons">
                            <div className="button is-danger">Reset</div>
                            <button type="submit" className="button is-success" disabled={!['initial', 'succeeded', 'error'].includes(payment.status) || !stripe}>Donate {formatAmountForDisplay(input.customDonation, "USD")}</button>
                        </div>
                    </div>
                </div>
                <PaymentStatus status={payment.status} />
            </fieldset>
        </form>
    </>
  )
}

export default Donate