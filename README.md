# UPLIFTAI-SUPPORT Client

This is the client-side application for the UPLIFTAI-SUPPORT project.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

UPLIFTAI-SUPPORT is a project aimed at providing AI-driven support solutions. This repository contains the client-side codebase.

## Features

- User-friendly interface
- Real-time support chat
- AI-driven responses
- Multi-language support

## Installation

To install and run the client application locally, follow these steps:

1. Clone the repository:
  ```bash
  git clone https://github.com/puneeth067/UPLIFTAI-SUPPORT.git
  ```
2. Navigate to the client directory:
  ```bash
  cd UPLIFTAI-SUPPORT/client
  ```
3. Install dependencies:
  ```bash
  npm install
  ```
4. In windows Powershell:
  ```bash
  cd UPLIFTAI-SUPPORT\client\src\supabase\functions\delete-account
  deno run --allow-net --allow-env --allow-read index.ts
  ```

5. Set up secret keys in .env as well as supabase:
```bash
npx supabase secrets set DATABASE_URL=your_supabase_project_url
npx supabase secrets set DATBASE_SERVICE_ROLE_KEY=your_service_role_key
```
.env file:

VITE_SUPABASE_URL=''
VITE_SUPABASE_ANON_KEY=''
VITE_SUPABASE_SERVICE_ROLE_KEY=''
access_token=''


6. Deploying Edge Function 
```bash
cd client/src
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy delete-account
```

7. Start the application:
```bash
cd client
npm run dev
```

## Usage

Once the application is running, open your browser and navigate to `http://localhost:5173` to access the client interface.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
