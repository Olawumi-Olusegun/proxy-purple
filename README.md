# Authentication API (v1)

This document explains how the authentication routes work, how they are validated, and what data they expect.  
The API uses **Express.js**, **Zod** for validation, and a `validate` middleware to ensure required request parameters are delivered.

## AUTH SESSION BASED

## Remember to pass credentials when calling endpoint

## Base URL: https://proxy-purple.onrender.com/api/v1

Deployed API Endpoint

```
  /api/v1/auth/signup
  /api/v1/auth/signin
  /api/v1/auth/signout
  /api/v1/auth/forgot-password
  /api/v1/auth/verify-forgot-password-otp
  /api/v1/auth/reset-password
  /api/v1/auth/resend-otp
```

```

All endpoints listed below are prefixed with this base path.

`/auth/signup` => `POST` => Register a new user and send a verification OTP to their email.

{
email: string (valid email),
password: string (min 8 chars),
}

```

```

`/auth/verify-signup-otp` => `POST` => Verify the OTP sent to the user’s email after signup.

{
email: string (valid email),
otp: string (exactly 6 digits)
}

```

```

`/auth/signin` => `POST` => Log in a user and return authentication data (token or session).

{
email: string (valid email),
password: string (required)
}

```

```
`/auth/signout` => `POST` => Log out a user and invalidate the session or token.


`/auth/forgot-password` => `POST` => Initiate a password reset by sending an OTP to the user’s email.

{
email: string (valid email)
}

```

```

`/auth/verify-forgot-password-otp` => `POST` => Verify the OTP sent for password reset.

{
email: string (valid email),
otp: string (exactly 6 digits)
}

```

```
`/auth/reset-password` => `POST` => Reset the user’s password after successful OTP verification.

{
otp: string (required),
newPassword: string (min 8 chars)
email: "johndoe@mail.com
}

```

```
`/auth/resend-otp` => `POST` => Resend OTP.

{
email: string (valid email),
}


```

COUPON ROUTES

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

ADMIN ROUTES

Admin Routes
Read, Delete
/api/v1/admin/get-users
/api/v1/admin/delete-user/:userId"

ORDER ROUTES

# ============================================

# 1. CREATE ORDER (Admin only)

# ============================================

POST /orders/create
Body: {
"user": "userId123",
"items": [
{
"product": "productId1",
"quantity": 2,
"price": 29.99
}
],
"shippingAddress": {
"street": "123 Main St",
"city": "Lagos",
"country": "Nigeria"
},
"totalAmount": 59.98,
"paymentMethod": "card"
}

# ============================================

# 2. GET ALL ORDERS (Admin & User)

# ============================================

# Basic pagination

GET /orders/get-all?page=1&limit=20

# Filter by status

GET /orders/get-all?status=pending
GET /orders/get-all?status=completed&page=1&limit=10
GET /orders/get-all?status=processing
GET /orders/get-all?status=shipped
GET /orders/get-all?status=delivered
GET /orders/get-all?status=cancelled

# Date range (admin)

GET /orders/get-all?startDate=2025-01-01&endDate=2025-12-31
GET /orders/get-all?startDate=2025-10-01&endDate=2025-10-31&page=1&limit=50

# Search orders (admin)

GET /orders/get-all?search=ORD-12345
GET /orders/get-all?search=john@example.com

# Sort by field

GET /orders/get-all?sortBy=totalAmount&sortOrder=desc
GET /orders/get-all?sortBy=createdAt&sortOrder=asc
GET /orders/get-all?sortBy=status&sortOrder=asc

# Combine filters

GET /orders/get-all?status=pending&page=2&limit=15&sortBy=createdAt&sortOrder=asc
GET /orders/get-all?status=completed&startDate=2025-09-01&sortBy=totalAmount&sortOrder=desc
GET /orders/get-all?page=1&limit=25&sortBy=createdAt&sortOrder=desc
GET /orders/get-all?status=shipped&search=ORD&page=1&limit=20

# ============================================

# 3. GET SINGLE ORDER (Admin & User)

# ============================================

GET /orders/get-order/67890abcdef12345
GET /orders/get-order/:orderId

# ============================================

# 4. UPDATE ORDER STATUS (Admin only)

# ============================================

