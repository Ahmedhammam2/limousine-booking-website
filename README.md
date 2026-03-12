# Limousine Booking System

A full-stack web application that allows customers to book limousine rides with customizable options, and enables administrators to manage bookings, vehicles, and monitor business performance through comprehensive analytics.(note that the first page (home page) does not get shipped)

## Project Overview

This system digitizes the limousine booking process by allowing customers to book rides online instead of making phone calls. It automates availability checks, pricing calculations, and booking management, reducing manual work for the company and improving the customer experience. The system now includes a powerful analytics dashboard that provides real-time insights into revenue, fleet performance, operational metrics, and booking patterns.

## Tech Stack

### Frontend

- Next.js 16 (React framework)
- JavaScript (JSX)
- Tailwind CSS

### Backend

- Next.js (API routes / Route Handlers)
- Node.js
- Stripe Webhooks
- REST APIs

### Database

- MongoDB
- Mongoose (ODM)

### External Services

- Stripe (Payments)
- Google Maps Platform APIs
  - Directions API
  - Distance Matrix API
  - Geocoding API
  - Maps JavaScript API
  - Places API
  - Routes API

### UI & Utility Libraries

- React Hot Toast
- React Date Picker
- React Time Picker
- React Calendar
- React Icons

## Features

### Customer Features

- View cars in the Fleet
- Book limousine rides by selecting trip type (transfer or hourly)
- Choose pickup and drop-off locations with optional stops
- Select date, time, number of passengers, and luggage
- View available vehicles based on selected date and booking requirements
- Enter personal contact information (full name, email, phone number)
- Pay securely online and receive a booking receipt

### Admin Features

#### Booking & Vehicle Management

- View all available vehicles and their specifications
- Add, edit, or retire vehicles
- View all customer bookings
- Search for vehicles and bookings by ID
- Filter bookings by time period (week or month)
- Update booking status (confirm, cancel, no-show)
- Delete bookings

#### Analytics Dashboard

The analytics dashboard provides comprehensive business insights with real-time data visualization and reporting capabilities:

##### Revenue Analytics

- **Net Revenue Tracking**: Monitor actual collected revenue for current week, month, year, and yesterday
- **Gross vs Net Revenue**: Compare total bookings revenue against actual collected revenue with refund impact analysis
- **Growth Metrics**: Month-over-month, week-over-week, and year-over-year growth percentages
- **Revenue Trends**: 6-month historical revenue visualization with booking counts and growth rates
- **Automatic Exclusions**: System automatically excludes canceled bookings and refunds from revenue calculations

##### Booking Health Metrics

- **Booking Funnel**: Track total bookings created by creation date vs actual trip dates
- **Confirmed Trips**: Monitor successful bookings that resulted in completed trips
- **Cancellation Tracking**: Real-time cancellation rates with automatic alerts when exceeding 15% threshold
- **No-Show Monitoring**: Track customer no-shows with alerts when rate exceeds 5%
- **Conversion Analysis**: Analyze booking-to-confirmation conversion rates

##### Fleet Performance

- **Top Performers**: View top 3 cars by booking count and revenue generation
- **Utilization Rates**: Monitor what percentage of available time each vehicle is actually booked
  - **Healthy**: 50%+ utilization (green indicator)
  - **Monitor**: 40-50% utilization (blue indicator)
  - **Warning**: 30-40% utilization (yellow indicator)
  - **Critical**: Below 30% utilization (red indicator)
- **Idle Time Tracking**: Identify wasted capacity and hours when vehicles sit unused
- **Underperforming Vehicles**: Automatic identification of cars with low utilization
- **Revenue per Car**: Detailed breakdown of revenue contribution by vehicle

##### Trip Type Intelligence

- **Transfer vs Hourly Analysis**: Compare performance between trip types
- **Revenue Breakdown**: See which service line generates more income
- **Average Booking Value**: Calculate average revenue per booking by trip type
- **Duration Analysis**: Track average trip duration for each type
- **Business Insights**: Automated recommendations based on performance data

##### Time-Based Patterns

- **24-Hour Heatmap**: Visual representation of booking volume by hour of day
- **Weekly Patterns**: Day-of-week booking distribution showing busiest days
- **Peak vs Off-Peak**: Identify high-demand periods with booking and revenue comparisons
- **Pricing Opportunities**: Average price comparison between peak and off-peak times
- **Operational Planning**: Data-driven insights for driver scheduling and fleet availability

##### Dashboard Features

- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices with adaptive layouts
- **Multiple Time Views**: Switch between week, month, and year perspectives
- **Tabbed Navigation**: Four main sections (Revenue Overview, Fleet Performance, Service Intelligence, Customer Insights)
- **Real-Time Updates**: Data refreshes automatically when components mount
- **Visual Indicators**: Color-coded status badges and alert banners for critical metrics
- **Loading States**: Smooth skeleton screens during data fetching
- **Error Handling**: Graceful error messages if data fetch fails

##### Business Intelligence

The analytics system is designed to answer critical business questions:

- **Are we making money?** Revenue analytics show actual collected revenue vs gross bookings
- **Are we using our assets efficiently?** Fleet utilization reveals which cars are profitable and which are idle
- **When should we have maximum capacity?** Time intelligence shows peak demand periods
- **Which service should we promote?** Trip type analysis reveals most profitable offerings
- **Are customers satisfied?** Low cancellation and no-show rates indicate service quality

## User Roles

### Customer

- Can create and pay for bookings
- Can view booking confirmation and receipt
- Cannot manage vehicles
- Cannot view or modify other users' bookings
- Cannot access admin dashboards or admin functionality

### Admin

- Can view and manage all bookings
- Can add, edit, or retire vehicles
- Can update booking statuses (confirm, cancel, no-show)
- Can delete bookings
- Cannot modify existing bookings once payment is completed
- **Can access comprehensive analytics dashboard**
- **Can view business performance metrics across different time periods**
- **Can export and analyze fleet utilization data**

## System Architecture

The system follows a client–server architecture where the frontend handles user interaction and form input, while the backend is responsible for validation, availability checks, pricing logic, payment processing, and analytics calculations.

### Booking Flow

1. The customer opens the website and starts a new booking.
2. The customer fills in booking details, including trip type, date, time, pickup and drop-off locations, number of passengers, luggage, and optional stops.
3. The frontend performs basic form validation before submitting the data.
4. The backend validates the booking data and checks vehicle availability based on existing bookings, the requested time range and number of luggage/passenger.
5. The backend returns a list of available vehicles that match the customer's requirements.
6. The frontend displays the available vehicles without duplicates.
7. The customer selects a vehicle and views a trip summary with a detailed price breakdown.
8. The customer enters personal contact information.
9. The backend creates a Stripe payment session and redirects the customer to the Stripe checkout page.
10. Based on the payment result, the customer is redirected to a success or cancellation page.
11. After a successful payment, the booking is finalized and a receipt is generated for the customer.

### Analytics Flow

1. Admin navigates to the analytics dashboard
2. Frontend components mount and fetch data from analytics API routes
3. Backend aggregates booking and car data using MongoDB aggregation pipelines
4. Complex calculations performed server-side (utilization rates, growth percentages, revenue totals)
5. Formatted data returned to frontend for visualization
6. Components render responsive charts, tables, and metrics
7. Admin can switch between time periods (week/month/year) triggering new data fetches

## Folder Structure

/actions  
Contains server actions responsible for creating and updating bookings, managing vehicles, and handling admin-related operations.

/app  
Contains frontend routes, layouts, and backend API route handlers used by the application.

/components  
Reusable frontend components used across multiple pages.

/lib  
Shared utility and backend logic, including database connection, authentication helpers, availability checks.

/models  
Mongoose models defining the database schema for vehicles and bookings.

/public  
Static assets such as images and icons served directly by the frontend.

/scripts  
Utility scripts used for development or maintenance tasks.

/styles  
Global and component-level styling files.

## API Documentation

### Authentication

Admin routes require authentication via session cookies set after successful login.

---

### POST /api/admin/login

Authenticate admin user and create session.

**Request Body:**

```json
{
  "password": "your-admin-password"
}
```

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Response (401):**

```json
{
  "error": "Incorrect password"
}
```

---

### POST /api/admin/logout

End admin session.

**Success Response (200):**

```json
{
  "success": true
}
```

---

### DELETE /api/admin/cars/:id

Retire a vehicle (soft delete by changing status).

**Requires:** Admin authentication

**URL Parameters:**

- `id` - MongoDB ObjectId of the vehicle

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses:**

- `400` - Invalid car ID format
- `404` - Car not found or already retired
- `500` - Server error

---

### GET /api/cars/:id

Get vehicle details by ID.

**URL Parameters:**

- `id` - MongoDB ObjectId of the vehicle

