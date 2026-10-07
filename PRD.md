# Product Requirements Document

## Product

TradeKnowledge is a knowledge-sharing platform for students, apprentices, and working professionals in Electrical, Plumbing, Welding, HVAC, Carpentry, Automotive, and Masonry trades. Members publish practical guides; administrators review them before they enter the public library.

## Member workflows

- Register and sign in with a unique email and a securely hashed password.
- Create a profile with trade specialization, experience level, biography, and profile image URL.
- Browse, search, and filter published guides by trade; open a guide with its steps and safety precautions.
- Submit a guide with a category, description, practical steps, and at least one specific safety precaution. Optional images are JPEG, PNG, or WebP uploads.
- Edit or delete only guides they authored. Editing published or rejected content returns it to moderation.
- Comment on published guides, submit or update a 1–5 rating, bookmark guides, and view a personal dashboard.

## Administration

- Review and approve or reject pending guides, with an optional review note.
- View and manage member roles; protect the final administrator account from removal or demotion.
- Create, edit, and delete categories when no tutorials depend on them.
- View basic member, tutorial, comment, category, and view-count statistics.

## Content and safety rules

- Public browsing exposes published tutorials only. Pending and rejected tutorials are private to their author and administrators.
- Every submitted guide requires practical steps and at least one safety precaution. The platform is educational and does not replace local code, manufacturer procedures, site risk assessment, qualified supervision, or professional judgment.
- The interface must not describe hazardous work as risk-free.

## Technology

- Frontend: React, Vite, JavaScript, CSS, Axios, and React Router.
- Backend: Node.js, Express, Mongoose, and MongoDB Atlas.
- Authentication: bcryptjs password hashing and signed JWT bearer tokens.

## Out of scope

Video streaming, live workshops, AI troubleshooting, native mobile applications, and deployment are not part of this project phase.