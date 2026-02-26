# EZAPP Sleep Handoff - 2026-02-26

## What Was Completed

### 1. Tip Sheet corrected to Rehash form intent
- Replaced appointment-style checklist content with a rehash-focused form structure.
- Kept photo sequence thumbnails at the bottom section as requested.
- Tip sheet now stores data in customer-scoped localStorage (`tipSheet_<customer>`), and reads photo sequence from `photos_<customer>`.

File:
- `next-pwa-app/src/app/tools/tip-sheet/page.tsx`

### 2. Customer Survey -> 4-Square wiring restored
- Added compatibility save path from survey so 4-square can populate expected legacy-style fields.
- Added `Populate from Survey` action in 4-square.
- 4-square now reads in this order:
  1. `EZAPP_current.survey`
  2. `surveyStructured_<customer>`
  3. fallback mapping from `survey_<customer>`

Files:
- `next-pwa-app/src/app/tools/customer-survey/page.tsx`
- `next-pwa-app/src/app/tools/4-square/page.tsx`

### 3. Bathroom Measurement page rebuilt to match old workflow structure
- Rebuilt into a fuller form layout with sections similar to prior version.
- Auto-populates customer and pulls photo checklist measurements.
- Kept mapping logic from prior working behavior:
  - photo id/description for left wall depth -> `measureB`
  - right wall depth -> `measureE`
  - soap dish depth -> `measureD`
- Saves into:
  - `bathroomMeasurement_<customer>`
  - `EZAPP_current.documents.bathroomMeasurement`

File:
- `next-pwa-app/src/app/tools/bathroom-measurement/page.tsx`

### 4. New Vanity / Onyx Lavatory form added
- New tool page created: `/tools/vanity-form`
- Linear input form built.
- `Generate Filled Form` overlays typed values onto uploaded Onyx template image.
- Bowl style selection implemented (`Venetian`, `Oval`, `No Bowl`).
- Uses `red_circle.png` overlay marker on selected bowl for export.
- `Download PNG` exports filled result.

Files:
- `next-pwa-app/src/app/tools/vanity-form/page.tsx`
- `next-pwa-app/public/images/onyx-form.jpg`
- `next-pwa-app/public/images/red_circle.png`

### 5. Navigation updates
- Added Vanity Form to Tools page.
- Added Vanity Order Form item to Post-Sale Documents list.

Files:
- `next-pwa-app/src/app/tools/page.tsx`
- `next-pwa-app/src/app/tools/post-sale-documents/page.tsx`

### 6. Assets
- Added/kept circle marker source in repo assets:
  - `assets/images/red_circle.png`

## Build Verification
- `npm run build` in `next-pwa-app` passes after these changes.

## Docker
- Requested to push updated image tag:
  - `docker.io/xrkr80hd/ezapp-pwa:latest`

## Git
- Remote configured:
  - `origin git@github.com:xrkr80hd/EZApp.git`

## Next Fixes (From Live Docker QA)
- Vanity Form (`/tools/vanity-form`): some numeric overlay values on the generated Onyx order sheet are not landing in the correct printed positions.
- Priority for next session: adjust text overlay coordinates in `next-pwa-app/src/app/tools/vanity-form/page.tsx` so order sheet numbers align exactly with the form boxes.
- QA reference: user screenshot at Thu Feb 26, 2026 around 12:43 PM shows the misalignment case.
