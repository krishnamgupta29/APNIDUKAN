require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

/*
INSTRUCTIONS TO RUN:
1. Ensure MongoDB is running locally or provide an Atlas URI in .env
2. Add Twilio keys to .env if WhatsApp integration is needed.
3. Run `npm install` inside the backend directory.
4. Run `npm run dev` to start the server at localhost:5000.
*/
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
