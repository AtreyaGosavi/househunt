# HouseHunt – MERN Stack House Rental Platform

---

## Introduction

Finding a rental property is one of the more frustrating experiences for most people. Listings are scattered across different platforms, communication with owners is slow, and there is usually no clear way to track your booking requests. HouseHunt is a web-based house rental platform built to address these problems. It connects property owners with potential tenants through a single, organized application where owners can list properties, tenants can browse and request bookings, and an administrator can oversee the entire platform.

The idea behind HouseHunt is to simplify the rental process by keeping everything — registration, property listing, booking, and status updates — in one place.

---

## Project Objective

The main goal of this project was to build a fully functional rental platform that demonstrates a real-world use case of a MERN stack application. The system is designed to:

- Allow property owners to list and manage their rental properties
- Allow tenants to search for available properties and send booking requests
- Give administrators visibility into all users and listings
- Handle role-based access so each user only sees and does what is relevant to them

The project also served as a practical exercise in building a REST API, implementing JWT-based authentication, and connecting a React frontend to a Node.js backend.

---

## Technology Stack

**Frontend:**
- React.js – for building the user interface with component-based architecture
- React Router – for client-side routing between pages
- Material UI – for UI components and responsive layout
- Axios – for making HTTP requests to the backend API

**Backend:**
- Node.js – as the runtime environment
- Express.js – as the web framework for building REST APIs
- Mongoose – for defining schemas and interacting with MongoDB
- JSON Web Tokens (JWT) – for stateless user authentication
- bcrypt – for hashing user passwords before storing them
- Multer – for handling image file uploads from the owner's device

**Database:**
- MongoDB – a NoSQL database used to store users, properties, bookings, and booking history

---

## System Architecture

HouseHunt follows a standard client-server architecture. The React frontend runs on its own development server and communicates with the Node/Express backend through HTTP REST API calls using Axios. All data is stored in a MongoDB database, which the backend accesses through Mongoose.

The flow is straightforward:
1. The user interacts with the React frontend
2. The frontend sends an API request to the Express backend (e.g., login, fetch properties, submit booking)
3. The backend processes the request, interacts with MongoDB if needed, and sends back a JSON response
4. The frontend updates the UI based on the response

Authentication is handled using JWT tokens. When a user logs in, the backend returns a token that the frontend stores in `localStorage`. Every subsequent protected API request includes this token in the Authorization header.

---

## MVC Architecture

The backend follows the Model–View–Controller (MVC) pattern, which helps keep the code organized and easy to maintain.

