const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require("ejs-mate");
const uuid = require('uuid');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('landing.ejs');
});

let entries =[
    {
        id: uuid.v4(),
        title: "First Entry",
        content: "This is the content of the first entry.",
        createdAt: new Date(),
    },
    {  
        id: uuid.v4(),
        title: "Second Entry",
        content: "This is the content of the second entry.",
        createdAt: new Date(),
        
    },
    {
        id: uuid.v4(),
        title: "Third Entry",
        content: "This is the content of the third entry.",
        createdAt: new Date(),
    },
    {
        id: uuid.v4(),
        title: "Fourth Entry",
        content: "This is the content of the Fourth entry.",
        createdAt: new Date(),
    },
    {
        id: uuid.v4(),
        title: "Fifth Entry",
        content: "This is the content of the Fifth entry.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        createdAt: new Date(),
    }
];

 
app.get('/entries',(req,res)=>{
    res.render('entries/entries.ejs', { entries });
});


app.get('/entries/new', (req, res) => {
    res.render('entries/new.ejs');
});

app.get('/entries/:id', (req, res) => {
    const { id } = req.params;
    const entry = entries.find(e => e.id === id);
    if (!entry) {
        return res.status(404).send("Entry not found");
    }
    res.render('entries/show.ejs', { entry });
});

app.patch('/entries/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const entry = entries.find(e => e.id === id);
    if (!entry) {
        return res.status(404).send("Entry not found");
    }
    entry.title = title;
    entry.content = content;
    entry.createdAt = new Date();
    res.redirect(`/entries/${id}`);
});

app.delete('/entries/:id',(req,res)=>{
    const {id} = req.params;
    entries = entries.filter (e => e.id !== id);
    res.redirect('/entries');
})
app.post('/entries', (req, res) => {
    let { title, content } = req.body;
    let newEntry = {
        id: uuid.v4(),
        title,
        content,
        createdAt: new Date()
    };
    entries.push(newEntry);
    res.redirect('/entries');
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})