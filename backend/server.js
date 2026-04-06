require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check root route
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: '🚀 ApniDukaan API is running!', version: '1.0.0' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

/*
INSTRUCTIONS TO RUN:
1. Ensure MongoDB is running locally or provide an Atlas URI in .env
2. Add Twilio keys to .env if WhatsApp integration is needed.
3. Run `npm install` inside the backend directory.
4. Run `npm run dev` to start the server at localhost:5000.
*/
// Production MongoDB Connect Logic
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/apnidukan";

mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout faster if connection is impossible
})
.then(() => console.log('✅ MongoDB Cloud Connected'))
.catch(err => {
    console.error('❌ MONGODB CONNECTION ERROR:', err.message);
    if (err.message.includes('buffering timed out')) {
        console.log("👉 TIP: Check your MongoDB Atlas Network Access and URI credentials!");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
