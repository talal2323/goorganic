# Pages Directory

This directory contains all the top-level page components for the application, organized by user role and access level. This structure was adopted to provide a clear and scalable way to manage different sections of the application.

## Directory Structure

- **`/auth`**: Contains all authentication-related pages, such as Login, Registration, and Forgot Password. These are typically public-facing but are part of the authentication flow.

- **`/admin`**: Contains all pages exclusive to the Admin dashboard. Access to these routes is restricted to users with the 'admin' role.

- **`/vendor`**: Contains all pages for the Vendor dashboard, such as managing products, viewing orders, and analytics. Access is restricted to 'vendor' role users.

- **`/public`**: Contains all pages accessible to the general public and logged-in customers. This includes the home page, product listings, user profiles, etc.

## Rationale

This structure replaced a previous model where page components were mixed inside the `src/components` directory. By separating pages into this top-level directory, we achieve:

1.  **Clear Separation of Concerns**: It's immediately obvious which components are pages versus reusable UI elements.
2.  **Role-Based Organization**: Grouping pages by role (`admin`, `vendor`, etc.) simplifies routing logic and access control.
3.  **Scalability**: As new pages or roles are added, they can be placed in their respective directories without cluttering the main components folder.
4.  **Canonical Source of Truth**: Each page exists in one location, eliminating the previous wrapper/re-export pattern and reducing confusion.