**Success Response (200):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "sedan",
  "name": "Mercedes S-Class",
  "capacity": 3,
  "luggage": 2,
  "pricePerHour": 150,
  "pricePermile": 5,
  "minprice": 100,
  "minHours": 2,
  "quantity": 3,
  "status": "active"
}
```

**Error Responses:**

- `404` - Car not found
- `500` - Server error

---

### POST /api/available

Get available vehicles based on booking criteria.

**Request Body:**

```json
{
  "tripType": "transfer",
  "startTime": "2026-02-01T10:00:00Z",
  "estimatedDuration": 60,
  "passengers": 3,
  "luggage": 2
}
```

**Success Response (200):**

```json
{
  "cars": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Mercedes S-Class",
      "type": "sedan",
      "capacity": 3,
      "luggage": 2,
      "pricePerHour": 150,
      "pricePermile": 5
    }
  ]
}
```

**Error Response (500):**

```json
{
  "error": "Failed to fetch available cars"
}
```

---

### POST /api/bookings

Create a new booking.

**Request Body:**

```json
{
  "carId": "507f1f77bcf86cd799439011",
  "tripType": "transfer",
  "passengers": 3,
  "luggage": 2,
  "startTime": "2026-02-01T10:00:00Z",
  "estimatedDuration": 60,
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "distance": 25,
  "finalPrice": 125,
  "pickupLocation": "123 Main St",
  "dropoffLocation": "456 Oak Ave",
  "stops": ["789 Elm St"],
  "date": "2026-02-01"
}
```

**Success Response (201):**

```json
{
  "bookingId": "507f1f77bcf86cd799439012"
}
```

**Error Response (400):**

```json
{
  "error": "Validation error message"
}
```

**Notes:**

- `endTime` is automatically calculated as `startTime + (estimatedDuration * 2)` minutes
- Initial status is set to `"pending"`
- Initial paymentStatus is set to `"unpaid"`

---

### POST /api/stripe/create-checkout

Create Stripe checkout session for payment.

**Request Body:**

```json
{
  "finalPrice": 125.5,
  "tripType": "transfer",
  "carId": "507f1f77bcf86cd799439011",
  "carName": "Mercedes S-Class",
  "customerName": "John Doe",
  "bookingId": "507f1f77bcf86cd799439012",
  "searchParams": "tripType=transfer&date=2026-02-01"
}
```

**Success Response (200):**

```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Error Responses:**

- `400` - Invalid price or missing car data
- `500` - Error creating checkout session

**Notes:**

- Redirects user to Stripe hosted checkout page
- Success URL: `/booking/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/booking/cancelled?{searchParams}`

---

### POST /api/webhooks/webhook

Handle Stripe payment webhooks (internal use only).

**Headers:**

- `stripe-signature` - Stripe webhook signature for verification

**Webhook Events Handled:**

- `checkout.session.completed` - Updates booking to confirmed and paid

**Success Response (200):**

```text
OK
```

**Error Responses:**

- `400` - Missing signature, invalid signature, or missing booking ID
- `404` - Booking not found

**Notes:**

- This endpoint is called by Stripe, not by your frontend
- Requires `STRIPE_WEBHOOK_SECRET` environment variable
- Updates `paymentStatus` to `"paid"` and `status` to `"confirmed"`

---

### Analytics API Endpoints

#### GET /api/analytics/revenue

Get net revenue metrics for different time periods with growth percentages.

**Success Response (200):**

```json
{
  "thisWeek": 12450,
  "thisMonth": 48920,
  "thisYear": 487234,
  "yesterday": 1789,
  "weekGrowth": 12.5,
  "monthGrowth": 8.2,
  "yearGrowth": 15.3
}
```

**Notes:**

- Only counts bookings where `paymentStatus = "paid"` and `status ≠ "canceled"`
- Growth percentages compare to previous period (last week, last month, last year)

---

#### GET /api/analytics/revenue-breakdown?period=month

Get gross vs net revenue comparison showing refund impact.

**Query Parameters:**

- `period` - "week", "month", or "year" (default: "month")

**Success Response (200):**

```json
{
  "gross": 52100,
  "net": 48920,
  "refunds": 3180,
  "refundRate": 6.1
}
```

**Notes:**

- Gross = total of paid + refunded bookings
- Net = total of paid bookings only
- Refund rate = (refunds / gross) × 100

---

#### GET /api/analytics/revenue-trend

Get monthly revenue data for the last 6 months with growth rates.

**Success Response (200):**

