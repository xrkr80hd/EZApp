# EZBaths Portal - Site Map

## 📱 Application Structure

### **Entry Point**

- **index.html** - Main landing page with 2 primary options
  - Start a New Customer workflow
  - Create Weekly Schedule

---

## 🎯 Main Workflows

### **1. Customer Workflow** (Start from create-customer.html)

```
create-customer.html (Entry)
    ↓
portal.html (Customer Dashboard)
    ↓
    ├─→ customer-survey.html (15-question discovery)
    ├─→ photo-checklist.html (15 required photos + measurements)
    ├─→ whodat-video.html (Customer intro video)
    ├─→ bathroom-measurement.html (Detailed measurements)
    ├─→ 4-square.html (Sales tool)
    └─→ post-appointment.html (Post-sale workflow)
         ├─→ post-sale-checklist.html
         ├─→ post-sale-documents.html
         └─→ joc-complete.html / joc-complete-new.html
```

### **2. Scheduler Workflow** (Independent)

```
scheduler.html (Weekly availability - M/A/E slots)
    - Required weekly
    - Red X for unavailable
    - Checkmarks for available
    - Saturday counter
    - Vacation dates
```

---

## 🛠️ Tools & Utilities

### **Bonus Tools** (Accessible from portal)

- **commission_calculator.html** - Calculate earnings with AP breakdown
- **tools.html** - Additional utilities
- **tip-sheet.html** - Reference guide

---

## 👥 Admin Section

### **Admin Pages** (admin/ folder)

- **admin-users.html** - User management (admin only)
- Requires authentication

---

## 📄 Supporting Pages

### **Informational**

- **important-install-notes.html** - Installation guide
- **offline.html** - PWA offline page

### **Processing**

- **office-processing.html** - Office workflow

---

## 🔧 Technical Files

### **Configuration**

- **manifest.json** - PWA manifest
- **service-worker.js** - Offline functionality
- **config.php** - Server configuration
- **htaccess.sample** - Apache configuration

### **Database**

- **database.sql** - Main database schema
- **database-setup.sql** - Setup scripts
- **database-auth.sql** - Authentication tables

### **API** (api/ folder)

- **check-session.php** - Session validation
- **login.php** - Authentication
- **logout.php** - Session termination
- **users.php** - User management

### **Modules** (modules/ folder)

- **appointments/** - Appointment management
- **documents/** - Document handling
- **export/** - Export functionality
- **schedule/** - Scheduling system

### **Assets** (assets/ folder)

- **css/** - Stylesheets
- **js/** - JavaScript files
  - auth-check.js
  - ezapp-data.js
  - universal-cache.js
- **images/** - Image assets
- **app_icons/** - PWA icons (SVG & PNG)

### **Uploads** (uploads/ folder)

- **documents/** - Uploaded documents
- **exports/** - Exported files
- **photos/** - Job site photos

---

## 🔄 User Flow

### **Typical User Journey:**

1. **Open App** → `index.html`
2. **Choose Path:**

   **Path A: Customer Job**
   - Click "Start a New Customer"
   - Enter customer last name → `create-customer.html`
   - Navigate to customer portal → `portal.html`
   - Complete modules in order:
     1. Customer Survey
     2. Photo Checklist (with measurements)
     3. WhoDAT Video
     4. Post-Appointment (after sale)

   **Path B: Weekly Schedule**
   - Click "Create Your Weekly Schedule"
   - Fill out availability → `scheduler.html`
   - Submit weekly schedule

3. **Bonus Tools** (from portal):
   - Commission Calculator
   - Design Studio links
   - Tip Sheet

---

## 💾 Data Flow

### **Storage:**

- **localStorage** - All customer data, progress, schedules
- **Server** (if configured) - User authentication, backups

### **File Downloads:**

- Photos: `LASTNAME_Description_Measurement.jpg`
- Videos: `LASTNAME_WhoDAT_Video.mp4`
- Future: PDF exports for surveys/schedules

---

## 🎨 Design System

### **Colors:**

- Primary: Dark navy (#1a1a2e, #16213e, #0f3460)
- Accents: Blue (#3498db), Green (#2ecc71)
- Highlights: Gold/Coral (#FFB84D, #FF6B6B)

### **Theme:**

- Glassmorphism with backdrop blur
- Gradient backgrounds
- Custom SVG icons with glow effects
- Mobile-first responsive design

---

## 📱 PWA Features

- **Offline Support** - Service worker caching
- **Add to Home Screen** - manifest.json
- **App Icons** - Multiple sizes (180, 192, 512)
- **Standalone Mode** - Works like native app

---

## 🔐 Authentication (Optional)

- Login system available (login.html)
- Session management (PHP backend)
- User roles (admin vs regular user)
- Currently: Single-user mode (no login required)

---

## 📊 Page Hierarchy

```
index.html (Root)
├── create-customer.html
│   └── portal.html (Customer Dashboard)
│       ├── customer-survey.html
│       ├── photo-checklist.html
│       ├── whodat-video.html
│       ├── bathroom-measurement.html
│       ├── 4-square.html
│       ├── commission_calculator.html
│       ├── tools.html
│       ├── tip-sheet.html
│       └── post-appointment.html
│           ├── post-sale-checklist.html
│           ├── post-sale-documents.html
│           └── joc-complete.html
│
├── scheduler.html (Independent)
│
├── admin-users.html (Admin only)
│
└── office-processing.html (Office workflow)
```

---

## 🎯 Key Features by Page

| Page | Purpose | Key Features |
|------|---------|--------------|
| index.html | Landing | 2 main options, clean UI |
| create-customer.html | Customer entry | Last name input, validation |
| portal.html | Dashboard | Module navigation, progress tracking |
| scheduler.html | Weekly schedule | M/A/E slots, vacation dates |
| customer-survey.html | Discovery | 15 questions, auto-save |
| photo-checklist.html | Photos | 15 photos, measurements, fractions |
| whodat-video.html | Video | Customer intro, front camera |
| commission_calculator.html | Calculator | Earnings, AP breakdown |
| post-appointment.html | Post-sale | Document completion |

---

## 🔄 Data Persistence

- **Auto-save intervals:**
  - Scheduler: Every 10 seconds
  - Survey: Every 30 seconds
  - Photos: Every 10 seconds
  
- **Progress tracking:**
  - Checkmarks for completed modules
  - Resume capability
  - Customer file management

---

## 📝 Notes

- **Frontend-only** - Pure HTML/CSS/JavaScript
- **Optional backend** - PHP for authentication/storage
- **Mobile-optimized** - iPad/phone field use
- **Offline-capable** - PWA with service worker
- **Auto-naming** - Files prefixed with customer last name

---

**Total Pages:** ~25 HTML files
**Total Workflows:** 2 main + admin + tools
**Storage:** localStorage + optional server
**Target Users:** Bath Planet consultants (field work)

---

*Last Updated: 2024*
*Version: 1.0*
