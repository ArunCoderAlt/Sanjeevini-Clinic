# Sanjeevini Siddha & Ayurveda Medical Centre

A premium, modern full-stack MERN website for Sanjeevini Siddha & Ayurveda Medical Centre, Karaikal. Includes a patient-facing clinical portal, responsive booking inquiries, video reels showcase, and an advanced Admin Dashboard featuring PDF RAG Knowledge Management and Groq LLM Token Usage Telemetry.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion, GSAP |
| **Backend** | Node.js, Express.js, Supabase (PostgreSQL), @supabase/supabase-js |
| **AI / LLM & RAG** | Groq Cloud API (`qwen/qwen3.8-27b`, `openai/gpt-oss-120b`), `pdf-parse` |
| **Usage Telemetry** | Salted SHA-256 Key Fingerprinting, Automatic Cycle Reset, Live Groq RPM/TPM Headers |
| **Auth** | JWT, bcryptjs |
| **Icons** | Lucide React |
| **Forms** | React Hook Form, Zod |
| **Email** | Nodemailer |
| **Storage / Media** | Supabase Storage (`rag-documents`, public buckets with local disk fallback) |
| **Security** | Helmet, CORS, express-rate-limit |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (Free tier on [supabase.com](https://supabase.com))
- Groq Cloud API Key (Free tier on [console.groq.com](https://console.groq.com/keys))

### Installation

```bash
# Install all dependencies (root + client + server)
npm run install:all
```

### Supabase Database Setup

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> Click **New Query**.
3. Run the following schemas in order:
   - `supabase/schema.sql` (Core clinic tables: doctors, services, treatments, appointments, testimonials, settings)
   - `server/supabase_rag_schema.sql` (PDF RAG documents, knowledge chunks, and `rag-documents` storage bucket)
   - `server/supabase_groq_usage_schema.sql` (Groq API key tracking periods and audit logs)
4. In your Supabase Dashboard, navigate to **Project Settings** -> **API**:
   - Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - Copy the **service_role secret** key (or anon key)

### Environment Setup

```bash
# Copy example env for server
cp server/.env.example server/.env
```

Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Admin Credentials
ADMIN_EMAIL=admin@sanjeevinisiddha.in
ADMIN_PASSWORD=admin123

# Groq LLM API Configuration for AI Chatbot
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

### Seed Database (Optional via Node)

```bash
npm run seed
```

This seeds default clinic data:
- Admin user (`admin@sanjeevinisiddha.in` / `admin123`)
- 2 Doctors (Dr. Thiagarajan Saminadane, Dr. Subashini Ganesan)
- 4 Services (Consultation, Varmam, Thokkanam, Wellness)
- 11 Treatment categories with conditions

### Run Development

```bash
# Run both client and server concurrently
npm run dev

# Or run separately:
npm run client   # Vite dev server on :5173
npm run server   # Express server on :5000
```

### Build for Production

```bash
npm run build    # Builds client to client/dist/
```

---

## AI Chatbot & Groq LLM Architecture

The Sanjeevini AI Chatbot provides verified clinical answers grounded in uploaded clinic PDFs using Retrieval-Augmented Generation (RAG).

```
   [Patient Query]
          │
          ▼
   [Text Search / RAG Engine] ───► [Supabase rag_chunks (PDF Excerpts)]
          │
          ▼
   [Context Grounded Prompt]
          │
          ▼
   [Groq Cloud LLM] ──────────► [qwen/qwen3.8-27b (~80ms Ultra-Fast)]
          │
          ▼
   [Token Usage Tracker] ─────► [Key Fingerprint + Token Counts + Rate Limits]
          │
          ▼
   [Grounded Patient Answer]
```

### Supported Groq Production Models

| Model ID | Model Name | Description |
|:---|:---|:---|
| `qwen/qwen3.8-27b` | **Qwen 3.8 27B (Default)** | Ultra-fast (~80ms latency), highly accurate for clinical Q&A, answers immediately without wasting tokens on reasoning chains. |
| `openai/gpt-oss-120b` | **OpenAI GPT-OSS 120B** | Flagship large open-weights model for advanced multi-step reasoning. |
| `openai/gpt-oss-20b` | **OpenAI GPT-OSS 20B** | High-speed reasoning model for structured problem solving. |

### API Key Token Usage & Quota Monitoring

The admin panel includes an integrated **Groq API Key Token Usage & Live Quota Monitor** (`/admin/ai-bot`):
- **Active Key Versioning**: Automatically identifies and tracks keys by version (`key_v1`, `key_v2`, etc.) with masked hints (e.g. `gsk_...2m5v`).
- **Zero-Plaintext Security**: API keys are never stored in plaintext within usage logs; they are uniquely indexed using salted SHA-256 fingerprints.
- **Automatic Tracking Reset**: Pasting a new Groq API key automatically starts a fresh tracking period at **0 tokens**, while permanently preserving all past key records.
- **Live Groq Rate Limits**: Reads `x-ratelimit-*` headers from Groq responses to display live remaining RPM (requests) and TPM (tokens) alongside reset timers.
- **Historical Records Archive**: Expandable view of all historical keys, their lifetime token totals, prompt/completion breakdown, and active date ranges.

---

## Project Structure

```
├── client/                     # React Frontend
│   ├── src/
│   │   ├── admin/              # Admin Dashboard
│   │   │   ├── pages/          # Dashboard, Appointments, Reels, AI Bot RAG...
│   │   │   └── components/     # Admin Sidebar, ConfirmDialog...
│   │   ├── components/         # Modular public UI components
│   │   │   ├── home/           # 13 home page sections (Hero, Reels, Services...)
│   │   │   ├── layout/         # Navbar, Footer, Floating WhatsApp & Bot
│   │   │   └── common/         # Buttons, Modals, Lightbox...
│   │   ├── services/           # Axios API services (botService, authService...)
│   │   └── styles/             # Tailwind CSS & global styles
│   └── ...config files
│
├── server/                     # Express Backend
│   ├── config/                 # DB, Supabase, environment variables
│   ├── controllers/            # botController, authController, crud controllers...
│   ├── middleware/             # auth, admin, error, upload, rate-limit
│   ├── models/                 # Supabase models & In-Memory fallbacks
│   ├── routes/                 # botRoutes, reelRoutes, authRoutes...
│   ├── services/               # groqService, groqUsageTracker, botKnowledgeService...
│   └── utils/                  # logger, supabaseModel, token helpers
│
└── supabase/                   # Database SQL schemas & migrations
```

---

## Pages

### Public Pages
| Route | Page |
|-------|------|
| `/` | Home (Hero, About, Doctor Highlights, Services, Treatments, Instagram Reels, Testimonials, Map) |
| `/about` | About the clinic & Siddha philosophy |
| `/doctors` | Doctor listing |
| `/doctors/:slug` | Doctor profile detail |
| `/services` | Services overview |
| `/services/:slug` | Service detail |
| `/treatments` | Searchable treatment categories |
| `/treatments/:slug` | Treatment detail |
| `/gallery` | Filterable photo gallery with lightbox |
| `/testimonials` | Patient testimonials & reviews |
| `/contact` | Contact information, clinic hours, Google map, and inquiry form |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |

### Admin Dashboard (`/admin`)
| Route | Function |
|-------|----------|
| `/admin/login` | Admin authentication |
| `/admin` | Main dashboard with overview stats |
| `/admin/appointments` | Manage patient appointment inquiries |
| `/admin/doctors` | Manage doctor profiles |
| `/admin/services` | Manage clinic services |
| `/admin/treatments` | Manage clinical treatment categories |
| `/admin/gallery` | Manage gallery photos and categories |
| `/admin/reels` | Manage Instagram reels & video showcase |
| `/admin/testimonials` | Approve and manage patient testimonials |
| `/admin/messages` | View and reply to contact messages |
| `/admin/ai-bot` | AI Chatbot Knowledge Base (PDF RAG), Groq API Key & Token Usage Quota Monitor |
| `/admin/settings` | Update clinic contact details, working hours, and SEO |

---

## API Endpoints

All endpoints are prefixed with `/api`.

| Resource | Methods & Routes | Description |
|:---|:---|:---|
| **`/auth`** | `POST /login`, `GET /me`, `POST /logout` | Admin authentication & session verification |
| **`/bot`** | `POST /chat` | Public AI chat query grounded in PDF knowledge |
| | `GET /status` | Overall bot status, chunk counts, Groq connection & active key usage |
| | `GET /usage` *(Admin)* | Complete Groq token usage, rate limits, and historical key periods |
| | `GET /documents` *(Admin)* | List all indexed PDF documents |
| | `POST /upload` *(Admin)* | Upload PDF for RAG extraction & chunk indexing |
| | `DELETE /documents/:id` *(Admin)* | Delete document and its knowledge chunks |
| | `PATCH /documents/:id/toggle` *(Admin)* | Enable/disable document from active RAG retrieval |
| | `PUT /settings` *(Admin)* | Update Groq API Key and Model with live connection test |
| | `POST /restore-seed` *(Admin)* | Restore default clinic portfolio guide document |
| **`/reels`** | `GET /`, `POST /` *(Admin)*, `PUT /:id` *(Admin)*, `DELETE /:id` *(Admin)* | Clinic Instagram & video showcase |
| **`/doctors`** | `GET /`, `GET /:id`, `GET /slug/:slug`, `POST /`, `PUT /:id`, `DELETE /:id` | Doctor profile management |
| **`/services`** | `GET /`, `GET /:id`, `GET /slug/:slug`, `POST /`, `PUT /:id`, `DELETE /:id` | Clinic services management |
| **`/treatments`** | `GET /`, `GET /categories`, `GET /slug/:slug`, `POST /`, `PUT /:id`, `DELETE /:id` | Treatment management |
| **`/appointments`** | `POST /` (public), `GET /` *(Admin)*, `PUT /:id/status` *(Admin)*, `DELETE /:id` *(Admin)* | Appointment booking inquiries |
| **`/gallery`** | `GET /`, `POST /` *(Admin)*, `PUT /:id` *(Admin)*, `DELETE /:id` *(Admin)* | Photo gallery management |
| **`/testimonials`** | `GET /` (approved), `POST /` (submit), `GET /all` *(Admin)*, `PUT /:id` *(Admin)*, `DELETE /:id` *(Admin)* | Patient testimonials |
| **`/contact`** | `POST /` (submit inquiry), `GET /` *(Admin)*, `PUT /:id/read` *(Admin)*, `DELETE /:id` *(Admin)* | Contact inquiries |
| **`/settings`** | `GET /`, `PUT /` *(Admin)* | Clinic settings & SEO configuration |

---

## Design System

| Element | Value |
|---------|-------|
| Primary Green | `#1B5E3B` |
| Secondary Green | `#2E7D5B` |
| Light Sage | `#EAF4EE` |
| Cream | `#F8F5EC` |
| Gold Accent | `#C9A227` |
| Dark | `#17221C` |
| Heading Font | Playfair Display |
| Body Font | Inter |

---

## License

Private - Sanjeevini Siddha & Ayurveda Medical Centre