```json
[
  {
    "month": "August",
    "year": 2025,
    "revenue": 42300,
    "bookingCount": 124,
    "growthRate": 0
  },
  {
    "month": "September",
    "year": 2025,
    "revenue": 45200,
    "bookingCount": 136,
    "growthRate": 6.9
  }
]
```

---

#### GET /api/analytics/bookings?period=month

Get booking health metrics including confirmation, cancellation, and no-show rates.

**Query Parameters:**

- `period` - "week" or "month" (default: "month")

**Success Response (200):**

```json
{
  "created": 124,
  "confirmed": 98,
  "canceled": 18,
  "noShows": 8,
  "confirmationRate": 79.0,
  "cancellationRate": 14.5,
  "noShowRate": 6.5
}
```

**Notes:**

- `created` uses `createdAt` timestamp (when booking was made)
- Other metrics use `date` field (when trip occurred)
- Rates are calculated as percentages of total trips

---

#### GET /api/analytics/trip-types?period=month

Get performance comparison between transfer and hourly trips.

**Query Parameters:**

- `period` - "week", "month", or "year" (default: "month")

**Success Response (200):**

```json
{
  "transfer": {
    "count": 78,
    "revenue": 28470,
    "avgRevenue": 365,
    "avgDuration": 0.8
  },
  "hourly": {
    "count": 46,
    "revenue": 20450,
    "avgRevenue": 444,
    "avgDuration": 3.2
  }
}
```

---

#### GET /api/analytics/fleet?period=month

Get comprehensive fleet performance metrics for all vehicles.

**Query Parameters:**

- `period` - "week", "month", or "year" (default: "month")

**Success Response (200):**

```json
{
  "topByBookings": [
    {
      "carId": "507f1f77bcf86cd799439011",
      "carName": "Cadillac Escalade",
      "carType": "SUV",
      "bookingCount": 87,
      "revenue": 11200,
      "totalBookedHours": 348,
      "totalAvailableHours": 720,
      "utilizationRate": 48.3,
      "idleHours": 372,
      "status": "monitor"
    }
  ],
  "topByRevenue": [],
  "allCars": [],
  "underperforming": []
}
```

**Notes:**

- Utilization calculated as: (totalBookedHours / totalAvailableHours) × 100
- Available hours assumes 24-hour operation: days × 24 × car quantity
- Status values: "healthy" (50%+), "monitor" (40-50%), "warning" (30-40%), "critical" (<30%)

---

#### GET /api/analytics/time-intelligence?period=month

Get time-based booking patterns including hourly and daily distributions.

**Query Parameters:**

- `period` - "week", "month", or "year" (default: "month")

**Success Response (200):**

```json
{
  "hourlyDistribution": [
    {
      "hour": 6,
      "bookingCount": 12,
      "avgRevenue": 385
    }
  ],
  "dailyDistribution": [
    {
      "dayOfWeek": 1,
      "dayName": "Sunday",
      "bookingCount": 18,
      "revenue": 7200
    }
  ],
  "peakMetrics": {
    "peakBookings": 68,
    "offPeakBookings": 56,
    "peakRevenue": 28140,
    "offPeakRevenue": 20230,
    "avgPeakPrice": 414,
    "avgOffPeakPrice": 361
  }
}
```

**Notes:**

- Peak times defined as: All day Saturday, Friday 4-11 PM, weekday rush hours (6-9 AM, 4-7 PM), Sunday evening (4-8 PM)
- hourlyDistribution covers all 24 hours
- dailyDistribution shows Sunday (1) through Saturday (7)

---

## Environment Variables

This project requires the following environment variables. Copy `.env.example` to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
```

### Required Variables:

| Variable                             | Description                    | Where to Get It                                          |
| ------------------------------------ | ------------------------------ | -------------------------------------------------------- |
| `MONGODB_URI`                        | MongoDB connection string      | [MongoDB Atlas](https://cloud.mongodb.com)               |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`    | Google Maps API key (frontend) | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_MAPS_BACKEND_API_KEY`        | Google Maps API key (backend)  | [Google Cloud Console](https://console.cloud.google.com) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key         | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_SECRET_KEY`                  | Stripe secret key              | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret  | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| `ADMIN_PASSWORD`                     | Admin panel password           | Choose a strong password                                 |

## Database Schema

### Collections

#### Cars Collection

Stores vehicle information and availability.

**Key Fields:**

- `type` - Vehicle category (sedan, SUV, limo, etc.)
- `capacity` - Maximum passengers
- `luggage` - Maximum luggage pieces
- `pricePerHour` - Hourly rate
- `pricePermile` - Per-mile rate for transfers
- `minprice` - Minimum booking charge
- `quantity` - Number of identical vehicles in fleet
- `status` - "active" or "retired"

