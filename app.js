const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require("ejs-mate");
const uuid = require('uuid');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));

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
    }
]



app.get('/entries',(req,res)=>{
    res.render('entries/entries.ejs', { entries });
});




app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})