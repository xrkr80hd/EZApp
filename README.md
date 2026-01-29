# 🛁 EZBaths Consultant Portal

**Complete mobile-first web app for Bath Planet consultants**

## 📱 Quick Start

### **Visit:** `https://ezapp.xrkr80hd.studio` (or your subdomain)

1. **Enter Customer Last Name** - Start every job by creating a customer file
2. **Navigate Modules** - Complete tasks in order (✓ marks show progress)
3. **Auto-Save** - Everything saves automatically every 10 seconds
4. **Download Files** - All files named with customer last name

---

## 🎯 Features

### **Customer File Management**

- Create customer file at start (last name required)
- All modules automatically use customer name
- Progress tracking with checkmarks
- Resume anytime - data persists in phone storage

### **4 Core Modules (In Order)**

#### 1️⃣ **Weekly Scheduler** ⚠️ REQUIRED WEEKLY

- M/A/E time slots for 7 days
- Red X for unavailable, checkmarks for available  
- Saturday counter integrated
- Vacation dates
- Auto-saves every 10 seconds

#### 2️⃣ **Customer Survey** 📋 PER APPOINTMENT

- 15-question discovery checklist
- Paste-parse customer info from LP Salesman
- Auto-saves every 30 seconds
- All answers stored locally

#### 3️⃣ **Photo Checklist** 📸 PER JOB

- 15 required job site photos
- Measurement inputs for 8 photos (with fraction conversion)
- Auto-saves every 10 seconds
- Files download as: `SMITH_Left_Wall_Depth_60.25.jpg`

#### 4️⃣ **WhoDAT Video** 🎥 AFTER SALE

- Customer introduction video
- Front-facing camera
- Auto-fills customer name
- Downloads as: `SMITH_WhoDAT_Video.mp4`

### **Bonus Tools**

- 💰 **Commission Calculator** - Calculate earnings with AP breakdown
- 🎨 **Design Studio** - Link to Bath Planet design tools

---

## 🔄 Workflow

```
1. Open app → create-customer.html
2. Enter customer last name (e.g., "SMITH")
3. Navigate to modules from index.html
4. Complete in order (or skip around)
5. Files auto-named: SMITH_[module]_[details]
6. Switch apps safely - auto-saves every 10 seconds
7. Return anytime - progress persists
```

---

## 💾 Data Storage

**Everything saves to your phone's browser localStorage:**

- ✅ Works offline after first load
- ✅ Survives app switching
- ✅ Persists until you manually clear
- ✅ No internet required (except initial load)

**Files Download To:**

- iPhone: Files → Downloads
- Android: Downloads folder

---

## 🚀 Deployment

### **Upload to Your Subdomain:**

1. Create subdomain: `ezapp.yourdomain.com`
2. Upload these files to subdomain folder:

   ```
   /index.html
   /create-customer.html
   /scheduler.html
   /customer-survey.html
   /photo-checklist.html
   /whodat-video.html
   /commission_caluculator
   /assets/
   ```

3. Visit: `https://ezapp.yourdomain.com`
4. Add to home screen on phone

### **Add to iPhone Home Screen:**

1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"
4. Now it works like a native app! 📱

---

## 🎨 Design

- **Colors:** Dark navy (#1a1a2e, #16213e, #0f3460) with gold/coral accents
- **Theme:** Glassmorphism with backdrop blur effects
- **Icons:** Custom SVG icons with glow effects
- **Mobile-First:** Optimized for iPad/phone use in the field

---

## 🔧 Technical Details

- **Frontend Only:** Pure HTML5, CSS3, vanilla JavaScript
- **No Backend Required:** Everything runs in browser
- **Storage:** localStorage for offline persistence  
- **Camera Access:** HTML5 file input with capture attribute
- **Auto-Save:** 10-second intervals prevent data loss
- **File Naming:** Automatic with customer last name prefix

---

## ⚙️ File Naming Convention

**Photos:**

```
SMITH_House_Exterior.jpg
SMITH_Bathroom_Overview.jpg
SMITH_Left_Wall_Depth_60.25.jpg  (with measurement)
SMITH_Right_Wall_Depth_48.5.jpg
```

**Video:**

```
SMITH_WhoDAT_Video.mp4
```

**Future (when PDF export added):**

```
SMITH_Scheduler.pdf
SMITH_Customer_Survey.pdf
```

---

## 🆘 Troubleshooting

**Camera not working?**

- Allow camera permissions in browser
- Use Safari on iPhone (best compatibility)
- Make sure you're on HTTPS (required for camera)

**Photos/data disappeared?**

- Check if you cleared browser data
- Make sure you're in same browser
- Data is browser-specific (Safari vs Chrome)

**Can't download files?**

- Check browser download permissions
- Look in Files app → Downloads (iPhone)
- Try downloading one at a time

**Lost progress when switching apps?**

- Everything auto-saves every 10 seconds
- Data persists even if app closes
- Return to same browser to resume

---

## 📝 Notes

- **No login required** - Single-user app (for now)
- **No database** - Everything stored locally on your phone
- **Works offline** - After first load, internet not needed
- **Privacy** - All data stays on YOUR phone until you export

---

## 🔮 Future Enhancements (Not Yet Built)

- [ ] Export all customer files as single ZIP
- [ ] PDF generation for scheduler/survey
- [ ] Multi-user with login/authentication  
- [ ] Cloud sync to MySQL database
- [ ] Admin dashboard to view all submissions

---

## 📞 Support

Built for Bath Planet consultants to streamline field work.

**Created:** October 2025  
**Version:** 1.0  
**Platform:** Progressive Web App (PWA-ready)

---

## ✨ That's It

**You're ready to use this on your 6:30 AM appointment tomorrow! 🚗💼**

Just upload to your subdomain, add to home screen, and go! 🎉
