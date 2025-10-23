# Authentication API (v1)

This document explains how the authentication routes work, how they are validated, and what data they expect.  
The API uses **Express.js**, **Zod** for validation, and a `validate` middleware to ensure required request parameters are delivered.

## AUTH SESSION BASED

## Remember to pass credentials when calling endpoint

## Base URL

Deployed API Endpoint

All endpoints listed below are prefixed with this base path.

`/signup` => `POST` => Register a new user and send a verification OTP to their email.

```
{
email: string (valid email),
password: string (min 8 chars),
}
```

`/verify-signup-otp` => `POST` => Verify the OTP sent to the user’s email after signup.

```
{
email: string (valid email),
otp: string (exactly 6 digits)
}
```

`/signin` => `POST` => Log in a user and return authentication data (token or session).

```
  {
     email: string (valid email),
    password: string (required)
  }
```

`/signout` => `POST` => Log out a user and invalidate the session or token.
`/forgot-password` => `POST` => Initiate a password reset by sending an OTP to the user’s email.

```
{
    email: string (valid email)
}
```

`/verify-forgot-password-otp` => `POST` => Verify the OTP sent for password reset.

```
{
    email: string (valid email),
    otp: string (exactly 6 digits)
}

```

`/reset-password` => `POST` => Reset the user’s password after successful OTP verification.

```
{
     token: string (required),
    newPassword: string (min 8 chars)
}

```
