const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 5000;

// Function to get BIN info from CSV
function getBinInfoFromCSV(fbin, csvFile = 'bins_all.csv') {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(csvFile)) {
            return reject(new Error('CSV file not found'));
        }

        const results = [];
        fs.createReadStream(csvFile)
            .pipe(csv())
            .on('data', (row) => {
                // Assuming the first column is the BIN
                if (row.BIN === fbin) {
                    results.push({
                        BIN: row.BIN,
                        Brand: row.Brand,
                        Type: row.Type,
                        Category: row.Category,
                        Issuer: row.Issuer,
                        IssuerPhone: row.IssuerPhone,
                        IssuerUrl: row.IssuerUrl,
                        isoCode2: row.isoCode2,
                        isoCode3: row.isoCode3,
                        CountryName: row.CountryName
                    });
                }
            })
            .on('end', () => {
                resolve(results.length > 0 ? results[0] : null);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Endpoint to get BIN info
app.get('/api/binlookup', async (req, res) => {
    const fbin = req.query.bin;

    if (!fbin) {
        return res.status(400).json({ error: "Invalid request. Please provide a BIN." });
    }

    try {
        const binInfo = await getBinInfoFromCSV(fbin);

        if (!binInfo) {
            return res.status(404).json({ error: "Invalid BIN information not found in the database." });
        }

        res.json(binInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log("Server running on port 5000");
});