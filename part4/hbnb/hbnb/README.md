# 🏠 HBNB - Holberton BnB (Part 4)

## 🎯 Project Overview
A full-stack Bed and Breakfast service with a RESTful API built with Flask and a dynamic frontend. This project implements Clean Architecture patterns and features user authentication, place listings, reviews, and amenities.

## 📁 Project Structure
````
part4/hbnb/
├── hbnb/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── models/          # Business logic
│   │   ├── services/        # Facade pattern
│   │   └── persistence/     # Repository pattern
│   ├── base_files/          # Frontend files
│   │   ├── html/
│   │   ├── styles/
│   │   └── scripts/
│   └── run.py               # Application entry point
└── requirements.txt
````

## 🚀 Installation & Setup

### Backend Setup
# Create and activate virtual environment
````
python3 -m venv venv_part4
source venv_part4/bin/activate
````

# Install dependencies
````
pip install -r requirements.txt
````

# Run the application
````
python run.py
````
  # Server starts at http://localhost:5000

### Frontend Setup
# Serve the frontend files using any HTTP server
# Example with Python's built-in server:
````
cd part4/hbnb/hbnb/base_files
python -m http.server 8080
```` 
 # Frontend accessible at http://localhost:8080/html/index

## 🧩 Core Features

### 1. 🔐 User Authentication
- JWT-based authentication system
- Login/Logout functionality
- Protected routes requiring authentication

### 2. 📦 Place Listings
- Browse available places
- Filter places by price
- View detailed place information
- Create new place listings (authenticated users)

### 3. ⭐ Reviews System
- Submit reviews with ratings (1-5 stars)
- View reviews for each place
- Validation to prevent users from reviewing their own places
- Limitation of one review per user per place

### 4. 🧰 Amenities Management
- Associate amenities with places
- Filter places by amenities

## 🔌 API Endpoints

### 🔑 Authentication
POST /api/v1/auth/login
- Login and receive JWT token
- Body: { "email": "user@example.com", "password": "password" }

POST /api/v1/auth/register
- Register new user
- Body: { "email": "user@example.com", "password": "password", "first_name": "John", "last_name": "Doe" }

### 👥 User Management
GET /api/v1/users
- Get all users (admin only)

GET /api/v1/users/<user_id>
- Get specific user details

PUT /api/v1/users/<user_id>
- Update user (authenticated user can only update their own profile)
- Body: { "first_name": "Updated", "last_name": "Name" }

### 🏡 Place Management
GET /api/v1/places
- Get all places
- Query params: price_max, amenity_ids[]

GET /api/v1/places/<place_id>
- Get specific place details

POST /api/v1/places
- Create new place (authenticated)
- Body: {
    "name": "Cozy Apartment",
    "description": "Nice stay",
    "price": 100.0,
    "location": "Paris, France",
    "amenity_ids": ["amenity_uuid1", "amenity_uuid2"]
  }

PUT /api/v1/places/<place_id>
- Update place (owner only)

### ⭐ Review Management
GET /api/v1/reviews?place_id=<place_id>
- Get reviews for a specific place

POST /api/v1/reviews
- Create new review (authenticated)
- Body: {
    "text": "Great place!",
    "rating": 5,
    "place_id": "place_uuid"
  }

### 🛋️ Amenity Management
GET /api/v1/amenities
- Get all available amenities

POST /api/v1/amenities
- Create new amenity (admin only)
- Body: { "name": "Wi-Fi" }

## 📱 Frontend Pages

### Login/Register Pages
- User authentication forms
- JWT token storage in cookies

### Home Page
- Browse all available places
- Filter by price
- Click on places to see details

### Place Details Page
- View comprehensive place information
- See all reviews with ratings
- Submit your own review (if authenticated)

### User Profile Page
- View and edit your profile information
- See places you've listed
- Manage your reviews

## 🖥️ API Usage Example

### Authentication and Getting Places
// Login
async function login() {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "user@example.com", password: "password" })
  });
  
  const data = await response.json();
  const token = data.access_token;
  
  // Store token in cookie
  document.cookie = `token=${token}; path=/; max-age=86400`;
}

// Fetch places
async function getPlaces() {
  const token = getCookie('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch('http://localhost:5000/api/v1/places', {
    method: 'GET',
    headers: headers
  });
  
  return await response.json();
}

### Submitting a Review
````
async function submitReview(placeId, text, rating) {
  const token = getCookie('token');
  
  if (!token) {
    alert('You must be logged in to submit a review');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: text,
        rating: rating,
        place_id: placeId
      })
    });
    
    if (response.ok) {
      alert('Review submitted successfully!');
    } else {
      const data = await response.json();
      alert(`Error: ${data.error || response.statusText}`);
    }
  } catch (error) {
    console.error('Error submitting review:', error);
  }
}
````

## 📊 Status Codes & Responses

- 200: Success (GET, PUT)
- 201: Resource Created (POST)
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Resource Not Found

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration for secure cross-origin requests
- Authorization checks for protected operations

---

## 🌟 Summary
HBNB is a full-stack Airbnb-like application that enables users to browse, book, and review places. It implements clean architecture principles, separates concerns between frontend and backend, and provides a seamless user experience through a RESTful API and dynamic frontend.
```