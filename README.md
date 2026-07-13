# Secure File Management & Sharing System

A secure, enterprise-ready **REST API** for file management and sharing, built with **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma ORM**. The system is designed around a centralized administrative model where all authorization is dynamically managed without requiring changes to the application code. It combines **JWT authentication**, **Role-Based Access Control (RBAC)**, **List-Based Access Control (LBAC)**, secure file sharing, soft deletion, and automated file lifecycle management to provide a scalable and secure document management solution.

---

## Features

### Authentication & Authorization

The system uses **JWT (JSON Web Tokens)** to authenticate users and protect all secured endpoints. Authorization is implemented through a **dynamic Role-Based Access Control (RBAC)** system, allowing administrators to assign permissions to roles instead of individual users. Every protected route is secured using middleware that validates user permissions before granting access. In addition to RBAC, the system implements **List-Based Access Control (LBAC)** for secure file sharing, ensuring that shared files are accessible only to explicitly authorized users.

### Dynamic User, Role & Permission Management

The application provides a fully dynamic authorization model where administrators can create, update, and remove roles as well as define system permissions without modifying the source code. Permissions can be assigned or revoked from roles at any time, and users automatically inherit the capabilities associated with their assigned roles. This architecture enables organizations to adapt their authorization policies as requirements evolve while maintaining a clean and scalable codebase.

### File Management

The system supports secure file uploads, downloads, updates, and deletion while ensuring users can only interact with files they are authorized to access. Administrators have unrestricted access to all files within the system, whereas regular users are limited to files they own or those explicitly shared with them. To enhance security, physical file locations remain hidden from users through the use of **real and virtual path mapping**. Files are also organized using dynamically managed **categories** and **document types**, allowing administrators to customize document classification without changing the application's implementation.

### Dynamic System Configuration

Rather than hardcoding system configurations, administrators can dynamically manage core components including **roles**, **permissions**, **file categories**, and **document types** directly through the API. This design significantly improves maintainability and allows the system to adapt to changing business requirements without requiring redevelopment.

### Secure File Sharing

The application includes a secure file-sharing mechanism that allows users to generate shareable links with configurable expiration times. Shared files can be granted either **read-only** or **read-and-write** permissions depending on the owner's authorization. Every sharing operation is validated through the authorization layer to ensure only eligible users can create or access shared resources.

### File Recovery & Lifecycle Management

Instead of permanently removing files immediately after deletion, the system implements a **soft delete** mechanism. Deleted files are moved to a recovery area where they remain available for **30 days**, allowing users to restore accidentally deleted documents. A scheduled background job powered by **Node-Cron** automatically performs permanent deletion (**hard delete**) once the retention period expires, ensuring efficient storage management without manual intervention.

### Security

Security is a core principle of the application. Users cannot access files belonging to other users unless explicit sharing permissions exist or administrative privileges are granted. Every protected endpoint enforces authentication and authorization through middleware, while permission validation is performed before executing sensitive operations. The application also conceals actual storage paths, reducing the risk of unauthorized file access and improving overall system security.

---

## Technologies Used

- **Node.js**  
- **Express.js**  
- **PostgreSQL**  
- **Prisma ORM**
- **Multer**
- **JWT (JSON Web Tokens)**
- **Node-Cron** for scheduling jobs
- **Postman** — 

---

## Core Concepts

This project demonstrates the practical implementation of several advanced backend concepts, including:

- **Role-Based Access Control (RBAC)**
- **List-Based Access Control (LBAC)**
- **Dynamic Permission Management**
- **JWT Authentication**
- **Middleware-Based Authorization**
- **Soft Delete**
- **Hard Delete**
- **Secure File Sharing**
- **RESTful API Design**
- **Scheduled Background Jobs (Cron)**
- **Real & Fake File Path Mapping**

---

## Project Highlights

This project showcases an enterprise-style backend architecture capable of supporting dynamic authorization, centralized administrative control, secure document management, and scalable permission handling. Unlike traditional systems with hardcoded roles and permissions, administrators can configure the authorization model entirely through the API. Combined with secure file sharing, automatic file recovery, scheduled cleanup, and a modular architecture, the application demonstrates modern backend development practices suitable for real-world document management systems.