# Medusa Square Payment

## What is it?

Medusa Square Payment is a basic integration of payment provider for Square Payment.

## Installation

1. Install plugin by adding to your `package.json`:

**Warning**

```json
...
"@rsc-labs/medusa-square-payment": "0.0.1" // or other available version
...
```
and execute install, e.g. `yarn install`.

2. Add plugin to your `medusa-config.js` (**Note** - please notice that you need to add it to payment plugin):

```js
...
  plugins: [
    {
      resolve: "@rsc-labs/medusa-square-payment",
      options: {
        token: <app-token>,
        environment: <env-definition>,
      },
    }
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@rsc-labs/medusa-square-payment/providers/square-payment",
            id: "square-payment",
            options: {
              token: <app-token>,
              environment: <env-definition>,
            },
          }
        ]
      },
    },
...
```

## Overview

The basic implementation of Square payment provider gives the possibility to make a payment in your storefront.

## Configuration

Plugin uses 1 required parameter and 1 optional:

- `token` - required parameter which you can find in your Square Developer Dashboard
- `environment` - optional parameter - it can be set to `sandbox`, `production` or not set at all. You can use it to test with your `sandbox` environment.


After above configuration, you can then add the payment provider to your reqion.

## Storefront

We recommend using `react-square-web-payments-sdk` package on your storefront as it simplifies the implementation a lot.
Here is the example of using credit card as payment:

```tsx
import { PaymentForm, CreditCard as SquareCreditCard } from 'react-square-web-payments-sdk';
...

const handleSquareSubmit = async (token: string) => {
    setIsLoading(true)
    try {
      if (!activeSession) {
        await initiatePaymentSession(cart, 
          {
            provider_id: selectedPaymentMethod,
            data: {
              cartId: cart?.id,
              token: token
            }
          })
      }

      return router.push(
        pathname + "?" + createQueryString("step", "review"),
        {
          scroll: false,
        }
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
{isSquare(selectedPaymentMethod) &&
  <div>
    <PaymentForm
      applicationId="<application-id>"
      cardTokenizeResponseReceived={(token, verifiedBuyer) => {
        handleSquareSubmit(token.token!);
      }}
      locationId='XXXXXXXXXX'
    >
      <SquareCreditCard/>
    </PaymentForm>
  </div>
}
```

`<application-id>` - you can retrieve it from your Square Developer Dashboard.

## Limitations

Plugin does not support refunds and cancels. It has been tested using only credit card - when authorized, it captures money automatically.

## License

MIT

---

© 2025 RSC https://rsoftcon.com/