#### Bookings Collection

Stores customer reservations and trip details.

**Key Fields:**

- `carId` - Reference to booked vehicle
- `tripType` - "transfer" or "hourly"
- `startTime` / `endTime` - Trip time window (endTime = startTime + estimatedDuration \* 2)
- `status` - "pending", "confirmed", "canceled", or "no show"
- `paymentStatus` - "unpaid", "paid", or "refunded"
- `finalPrice` - Total calculated price
- `pickupLocation` / `dropoffLocation` - Trip addresses
- `stops` - Optional intermediate locations
- `date` - Trip date (used for analytics filtering)

**Timestamps:**
Both collections automatically track `createdAt` and `updatedAt`.

## Pricing Logic

### Transfer Trips (Point A to Point B)

```
Base Price = distance (miles) × pricePermile
Final Price = max(Base Price, minprice)
```

### Hourly Trips

```
Base Price = hours × pricePerHour
Final Price = max(Base Price, minprice)
Minimum Hours = minHours (enforced)
```

### Notes:

- All vehicles have a minimum price that overrides calculated rates
- Hourly bookings must meet minimum hour requirements
- Pricing does not include tips or additional fees (handled separately)

## Availability System

The system checks vehicle availability based on:

1. **Time Conflicts**: Prevents double-booking by checking if requested time overlaps with existing bookings
2. **Capacity Requirements**: Filters vehicles that can accommodate requested passengers and luggage
3. **Vehicle Quantity**: Allows multiple bookings of the same vehicle type if `quantity > 1`
4. **Status**: Only shows "active" vehicles (excludes "retired")

**Overlap Detection:**
A vehicle is unavailable if any existing booking's time range overlaps with the requested time:

```
Conflict exists if: existingBooking.startTime < requestedEndTime AND existingBooking.endTime > requestedStartTime
```

**Duration Calculation:**
For availability checking, `endTime` is calculated as `startTime + (estimatedDuration × 2)` to account for round trips.

## Fleet Utilization System

The analytics dashboard tracks fleet utilization with 24-hour operation assumptions:

**Utilization Calculation:**

```
Available Hours = Days in Period × 24 hours × Car Quantity
Booked Hours = Sum of all trip durations for that car
Utilization Rate = (Booked Hours / Available Hours) × 100
Idle Hours = Available Hours - Booked Hours
```

**Utilization Status Thresholds:**

- **Healthy** (Green): 50%+ utilization
- **Monitor** (Blue): 40-50% utilization
- **Warning** (Yellow): 30-40% utilization
- **Critical** (Red): Below 30% utilization

**Example:**
For a 30-day month with 2 identical cars:

- Available hours: 30 days × 24 hours × 2 cars = 1,440 hours
- If booked for 720 hours: 50% utilization (Healthy)
- If booked for 360 hours: 25% utilization (Critical - underperforming)

## Authentication

### Admin Access

The system uses session-based authentication for admin routes.

**Login Flow:**

1. Admin enters password at `/admin/login`
2. Password is verified against `ADMIN_PASSWORD` environment variable
3. Session cookie is created and stored
4. Admin can access protected routes

**Protected Routes:**

- `/admin` - Admin dashboard
- All routes under `/api/admin/*`
- Analytics dashboard (requires admin session)

**Session Management:**

- Sessions are stored in cookies
- Logout clears the session cookie
- No user registration system (single admin account)

**Security Notes:**

- Password is stored as plain text in environment variables (consider hashing in production)
- No rate limiting implemented (should be added)
- No multi-user support

### Analytics Query Optimization

The analytics system uses MongoDB aggregation pipelines for efficient data processing:

- Complex calculations performed server-side in single database queries
- Grouped aggregations reduce data transfer
- Date filtering applied before grouping to minimize processing
- Joins with `$lookup` retrieve car details in single round-trip

## Known Limitations

- Admin password is stored in plain text (should use hashing)
- No email notifications for booking confirmations
- No SMS notifications
- Customers cannot cancel or modify bookings after payment (refunds are only initiated via admin booking edits)
- Single admin account only (no multi-admin support)
- Success/cancel URLs are hardcoded to localhost (must be changed for production)
- No rate limiting on API endpoints
- No booking history for customers
- Google Maps API calls are not cached
- No data export functionality (CSV/Excel downloads not implemented)\*\*
