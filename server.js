const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./models/User');
const Address = require('./models/Address');
const dotenv = require('dotenv')
const app = express();


dotenv.config()

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err.message));

// POST route to register user and multiple addresses
app.post('/register', async (req, res) => {
    const { name, addresses } = req.body; // 'addresses' should be an array of strings

    try {
        // Save the user
        const newUser = new User({ name });
        const savedUser = await newUser.save();

        // Save each address linked to the user
        for (const address of addresses) { // Fixed variable name to 'address'
            const newAddress = new Address({
                userId: savedUser._id,
                address, // Fixed variable name to 'address'
            });
            await newAddress.save();
        }

        res.status(201).send('User and addresses saved successfully');
    } catch (error) {
        console.error(error); 
        res.status(500).send('Error saving user and addresses');
    }
});

// Get user details along with their multiple addresses
app.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find all addresses linked to this user
        const addresses = await Address.find({ userId }); // Use 'addresses' here

        // Return user details along with their addresses
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
            },
            addresses: addresses.map((addr) => ({ // Fixed variable name to 'addresses'
                id: addr._id,
                address: addr.address,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user details');
    }
});

const PORT = process.env.PORT;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

