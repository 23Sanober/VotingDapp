const express = require('express');
const axios = require('axios'); 
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto'); 
const FormData = require('form-data');
const fs = require('fs');
const app = express();


// Encryption configuration
const algorithm = 'aes-256-cbc';
const encryptionKey = 'your-secret-key-32charslong!!!!!'; 
const iv = crypto.randomBytes(16); 

const storage = multer.memoryStorage();
const upload = multer({ storage });

require('dotenv').config();
// Pinata API credentials
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;



const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};


const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// CORS
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '-----', 
  database: 'student_management' 
});

// Connection to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});

// Registration 
app.post('/register', async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required.' });
  }

  try {
    // Encrypt the wallet address before storing
    const encryptedAddress = encrypt(walletAddress);

    // Check if the walletAddress already exists
    const checkUserQuery = 'SELECT * FROM users WHERE wallet_address = ?';
    db.query(checkUserQuery, [encryptedAddress], async (err, results) => {
      if (err) {
        console.error('Error checking user existence:', err);
        return res.status(500).json({ message: 'Server error.' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Wallet address already registered.' });
      }

      // Store the encrypted wallet address in the database
      const sql = 'INSERT INTO users (wallet_address) VALUES (?)';
      db.query(sql, [encryptedAddress], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).json({ message: 'Error registering user.' });
        }
        res.status(201).json({ message: 'User registered successfully.' });
      });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login 
app.post('/login', (req, res) => {
  const { walletAddress } = req.body;

  // Validate input
  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required.' });
  }

  const sql = 'SELECT * FROM users'; // Fetch all users and decrypt each wallet address
  db.query(sql, async (err, results) => {
    if (err) {
      console.error('Server error during login:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    // If no users found in the database
    if (results.length === 0) {
      return res.status(400).json({ message: 'No registered users found. Please register first.' });
    }

    // Loop through all users and decrypt the wallet address to match with the input
    let userFound = false;
    let user = null;

    for (const row of results) {
      const decryptedWalletAddress = decrypt(row.wallet_address); // Decrypt the wallet address from the database
      
      // Check if the decrypted wallet address matches the input address
      if (decryptedWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        userFound = true;
        user = row;
        break; // Stop looping once a match is found
      }
    }

    if (!userFound) {
      return res.status(400).json({ message: 'Wallet not registered. Please register first.' });
    }

    // If wallet is registered, generate a token and log in
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, message: 'Login successful.' });
  });
});



app.post('/updateProfile', upload.single('file'), async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required.' });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Profile photo is required.' });
  }

  try {
    const encryptedAddress = encrypt(walletAddress);
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    
    const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity', // To handle large files
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    
    const ipfsHash = pinataResponse.data.IpfsHash;
    console.log('IPFS Hash from Pinata:', ipfsHash); 
    console.log('Encrypted Wallet Address:', encryptedAddress); 

    
    const updateProfileQuery = 'UPDATE users SET profile_photo = ? WHERE wallet_address = ?';
    db.query(updateProfileQuery, [ipfsHash, encryptedAddress], (err, result) => {
      if (err) {
        console.error('Error updating profile photo in database:', err);
        return res.status(500).json({ message: 'Error updating profile photo.' });
      }

      console.log('SQL Update Result:', result);
      return res.status(200).json({ message: 'Profile photo updated successfully.', hash: ipfsHash });
    });

  } catch (error) {
    console.error('Error during profile update:', error);
    return res.status(500).json({ message: 'Failed to update profile photo.' });
  }
});

// Route to get profile details
app.get('/profile/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required.' });
  }

  try {
    const encryptedAddress = encrypt(walletAddress);
    const getProfileQuery = 'SELECT profile_photo FROM users WHERE wallet_address = ?';
    db.query(getProfileQuery, [encryptedAddress], (err, result) => {
      if (err) {
        console.error('Error fetching profile:', err);
        return res.status(500).json({ message: 'Error fetching profile.' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'Profile not found.' });
      }

      res.status(200).json({
        profilePhoto: result[0].profile_photo,
      });
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Error fetching profile.' });
  }
});

app.options('*', cors());

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});