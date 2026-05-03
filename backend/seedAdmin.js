require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/apnidukan";

mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(async () => {
    console.log('✅ MongoDB Connected');
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        console.log('Admin already exists.');
        process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await User.create({
        username: 'admin',
        passwordHash,
        role: 'admin',
        name: 'Super Admin'
    });

    console.log('✅ Admin user created: admin / admin123');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