PATCH /orders/update-order/67890abcdef12345
Body: {
"status": "processing"
}

# Update to different statuses

PATCH /orders/update-order/:orderId
Body: { "status": "shipped" }

PATCH /orders/update-order/:orderId
Body: { "status": "delivered" }

PATCH /orders/update-order/:orderId
Body: { "status": "cancelled" }

# ============================================

# 5. DELETE ORDER (Admin only)

# ============================================

DELETE /orders/delete-order/67890abcdef12345
DELETE /orders/delete-order/:orderId

# PRODUCT ROUTES

# ============================================

# 1. CREATE PRODUCT (Admin only)

# ============================================

POST /products/create
Body: {
"name": "Premium Residential Proxy",
"description": "High-speed residential proxies with 99.9% uptime",
"price": 49.99,
"category": "Residential",
"proxyType": "Residential",
"status": "Active",
"stock": 100,
"images": [
"https://example.com/image1.jpg",
"https://example.com/image2.jpg"
]
}

# Datacenter proxy example

POST /products/create
Body: {
"name": "Datacenter Proxy Package",
"description": "Fast datacenter proxies for web scraping",
"price": 29.99,
"category": "Datacenter",
"proxyType": "Datacenter",
"stock": 500
}

# ============================================

# 2. GET ALL PRODUCTS (Admin only)

# ============================================

# Basic pagination

GET /products/get-all?page=1&limit=20

# Filter by category

GET /products/get-all?category=Residential
GET /products/get-all?category=Datacenter&page=1&limit=10

# Filter by proxy type

GET /products/get-all?proxyType=Residential
GET /products/get-all?proxyType=Datacenter
GET /products/get-all?proxyType=Mobile

# Filter by status

GET /products/get-all?status=Active
GET /products/get-all?status=Inactive
GET /products/get-all?status=Expired
GET /products/get-all?status=Suspended

# Search by name or description

GET /products/get-all?search=residential
GET /products/get-all?search=premium

# Filter by price range

GET /products/get-all?minPrice=20&maxPrice=100
GET /products/get-all?minPrice=50

# Filter by stock availability

GET /products/get-all?inStock=true
GET /products/get-all?stock=0

# Sort by field

GET /products/get-all?sortBy=price&sortOrder=asc
GET /products/get-all?sortBy=price&sortOrder=desc
GET /products/get-all?sortBy=createdAt&sortOrder=desc
GET /products/get-all?sortBy=name&sortOrder=asc
GET /products/get-all?sortBy=stock&sortOrder=desc

# Combine filters

GET /products/get-all?category=Residential&status=Active&page=1&limit=15
GET /products/get-all?proxyType=Datacenter&minPrice=10&maxPrice=50&sortBy=price&sortOrder=asc
GET /products/get-all?status=Active&inStock=true&page=2&limit=20&sortBy=createdAt&sortOrder=desc
GET /products/get-all?search=proxy&category=Residential&status=Active&sortBy=price&sortOrder=desc
GET /products/get-all?minPrice=30&status=Active&page=1&limit=25&sortBy=stock&sortOrder=desc

# ============================================

# 3. GET SINGLE PRODUCT (Admin only)

# ============================================

GET /products/get-product/67890abcdef12345
GET /products/get-product/:productId

# ============================================

# 4. UPDATE PRODUCT (Admin only)

# ============================================

PATCH /products/update-product/67890abcdef12345
Body: {
"price": 59.99,
"stock": 150
}

# Update status

PATCH /products/update-product/:productId
Body: {
"status": "Inactive"
}

# Update multiple fields

PATCH /products/update-product/:productId
Body: {
"name": "Premium Residential Proxy V2",
"description": "Updated high-speed residential proxies",
"price": 54.99,
"stock": 200,
"status": "Active"
}

# Add images

PATCH /products/update-product/:productId
Body: {
"images": [
"https://example.com/new-image1.jpg",
"https://example.com/new-image2.jpg",
"https://example.com/new-image3.jpg"
]
}

# Update category and proxy type

PATCH /products/update-product/:productId
Body: {
"category": "Mobile",
"proxyType": "Mobile"
}

# ============================================

# Get Proxy servers

# ============================================

GET /servers

# ============================================

# Get Proxy servers by name

# ============================================

GET /servers/:serverName
