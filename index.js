const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// GET /
app.get('/', (req, res) => {
    fs.readdir('./files', (err, fileNames) => {
        if (err) {
            console.log(err);
            return res.render('index', { files: [] });
        }

        const files = fileNames.map((fileName) => {
            const filePath = path.join(__dirname, 'files', fileName);
            const content = fs.readFileSync(filePath, 'utf-8');
            return {
                title: fileName.replace('.txt', ''), // Remove .txt extension for clean display
                message: content
            };
        });

        res.render('index', { files });
    });
});

// POST /create
app.post('/create', (req, res) => {
    const safeTitle = req.body.title.trim().split(' ').join(' ');
    const filePath = `./files/${safeTitle}.txt`;

    fs.writeFile(filePath, req.body.message, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error creating file');
        }
        res.redirect('/');
    });
});

app.get('/read/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'files', `${req.params.filename}.txt`);

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(404).send('Task not found!');
        }

        res.render('read', {
            title: req.params.filename,
            message: data
        });
    });
});

app.get('/edit', (req, res) => {
    const oldTitle = req.query.task || ''; // Get title from ?task= in URL
    res.render('edit', { oldTitle });      // Pass it to the edit.ejs view
});



app.post('/edit', (req, res) => {
    let oldName = req.body.old.trim();
    let newName = req.body.new.trim();

    // Add .txt extension if not present
    if (!oldName.endsWith('.txt')) oldName += '.txt';
    if (!newName.endsWith('.txt')) newName += '.txt';

    const oldPath = path.join(__dirname, 'files', oldName);
    const newPath = path.join(__dirname, 'files', newName);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error renaming file');
        }
        res.redirect('/');
    });
});



// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
