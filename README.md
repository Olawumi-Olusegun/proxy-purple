# Authentication API (v1)

This document explains how the authentication routes work, how they are validated, and what data they expect.  
The API uses **Express.js**, **Zod** for validation, and a `validate` middleware to ensure required request parameters are delivered.

## AUTH SESSION BASED

## Remember to pass credentials when calling endpoint

## Base URL: https://proxy-purple.onrender.com/api/v1

Deployed API Endpoint

```
  /api/v1/auth/signup
  /api/v1/auth/signup/verify
  /api/v1/auth/signin
  /api/v1/auth/signout
  /api/v1/auth/forgot-password
  /api/v1/auth/forgot-password/verify
  /api/v1/auth/reset-password
```

```
  Create, Read
  /api/v1/coupons

  {
  "code": "WELCOME10",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderAmount": 100,
  "maxDiscountAmount": 50,
  "validFrom": "2025-01-01",
  "validUntil": "2025-12-31",
  "expiryDate": "2025-12-31",
  "usageLimit": 100,
  "usedCount": 0,
  "status": "Active",
  "isActive": true
}


Update, Delete
  /api/v1/coupons/:couponId
  /api/v1/coupons/68f9ff6c0aad47eee26b5814

{
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderAmount": 100,
  "maxDiscountAmount": 50,
  "expiryDate": "2025-12-31",
  "usageLimit": 100,
  "usedCount": 0,
}

```

All endpoints listed below are prefixed with this base path.

`/auth/signup` => `POST` => Register a new user and send a verification OTP to their email.

```
{
email: string (valid email),
password: string (min 8 chars),
}
```

`/auth/verify-signup-otp` => `POST` => Verify the OTP sent to the user’s email after signup.

```
{
email: string (valid email),
otp: string (exactly 6 digits)
}
```

`/auth/signin` => `POST` => Log in a user and return authentication data (token or session).

```
  {
     email: string (valid email),
    password: string (required)
  }
```

`/auth/signout` => `POST` => Log out a user and invalidate the session or token.
`/auth/forgot-password` => `POST` => Initiate a password reset by sending an OTP to the user’s email.

```
{
    email: string (valid email)
}
```

`/auth/verify-forgot-password-otp` => `POST` => Verify the OTP sent for password reset.

```
{
    email: string (valid email),
    otp: string (exactly 6 digits)
}

```

`/auth/reset-password` => `POST` => Reset the user’s password after successful OTP verification.

```
{
     token: string (required),
    newPassword: string (min 8 chars)
}

```
