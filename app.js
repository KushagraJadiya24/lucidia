const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require("ejs-mate");
const uuid = require('uuid');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const MONGO_URL = "mongodb://127.0.0.1:27017/lucidia";
const Entry = require('./models/entry.js');
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get('/', (req, res) => {
    res.render('landing.ejs');
});


 
app.get('/entries',async (req,res)=>{
    let entries = await Entry.find();
    res.render('entries/entries.ejs', { entries });
});


app.get('/entries/new', (req, res) => {
    res.render('entries/new.ejs');
});

app.get('/entries/:id',async (req, res) => {
    const { id } = req.params;
  try {
    const entry = await Entry.findById(id);
    if (!entry) {
      return res.status(404).send("Entry not found");
    }
    res.render('entries/show.ejs', { entry });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

app.patch('/entries/:id',async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
    const entry = await Entry.findById(id);
    if (!entry) {
        return res.status(404).send("Entry not found");
    }
    
    entry.title = title;
    entry.content = content;
    await entry.save();
    res.redirect(`/entries/${id}`);
    } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
    }
});

app.delete('/entries/:id', async (req,res)=>{
    const {id} = req.params;
    await Entry.findByIdAndDelete(id);
    res.redirect('/entries');
})
app.post('/entries',async (req, res) => {
    let { title, content } = req.body;
    let newEntry =new Entry({ 
        title,
        content,
        createdAt: new Date()
    });
    await newEntry.save();
    res.redirect('/entries');
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})