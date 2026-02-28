# Mahismathi Warriors
An inventory management and auto-restocking system.

## Setup

### Prerequisites
- Node.js & npm (for frontend)
- Python 3.8+ (for backend)

### Backend
1. Navigate to `backend` folder: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Set up the `.env` file (see the Configuration section below).
4. Run the backend server: `python -m uvicorn main:app --reload`

### Frontend
1. Navigate to `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Configuration
Create a `.env` file in the root of the project with the following variables:

```env
# Email Configuration
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
WAREHOUSE_EMAIL=warehouse_email@gmail.com

# System Configuration
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
WHATSAPP_TO=whatsapp:+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Default Twilio Sandbox number
```

### WhatsApp Alerts Setup
This project uses Twilio's WhatsApp Sandbox to send automatic restocking alerts.
1. Sign up for a free Twilio account.
2. Navigate to **Messaging -> Try it out -> Send a WhatsApp message**.
3. You will be given a Sandbox number (e.g., `+1 415 523 8886`).
4. From your personal WhatsApp, send the generated join code (e.g., `join <word>`) to the Sandbox number to opt-in.
5. Once you receive the confirmation message on WhatsApp, your local environment will successfully receive restock alerts.

### AI Chat Setup (Groq)
This project uses Groq's high-speed AI inference for the live chatbot functionality.
1. Sign up/Log in to the [GroqCloud Console](https://console.groq.com/keys).
2. Generate an API Key.
3. Add the generated key to your `.env` file under `GROQ_API_KEY`.
