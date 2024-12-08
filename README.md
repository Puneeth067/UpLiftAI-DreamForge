# DreamForge: Creator-Patron Collaboration Platform

## Overview

DreamForge is an innovative platform designed to streamline collaboration between creators and patrons in the modern gig economy. By leveraging advanced technologies like NLP and AI, the platform provides a seamless environment for project discovery, communication, and management.

## Problem Statement

In today's gig economy, creators struggle to showcase their skills and connect with potential clients, while patrons face challenges in identifying the right talent for their projects. DreamForge addresses these pain points by providing a comprehensive, user-friendly collaboration platform.

## Key Features

### For Creators
- Comprehensive portfolio creation and showcase
- NLP-powered AI assistant
- Project bidding and tracking
- Skill verification system
- Performance analytics

### For Patrons
- Advanced creator search and browse functionality
- Project proposal submission
- AI-powered creator recommendations
- Integrated payment and escrow system
- Review and rating capabilities

## Tech Stack

- **Frontend**: 
  - React (with Vite)
  - Tailwind CSS
  - React Router DOM

- **Backend**:
  - Supabase
  - PostgreSQL

- **AI & NLP**:
  - OpenAI API

- **Deployment**:
  - Vercel (Frontend)
  - Supabase (Backend)

- **Testing**:
  - Jest
  - Cypress

## Prerequisites

- Node.js (v14+ recommended)
- npm
- Supabase account
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/puneeth067/UPLIFTAI-SUPPORT.git
   cd UPLIFTAI-SUPPORT/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the client directory with the following:
   ```
   VITE_SUPABASE_URL=''
   VITE_SUPABASE_ANON_KEY=''
   VITE_SUPABASE_SERVICE_ROLE_KEY=''
   access_token=''
   ```

4. Configure Supabase secrets:
   ```bash
   npx supabase secrets set DATABASE_URL=your_supabase_project_url
   npx supabase secrets set DATABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. Deploy Edge Functions:
   ```bash
   cd src
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy delete-account
   ```

6. Run the application:
   ```bash
   npm run dev
   ```

## Additional Development Notes

### Running Deno Function (Windows PowerShell)
```bash
cd src/supabase/functions/delete-account
deno run --allow-net --allow-env --allow-read index.ts
```

## Planned Future Enhancements

- Mobile app version
- Multi-language support
- Community forums
- Enhanced gamification features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Maintainer: Team Uplift
Project Link: [https://github.com/puneeth067/UPLIFTAI-DreamForge](https://github.com/puneeth067/UPLIFTAI-DreamForge)