- **Models** – defined using Mongoose, these represent the database schema for entities like User, Property, and Booking. All database interaction logic lives here.
- **Controllers** – these contain the business logic. Each controller function handles a specific API operation (for example, creating a property, confirming a booking, or fetching a user's dashboard data).
- **Routes** – these act as the entry points for the API. Each route maps an HTTP method and URL path to the appropriate controller function. Middleware like authentication checks are applied at the route level.

Since this is a REST API backend, there is no server-side view layer. The React frontend serves as the view.

---

## User Roles

The system supports three distinct user roles, each with different access levels and capabilities.

**Tenant**
A tenant is a user looking to rent a property. After registering as a tenant, they can browse available listings, filter by location, price, and property type, view full property details, and send a booking request to the owner. They can track all their booking requests from a dedicated bookings page.

**Owner**
An owner is a user who wants to list their property for rent. After registering as an owner, they can add new property listings (with images, amenities, rent amount, and description), view their listed properties on a dashboard, and manage booking requests from tenants. They can accept or reject requests, and accepted bookings mark the property as unavailable.

**Admin**
An admin has a global view of the platform. They can view all users, all properties, and all bookings. The admin role is intended for internal management and moderation of the platform.

---

## Features Implemented

**User Authentication**
Users can register as either a Tenant or an Owner. Passwords are hashed with bcrypt before being stored. On login, the server issues a JWT token that is used to authenticate all protected API calls.

**Property Listing (Owner)**
Owners can list a new property by filling in details such as title, description, location, rent amount, property type, furnishing status, number of bedrooms, area in sq.ft, and amenities. Images can be uploaded directly from the owner's device. The first uploaded image is used as the poster.

**Property Browsing and Search (Tenant)**
Tenants can browse all available properties on a listings page. A search and filter panel lets them narrow results by location, price range, property type, and number of bedrooms. Properties are sorted so that available listings appear before booked ones, and newer listings appear first within each group.

**Booking Requests**
Tenants can send a booking request to an owner from the property detail page. The owner receives the request in their bookings/dashboard view along with the tenant's contact details. The owner can then accept or reject the request. If accepted, the property status changes to Booked and it is removed from active listings.

**Owner Dashboard**
Owners have a dashboard that shows a summary of their listed properties, how many are available vs booked, and any pending booking requests. The data refreshes every time the page is visited.

**Admin Panel**
Admins can view all registered users and all property listings through a dedicated admin panel.

**Role-Based Navigation**
The navigation bar and page content are tailored to each role. Tenants see browsing and booking options. Owners see listing and request management options. Guests are prompted to register before accessing any features.

---

## Database Design

**User**
Stores the user's name, email (unique), phone number, hashed password, role (Tenant, Owner, or Admin), profile image URL, and current location. Timestamps are automatically added.

**Property**
Stores the property title, description, location, rent amount, type (Apartment, House, Villa, etc.), furnishing status, number of bedrooms and bathrooms, area in sq.ft, a list of amenities, an array of image URLs, the current status (Available or Booked), and a reference to the owner's User document.

**Booking**
Stores references to the tenant (User) and property (Property), the desired start and end dates, the date the booking was created, and the current status (Pending, Confirmed, or Rejected).

**BookingHistory**
Stores a record of past bookings associated with a user and property, primarily for future reporting use.

---

## Project Structure

```
househunt/
├── backend/
│   ├── config/          # MongoDB connection setup
│   ├── controllers/     # Business logic for auth, properties, bookings, users
│   ├── middleware/      # JWT authentication middleware, Multer upload middleware
│   ├── models/          # Mongoose schemas: User, Property, Booking, BookingHistory
│   ├── routes/          # Express API route definitions
│   ├── uploads/         # Stores uploaded property images
│   └── server.js        # Entry point: Express app setup, DB connection, routes
│
└── frontend/
    └── src/
        ├── components/  # Navbar, Footer, PropertyCard, SearchFilter, BookingForm
        ├── context/     # AuthContext for global user state
        ├── pages/       # All page-level components (Home, Login, Dashboard, etc.)
        ├── services/    # api.js — Axios instance with base URL and auth headers
        ├── theme.js     # MUI theme configuration
        └── main.jsx     # React entry point
```

---

## How the Application Works

When a new user visits HouseHunt, they land on the home page which gives a brief overview of the platform. From there they can register either as a Tenant or an Owner.

A **Tenant** after logging in can go to the properties listing page, use the search filters to find something that fits their needs, open the property detail page to see the full information including the owner's contact, and send a booking request. They can check the status of all their requests from the My Bookings page.

An **Owner** after logging in sees their dashboard which shows how many properties they have listed and how many booking requests are pending. They can add new listings from the List Property page and manage incoming booking requests. When they confirm a request, the property is marked as Booked and disappears from the public listing.

An **Admin** has access to all of this through the Admin Panel and can view the entire state of the platform.

---

## Deployment

The project can be deployed using the following services:

- **MongoDB Atlas** – cloud-hosted MongoDB database. Replace the local `MONGO_URI` in `.env` with the Atlas connection string.
- **Render or Railway** – for hosting the Node.js backend. Both platforms support environment variable configuration and can run the backend service directly.
- **Vercel or Netlify** – for hosting the React frontend. The `api.js` base URL would need to be updated to point to the deployed backend URL instead of `localhost:5000`.

---

## Future Improvements

There are several features that could make this platform more useful with more development time:

- **In-app chat** – a real-time messaging system between tenants and owners so they can communicate directly within the platform instead of sharing phone numbers
- **Payment integration** – connecting a payment gateway like Razorpay so tenants can pay deposits or rent amounts online
- **Map view** – integrating Google Maps or Leaflet to show property locations on a map, which would help tenants get a better sense of the neighborhood
- **Smart recommendations** – using the tenant's search history and preferences to suggest relevant properties
- **Email notifications** – sending email alerts when a booking is confirmed, rejected, or when a new message is received

---

## Conclusion

HouseHunt is a complete MERN stack application that covers real-world scenarios like role-based authentication, file uploads, REST API design, and dynamic data rendering. It was built as part of an academic project to demonstrate the practical application of full-stack web development concepts. The platform is functional, reasonably well-structured, and can serve as a solid foundation for a more complete rental management product with additional development.

---

*Submitted as part of the SkillWallet / SmartBridge academic project evaluation.*
