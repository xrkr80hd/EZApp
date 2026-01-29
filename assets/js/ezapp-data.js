/**
 * EZAPP Data Management Module
 * Centralizes all customer data into a structured format
 */

// Load JSZip library dynamically
const loadJSZip = () => {
    return new Promise((resolve, reject) => {
        if (window.JSZip) {
            resolve(window.JSZip);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = reject;
        document.head.appendChild(script);
    })
};

const EZAPPData = {
    /**
     * Initialize a new customer folder
     */
    initCustomer(customerName) {
        const ezappData = {
            customer: {
                name: customerName,
                startTime: new Date().toISOString(),
                address: ''
            },
            photos: [],
            survey: {},
            video: null,
            progress: {
                photoChecklist: false,
                survey: false,
                video: false
            },
            metadata: {
                version: '1.0',
                lastModified: new Date().toISOString()
            }
        };

        localStorage.setItem('EZAPP_current', JSON.stringify(ezappData));
        localStorage.setItem('currentCustomer', customerName);
        return ezappData;
    },

    /**
     * Get current customer data
     */
    getCurrentData() {
        const data = localStorage.getItem('EZAPP_current');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Update current customer data
     */
    updateData(updates) {
        const current = this.getCurrentData() || {};
        const merged = { ...current, ...updates };
        merged.metadata = merged.metadata || {};
        merged.metadata.lastModified = new Date().toISOString();
        localStorage.setItem('EZAPP_current', JSON.stringify(merged));
        return merged;
    },

    /**
     * Save photos
     */
    savePhotos(photoData) {
        const data = this.getCurrentData();
        if (data) {
            data.photos = photoData;
            data.metadata.lastModified = new Date().toISOString();
            localStorage.setItem('EZAPP_current', JSON.stringify(data));
        }
    },

    /**
     * Save survey data
     */
    saveSurvey(surveyData) {
        const data = this.getCurrentData();
        if (data) {
            data.survey = surveyData;
            data.customer.address = surveyData.customerAddress || data.customer.address;
            data.metadata.lastModified = new Date().toISOString();
            localStorage.setItem('EZAPP_current', JSON.stringify(data));
        }
    },

    /**
     * Update progress
     */
    updateProgress(section, completed) {
        const data = this.getCurrentData();
        if (data) {
            data.progress[section] = completed;
            data.metadata.lastModified = new Date().toISOString();
            localStorage.setItem('EZAPP_current', JSON.stringify(data));
        }
    },

    /**
     * Export photos only - Downloads actual image files as ZIP
     */
    async exportPhotos() {
        const data = this.getCurrentData();
        if (!data || !data.photos || Object.keys(data.photos).length === 0) {
            alert('No photos to export');
            return;
        }

        try {
            const JSZip = await loadJSZip();
            const zip = new JSZip();
            const customerName = data.customer.name.replace(/[^a-zA-Z0-9]/g, '_');
            const photosFolder = zip.folder(`${customerName}/photos`);

            let photoCount = 0;

            // Add each photo to the ZIP
            for (const [photoId, photoData] of Object.entries(data.photos)) {
                if (photoData.confirmed && photoData.data) {
                    // Extract base64 data
                    const base64Data = photoData.data.split(',')[1];
                    const filename = photoData.filename || `photo_${photoId}.jpg`;

                    photosFolder.file(`${filename}.jpg`, base64Data, { base64: true });
                    photoCount++;
                }
            }

            if (photoCount === 0) {
                alert('No confirmed photos to export');
                return;
            }

            // Generate and download ZIP
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${customerName}_photos.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert(`✓ Exported ${photoCount} photos successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting photos. Please try again.');
        }
    },

    /**
     * Export survey data in GPT-friendly format
     */
    exportSurveyForGPT() {
        const data = this.getCurrentData();
        if (!data || !data.survey || Object.keys(data.survey).length === 0) {
            alert('No survey data to export');
            return;
        }

        const survey = data.survey;
        let text = `CUSTOMER SURVEY - ${data.customer.name}\n`;
        text += `Date: ${new Date(data.customer.startTime).toLocaleDateString()}\n`;
        text += `Address: ${data.customer.address || 'N/A'}\n`;
        text += `\n${'='.repeat(60)}\n\n`;

        // Format all survey responses
        const questions = {
            q1: 'What brought you to Bath Planet today?',
            q2: 'What is the main problem or concern you\'re experiencing with your current bathroom?',
            bathroomType: 'What type of bathroom project are we discussing?',
            q4: 'Tell me about your ideal bathroom. What does it look like?',
            hasPhotos: 'Do you have any inspiration photos or ideas you\'d like to share?',
            q5notes: 'Photos/Ideas Notes',
            mobilityIssue: 'Are there any mobility or accessibility concerns we should address?',
            q6notes: 'Accessibility Notes',
            q7: 'Who else will be using this bathroom?',
            q8: 'What is your timeline for completing this project?',
            q9: 'What is your budget range for this project?',
            targetProject: 'What is your target project completion?',
            q10notes: 'Timeline/Budget Notes',
            easyClean: 'How important is easy cleaning and maintenance?',
            q12: 'What features are most important to you?',
            q13: 'Are there any specific colors or styles you prefer?',
            warranty: 'How important is warranty coverage?',
            americanMade: 'How important is American-made products?',
            takeawayNotes: 'Key Takeaways & Next Steps'
        };

        for (const [key, question] of Object.entries(questions)) {
            const answer = survey[key];
            if (answer && answer !== '' && answer !== 'N/A') {
                text += `Q: ${question}\n`;
                text += `A: ${answer}\n\n`;
            }
        }

        text += `\n${'='.repeat(60)}\n`;
        text += `\nINSTRUCTIONS FOR GPT:\n`;
        text += `Analyze the customer responses above and identify:\n`;
        text += `1. Primary pain points and frustrations\n`;
        text += `2. Emotional drivers behind the purchase decision\n`;
        text += `3. Budget and timeline concerns\n`;
        text += `4. Key selling points to emphasize\n`;
        text += `5. Potential objections to address\n`;

        this.downloadText(text, `${data.customer.name}_survey_analysis.txt`);
    },

    /**
     * Export everything - Creates complete customer folder as ZIP
     */
    async exportAll() {
        const data = this.getCurrentData();
        if (!data) {
            alert('No customer data to export');
            return;
        }

        try {
            const JSZip = await loadJSZip();
            const zip = new JSZip();
            const customerName = data.customer.name.replace(/[^a-zA-Z0-9]/g, '_');
            const customerFolder = zip.folder(customerName);

            // Add photos folder
            if (data.photos && Object.keys(data.photos).length > 0) {
                const photosFolder = customerFolder.folder('photos');
                let photoCount = 0;

                for (const [photoId, photoData] of Object.entries(data.photos)) {
                    if (photoData.confirmed && photoData.data) {
                        const base64Data = photoData.data.split(',')[1];
                        const filename = photoData.filename || `photo_${photoId}.jpg`;
                        photosFolder.file(`${filename}.jpg`, base64Data, { base64: true });
                        photoCount++;
                    }
                }

                // Add photo metadata
                const photoMetadata = {
                    customerName: data.customer.name,
                    totalPhotos: photoCount,
                    exportDate: new Date().toISOString(),
                    photos: Object.entries(data.photos)
                        .filter(([_, p]) => p.confirmed)
                        .map(([id, p]) => ({
                            id,
                            filename: p.filename,
                            description: p.description,
                            measurement: p.measurement,
                            hasPlumbing: p.hasPlumbing,
                            timestamp: p.timestamp
                        }))
                };
                photosFolder.file('photo_metadata.json', JSON.stringify(photoMetadata, null, 2));
            }

            // Add survey data
            if (data.survey && Object.keys(data.survey).length > 0) {
                const surveyFolder = customerFolder.folder('survey');

                // JSON format
                surveyFolder.file('survey_data.json', JSON.stringify(data.survey, null, 2));

                // Human-readable text format
                let surveyText = `CUSTOMER SURVEY - ${data.customer.name}\n`;
                surveyText += `Date: ${new Date(data.customer.startTime).toLocaleDateString()}\n`;
                surveyText += `Address: ${data.customer.address || 'N/A'}\n`;
                surveyText += `\n${'='.repeat(60)}\n\n`;

                const questions = {
                    q1: 'How\'d you hear about us?',
                    q2: 'What are you thinking about having done?',
                    bathroomType: 'Primary or Hall Bathroom?',
                    q4: 'Tell me what\'s going on',
                    hasPhotos: 'Do you have any photos?',
                    q5notes: 'Photos/Ideas Notes',
                    mobilityIssue: 'Mobility issue?',
                    q6notes: 'Accessibility Notes',
                    q7: 'How long thinking about this?',
                    q8: 'Who\'s more interested? Whose idea was this?',
                    targetProject: 'Is this the target project?',
                    q10notes: 'Timeline/Budget Notes',
                    easyClean: 'Looking for easy to clean?',
                    q12: 'What qualities matter most?',
                    q13: 'What would make you not work with a company?',
                    warranty: 'Is warranty important?',
                    americanMade: 'Is American-made important?',
                    takeawayNotes: 'Takeaway Notes'
                };

                for (const [key, question] of Object.entries(questions)) {
                    const answer = data.survey[key];
                    if (answer && answer !== '' && answer !== 'N/A') {
                        surveyText += `Q: ${question}\n`;
                        surveyText += `A: ${answer}\n\n`;
                    }
                }

                surveyFolder.file('survey_readable.txt', surveyText);
            }

            // Add bathroom measurement photos (side view & floor plan)
            if (data.documents?.bathroomMeasurement?.photos) {
                const measurementPhotosFolder = customerFolder.folder('bathroom_measurement_photos');
                const photos = data.documents.bathroomMeasurement.photos;

                if (photos.sideView) {
                    const base64Data = photos.sideView.data.split(',')[1];
                    const filename = photos.sideView.filename || 'side_view.jpg';
                    measurementPhotosFolder.file(filename, base64Data, { base64: true });
                }

                if (photos.floorPlan) {
                    const base64Data = photos.floorPlan.data.split(',')[1];
                    const filename = photos.floorPlan.filename || 'floor_plan.jpg';
                    measurementPhotosFolder.file(filename, base64Data, { base64: true });
                }

                // Add metadata for measurement photos
                const measurementPhotoMetadata = {
                    sideView: photos.sideView ? {
                        filename: photos.sideView.filename,
                        timestamp: photos.sideView.timestamp
                    } : null,
                    floorPlan: photos.floorPlan ? {
                        filename: photos.floorPlan.filename,
                        timestamp: photos.floorPlan.timestamp
                    } : null
                };
                measurementPhotosFolder.file('measurement_photos_metadata.json', JSON.stringify(measurementPhotoMetadata, null, 2));
            }

            // Add bathroom measurement form data
            if (data.documents?.bathroomMeasurement) {
                const measurementFolder = customerFolder.folder('bathroom_measurement');

                // Save complete measurement data as JSON
                measurementFolder.file('measurement_data.json', JSON.stringify(data.documents.bathroomMeasurement, null, 2));

                // Create human-readable text version
                const measurement = data.documents.bathroomMeasurement;
                let measurementText = `BATHROOM MEASUREMENT FORM\n`;
                measurementText += `Customer: ${measurement.customerName || 'N/A'}\n`;
                measurementText += `Date: ${measurement.measurementDate || 'N/A'}\n`;
                measurementText += `Measured By: ${measurement.measuredBy || 'N/A'}\n`;
                measurementText += `Job Number: ${measurement.jobNumber || 'N/A'}\n`;
                measurementText += `\n${'='.repeat(60)}\n\n`;

                measurementText += `PRODUCT INFORMATION:\n`;
                measurementText += `Product: ${measurement.product || 'N/A'}\n`;
                measurementText += `Color: ${measurement.productColor || 'N/A'}\n`;
                measurementText += `Size: ${measurement.productSize || 'N/A'}\n`;
                measurementText += `Door Orientation: ${measurement.doorOrientation || 'N/A'}\n`;
                measurementText += `\n`;

                measurementText += `MEASUREMENTS (inches):\n`;
                if (measurement.measurements) {
                    measurementText += `A. L Sidewall Height: ${measurement.measurements.A || 'N/A'}\n`;
                    measurementText += `B. L Sidewall Depth: ${measurement.measurements.B || 'N/A'}\n`;
                    measurementText += `C. Soap Dish Wall Height: ${measurement.measurements.C || 'N/A'}\n`;
                    measurementText += `D. Soap Dish Wall Width: ${measurement.measurements.D || 'N/A'}\n`;
                    measurementText += `E. R Sidewall Depth: ${measurement.measurements.E || 'N/A'}\n`;
                    measurementText += `F. R Sidewall Height: ${measurement.measurements.F || 'N/A'}\n`;
                    measurementText += `G. L Leg Depth: ${measurement.measurements.G || 'N/A'}\n`;
                    measurementText += `H. R Leg Depth: ${measurement.measurements.H || 'N/A'}\n`;
                }
                measurementText += `\n`;

                measurementText += `ADDITIONAL NOTES:\n`;
                measurementText += `${measurement.additionalNotes || 'None'}\n`;

                measurementFolder.file('measurement_readable.txt', measurementText);
            }

            // Add video if exists
            const savedVideo = localStorage.getItem('ezbath_whodat_video');
            if (savedVideo) {
                const videoData = JSON.parse(savedVideo);
                if (videoData.confirmed && videoData.data) {
                    const videoFolder = customerFolder.folder('video');
                    const base64Data = videoData.data.split(',')[1];
                    videoFolder.file('whodat_video.mp4', base64Data, { base64: true });
                }
            }

            // Add complete data JSON
            customerFolder.file('complete_data.json', JSON.stringify(data, null, 2));

            // Add README
            const readme = `EZ BATH CUSTOMER FILE
Customer: ${data.customer.name}
Created: ${new Date(data.customer.startTime).toLocaleString()}
Exported: ${new Date().toLocaleString()}

FOLDER STRUCTURE:
- photos/ - All customer photos with measurements
- survey/ - Customer survey responses
- bathroom_measurement/ - Bathroom measurement form data
- bathroom_measurement_photos/ - Side view & floor plan photos
- video/ - Who Dat video (if recorded)
- complete_data.json - Complete data backup

This folder contains all data collected for this customer.
`;
            customerFolder.file('README.txt', readme);

            // Generate and download ZIP
            const blob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${customerName}_complete.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert(`✓ Complete customer folder exported successfully!\n\nFile: ${customerName}_complete.zip`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting data. Please try again.');
        }
    },

    /**
     * Helper: Download JSON file
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Helper: Download text file
     */
    downloadText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Archive current customer and start fresh
     */
    archiveCustomer() {
        const data = this.getCurrentData();
        if (!data) return;

        const timestamp = new Date().getTime();
        const archiveKey = `EZAPP_archive_${data.customer.name}_${timestamp}`;
        localStorage.setItem(archiveKey, JSON.stringify(data));
        localStorage.removeItem('EZAPP_current');
    },

    /**
     * Import customer data from JSON file
     */
    async importCustomerData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate the data structure
                    if (!importedData.customer || !importedData.customer.name) {
                        reject(new Error('Invalid customer data file'));
                        return;
                    }

                    // Ask user if they want to replace current data
                    const currentData = this.getCurrentData();
                    if (currentData) {
                        const confirmReplace = confirm(
                            `You have data for "${currentData.customer.name}".\n\n` +
                            `Replace with imported data for "${importedData.customer.name}"?`
                        );

                        if (!confirmReplace) {
                            reject(new Error('Import cancelled by user'));
                            return;
                        }

                        // Archive current data before replacing
                        this.archiveCustomer();
                    }

                    // Import the data
                    localStorage.setItem('EZAPP_current', JSON.stringify(importedData));
                    localStorage.setItem('currentCustomer', importedData.customer.name);

                    resolve(importedData);
                } catch (error) {
                    reject(new Error('Failed to parse customer data file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    },

    /**
     * Get list of archived customers
     */
    getArchivedCustomers() {
        const archives = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('EZAPP_archive_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    archives.push({
                        key: key,
                        customerName: data.customer.name,
                        startTime: data.customer.startTime,
                        lastModified: data.metadata?.lastModified || data.customer.startTime
                    });
                } catch (e) {
                    console.error('Error parsing archive:', key, e);
                }
            }
        }

        // Sort by last modified date (newest first)
        archives.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        return archives;
    },

    /**
     * Load an archived customer
     */
    loadArchivedCustomer(archiveKey) {
        const archivedData = localStorage.getItem(archiveKey);
        if (!archivedData) {
            alert('Archive not found');
            return null;
        }

        try {
            const data = JSON.parse(archivedData);

            // Ask user if they want to replace current data
            const currentData = this.getCurrentData();
            if (currentData) {
                const confirmReplace = confirm(
                    `You have data for "${currentData.customer.name}".\n\n` +
                    `Replace with archived data for "${data.customer.name}"?`
                );

                if (!confirmReplace) {
                    return null;
                }

                // Archive current data before replacing
                this.archiveCustomer();
            }

            // Load the archived data
            localStorage.setItem('EZAPP_current', JSON.stringify(data));
            localStorage.setItem('currentCustomer', data.customer.name);

            return data;
        } catch (error) {
            console.error('Error loading archive:', error);
            alert('Failed to load archived customer');
            return null;
        }
    },

    /**
     * Delete an archived customer
     */
    deleteArchivedCustomer(archiveKey) {
        const archivedData = localStorage.getItem(archiveKey);
        if (!archivedData) {
            alert('Archive not found');
            return false;
        }

        try {
            const data = JSON.parse(archivedData);
            const confirmDelete = confirm(
                `Delete archived data for "${data.customer.name}"?\n\n` +
                `This cannot be undone!`
            );

            if (confirmDelete) {
                localStorage.removeItem(archiveKey);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting archive:', error);
            alert('Failed to delete archived customer');
            return false;
        }
    },

    /**
     * Export EVERYTHING - Complete app backup including all customers and settings
     */
    async exportFullBackup() {
        try {
            if (typeof loading !== 'undefined') {
                loading.show('Creating full backup...');
            }

            const JSZip = await loadJSZip();
            const zip = new JSZip();
            const timestamp = new Date().toISOString().split('T')[0];
            const backupFolder = zip.folder(`EZBaths_Backup_${timestamp}`);

            // Collect ALL localStorage data
            const fullBackup = {
                exportDate: new Date().toISOString(),
                version: '2.0',
                totalItems: 0,
                customers: [],
                cacheData: {},
                settings: {},
                scheduler: null,
                rawData: {}
            };

            // Iterate through all localStorage items
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;

                const value = localStorage.getItem(key);
                fullBackup.totalItems++;

                // Categorize the data
                if (key.startsWith('EZAPP_archive_')) {
                    try {
                        const customerData = JSON.parse(value);
                        fullBackup.customers.push({
                            key: key,
                            name: customerData.customer?.name,
                            data: customerData
                        });
                    } catch (e) {
                        fullBackup.rawData[key] = value;
                    }
                } else if (key === 'EZAPP_current') {
                    try {
                        fullBackup.currentCustomer = JSON.parse(value);
                    } catch (e) {
                        fullBackup.rawData[key] = value;
                    }
                } else if (key.startsWith('cache_')) {
                    try {
                        fullBackup.cacheData[key] = JSON.parse(value);
                    } catch (e) {
                        fullBackup.cacheData[key] = value;
                    }
                } else if (key.includes('scheduler') || key.includes('schedule')) {
                    try {
                        fullBackup.scheduler = fullBackup.scheduler || {};
                        fullBackup.scheduler[key] = JSON.parse(value);
                    } catch (e) {
                        fullBackup.scheduler = fullBackup.scheduler || {};
                        fullBackup.scheduler[key] = value;
                    }
                } else if (key.includes('ezbath') || key.includes('ezapp')) {
                    try {
                        fullBackup.settings[key] = JSON.parse(value);
                    } catch (e) {
                        fullBackup.settings[key] = value;
                    }
                } else {
                    // Store all other data too
                    try {
                        fullBackup.rawData[key] = JSON.parse(value);
                    } catch (e) {
                        fullBackup.rawData[key] = value;
                    }
                }
            }

            // Create the main backup JSON
            backupFolder.file('backup_data.json', JSON.stringify(fullBackup, null, 2));

            // Create individual customer folders with their files
            for (const customer of fullBackup.customers) {
                const customerName = (customer.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
                const customerFolder = backupFolder.folder(`customers/${customerName}`);

                customerFolder.file('customer_data.json', JSON.stringify(customer.data, null, 2));

                // Extract photos if they exist
                if (customer.data.photos) {
                    const photosFolder = customerFolder.folder('photos');
                    for (const [photoId, photoData] of Object.entries(customer.data.photos)) {
                        if (photoData.data && photoData.data.startsWith('data:')) {
                            const base64Data = photoData.data.split(',')[1];
                            const filename = photoData.filename || `photo_${photoId}`;
                            photosFolder.file(`${filename}.jpg`, base64Data, { base64: true });
                        }
                    }
                }
            }

            // Add current customer if exists
            if (fullBackup.currentCustomer) {
                const currentFolder = backupFolder.folder('current_customer');
                currentFolder.file('data.json', JSON.stringify(fullBackup.currentCustomer, null, 2));
            }

            // Add README
            const readme = `EZ BATHS COMPLETE BACKUP
========================
Export Date: ${new Date().toLocaleString()}
Total Items: ${fullBackup.totalItems}
Customers: ${fullBackup.customers.length}

HOW TO RESTORE:
1. Open EZ Baths Portal
2. Go to Tools or any page with Import option
3. Click "Import Backup" button
4. Select the backup_data.json file from this folder

FOLDER STRUCTURE:
- backup_data.json - Complete data (USE THIS TO RESTORE)
- customers/ - Individual customer folders with photos
- current_customer/ - Currently active customer

This backup contains ALL your EZ Baths data.
`;
            backupFolder.file('README.txt', readme);

            // Generate ZIP
            const blob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `EZBaths_Backup_${timestamp}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof loading !== 'undefined') {
                loading.hide();
            }
            if (typeof toast !== 'undefined') {
                toast.success(`Backup created with ${fullBackup.customers.length} customers!`, 'Backup Complete');
            } else {
                alert(`✓ Complete backup exported!\n\nCustomers: ${fullBackup.customers.length}\nTotal items: ${fullBackup.totalItems}`);
            }

            return fullBackup;
        } catch (error) {
            console.error('Backup error:', error);
            if (typeof loading !== 'undefined') {
                loading.hide();
            }
            if (typeof toast !== 'undefined') {
                toast.error('Error creating backup. Please try again.');
            } else {
                alert('Error creating backup. Please try again.');
            }
            return null;
        }
    },

    /**
     * Import/Restore from backup file
     */
    async importBackup(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file provided');
                return;
            }

            if (typeof loading !== 'undefined') {
                loading.show('Restoring backup...');
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    let restoredCount = 0;

                    // Restore customers
                    if (backup.customers && Array.isArray(backup.customers)) {
                        for (const customer of backup.customers) {
                            if (customer.key && customer.data) {
                                localStorage.setItem(customer.key, JSON.stringify(customer.data));
                                restoredCount++;
                            }
                        }
                    }

                    // Restore current customer
                    if (backup.currentCustomer) {
                        localStorage.setItem('EZAPP_current', JSON.stringify(backup.currentCustomer));
                        if (backup.currentCustomer.customer?.name) {
                            localStorage.setItem('currentCustomer', backup.currentCustomer.customer.name);
                        }
                    }

                    // Restore cache data
                    if (backup.cacheData) {
                        for (const [key, value] of Object.entries(backup.cacheData)) {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    }

                    // Restore scheduler data
                    if (backup.scheduler) {
                        for (const [key, value] of Object.entries(backup.scheduler)) {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    }

                    // Restore settings
                    if (backup.settings) {
                        for (const [key, value] of Object.entries(backup.settings)) {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    }

                    // Restore raw data
                    if (backup.rawData) {
                        for (const [key, value] of Object.entries(backup.rawData)) {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    }

                    if (typeof loading !== 'undefined') {
                        loading.hide();
                    }
                    if (typeof toast !== 'undefined') {
                        toast.success(`Restored ${restoredCount} customers!`, 'Backup Restored');
                    } else {
                        alert(`✓ Backup restored!\n\nCustomers restored: ${restoredCount}`);
                    }

                    resolve({ success: true, restoredCount });
                } catch (error) {
                    console.error('Import error:', error);
                    if (typeof loading !== 'undefined') {
                        loading.hide();
                    }
                    if (typeof toast !== 'undefined') {
                        toast.error('Invalid backup file format');
                    } else {
                        alert('Error: Invalid backup file format');
                    }
                    reject(error);
                }
            };

            reader.onerror = () => {
                if (typeof loading !== 'undefined') {
                    loading.hide();
                }
                reject('Error reading file');
            };

            reader.readAsText(file);
        });
    },

    /**
     * Create file input for importing backup
     */
    promptImportBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.importBackup(file);
                // Optionally reload the page to reflect changes
                if (confirm('Backup restored! Reload page to see changes?')) {
                    window.location.reload();
                }
            }
        };
        input.click();
    },

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        let totalSize = 0;
        let customerCount = 0;
        let photoCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char

            if (key.startsWith('EZAPP_archive_')) {
                customerCount++;
                try {
                    const data = JSON.parse(value);
                    if (data.photos) {
                        photoCount += Object.keys(data.photos).length;
                    }
                } catch (e) { }
            }
        }

        return {
            totalSizeBytes: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            customerCount: customerCount,
            photoCount: photoCount,
            itemCount: localStorage.length,
            availableSpace: 'Approximately 5-10 MB remaining (varies by browser)'
        };
    }
};
