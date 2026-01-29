 into # Universal Caching System - Implementation Guide

## Overview

The EZ Bath app now has a comprehensive auto-caching system that saves all form data automatically, allowing users to navigate away and return without losing their work.

## How It Works

### Automatic Features

1. **Auto-saves every 5 seconds** while you're working
2. **Saves on every input/change** to form fields
3. **Saves before leaving the page** (beforeunload event)
4. **Customer-specific caching** - each customer's data is stored separately
5. **Auto-restores data** when you return to a page

### Manual Save with Overwrite Protection

- When you click "Save", it checks if data already exists
- Shows warning: "⚠️ Data is already saved for this customer. Do you want to overwrite?"
- Clears cache after successful save (since it's now permanently saved)

## Pages with Caching Enabled

### ✅ Fully Implemented

1. **Customer Survey** (`customer-survey.html`)
   - All form fields auto-cache
   - Customer name auto-populated
   - Product type and address fields
   - Cache key: `survey_cache_[CustomerName]`

2. **Photo Checklist** (`photo-checklist.html`)
   - Photos auto-cache per customer
   - Measurements persist
   - Cache key: `photo_cache_[CustomerName]`

3. **Who Dat Video** (`whodat-video.html`)
   - Video data caches before confirmation
   - Customer name auto-populated
   - Cache key: `whodat_cache_[CustomerName]`

4. **TIP Sheet** (`tip-sheet.html`)
   - All checkboxes and text fields auto-cache
   - Overwrite protection on save
   - Cache key: `cache_tip-sheet_[CustomerName]`

### 📋 To Be Implemented

5. **Post-Appointment** (`post-appointment.html`)
6. **Post-Sale Checklist** (`post-sale-checklist.html`)
7. **Office Processing** (`office-processing.html`)
8. **Bathroom Measurement** (`bathroom-measurement.html`)
9. **Important Install Notes** (`important-install-notes.html`)
10. **JOC Forms** (`joc-complete.html`, `joc-page1.html`, `joc-page2.html`)

## Implementation Steps for New Pages

### Step 1: Add Universal Cache Script

```html
<script src="assets/js/universal-cache.js"></script>
```

### Step 2: Setup Auto-Save

```javascript
// At the top of your script section
UniversalCache.setupAutoSave('page-name');
```

### Step 3: Load Cached Data on Page Load

```javascript
window.addEventListener('DOMContentLoaded', function() {
    UniversalCache.loadPageData('page-name');
});
```

### Step 4: Add Overwrite Protection to Save Function

```javascript
function saveData() {
    // Check if overwriting
    const customerName = localStorage.getItem('currentCustomer');
    const existingKey = `saved_data_${customerName}`;
    
    if (localStorage.getItem(existingKey)) {
        const confirmed = confirm('⚠️ Data is already saved for this customer.\n\nDo you want to overwrite the previous save?');
        if (!confirmed) {
            return;
        }
    }
    
    // Your save logic here...
    
    // Clear cache after save
    UniversalCache.clearPageCache('page-name');
    
    // Show confirmation
    UniversalCache.showSaveConfirmation('✓ Data saved successfully!');
}
```

## Cache Keys Format

All cache keys follow this pattern:

```
cache_[page-name]_[CustomerName]
```

Examples:

- `cache_tip-sheet_SMITH`
- `survey_cache_JONES`
- `photo_cache_WILLIAMS`
- `whodat_cache_BROWN`

## Benefits

### For Users

✅ Never lose work when navigating away
✅ Can check other apps/documents and come back
✅ Browser crashes don't lose data
✅ Each customer's data stays separate
✅ Clear visual confirmation when data is saved

### For Development

✅ Consistent caching across all pages
✅ Easy to implement (3 lines of code)
✅ Automatic cleanup after save
✅ Built-in overwrite protection
✅ Console logging for debugging

## Testing Checklist

For each page with caching:

- [ ] Fill out form fields
- [ ] Navigate away to another page
- [ ] Return to the page
- [ ] Verify all fields are restored
- [ ] Click Save button
- [ ] Verify overwrite warning appears on second save
- [ ] Verify cache is cleared after save
- [ ] Verify save confirmation appears

## Technical Details

### Storage Location

- **Cache**: `localStorage` with customer-specific keys
- **Permanent Save**: Separate keys for final saved data
- **EZAPP Integration**: Also saves to `EZAPP_current` structure

### Auto-Save Interval

- Default: 5 seconds
- Can be customized per page

### Supported Field Types

- Text inputs
- Textareas
- Select dropdowns
- Checkboxes
- Radio buttons
- Number inputs
- Email inputs
- Tel inputs

## Future Enhancements

1. **IndexedDB Support**: For larger data (videos, many photos)
2. **Sync Indicator**: Show when data is being saved
3. **Offline Support**: Work completely offline with service worker
4. **Cloud Backup**: Optional cloud sync for data safety
5. **Version History**: Keep multiple versions of saves

## Troubleshooting

### Cache Not Loading

- Check console for errors
- Verify customer name is set: `localStorage.getItem('currentCustomer')`
- Check cache key exists: `localStorage.getItem('cache_[page]_[customer]')`

### Data Not Saving

- Ensure `UniversalCache.setupAutoSave()` is called
- Check if fields have `id` attributes
- Verify no JavaScript errors in console

### Overwrite Warning Not Showing

- Check if save function includes overwrite check
- Verify correct localStorage key is being checked

## Support

For issues or questions about the caching system:

1. Check console logs (they show cache operations)
2. Verify `universal-cache.js` is loaded
3. Check that page name matches in all function calls
4. Ensure customer profile is created first

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Active Development
