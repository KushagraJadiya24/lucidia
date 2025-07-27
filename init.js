const mongoose = require("mongoose");
const Entry = require("./models/entry.js");
const path = require('path');
const MONGO_URL = "mongodb://127.0.0.1:27017/lucidia";
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
let entries =[
    {
        title: "First Entry",
        content: "This is the content of the first entry.",
        createdAt: new Date(),
    },
    {  

        title: "Second Entry",
        content: "This is the content of the second entry.",
        createdAt: new Date(),
        
    },
    {

        title: "Third Entry",
        content: "This is the content of the third entry.",
        createdAt: new Date(),
    },
    {

        title: "Fourth Entry",
        content: "This is the content of the Fourth entry.",
        createdAt: new Date(),
    },
    {
        title: "Fifth Entry",
        content: "This is the content of the Fifth entry.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        createdAt: new Date(),
    }
];

const initDb = async ()=>{
    await Entry.deleteMany();
    await Entry.insertMany(entries);
    console.log("data was initialized");
}
initDb();