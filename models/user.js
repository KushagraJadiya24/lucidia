const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new Schema({
   
    email: {
        type: String,
        required: true,
        unique: true
    },
    aiUsage: {
        count: { type: Number, default: 0 },
        lastUsed: { type: Date, default: new Date(0) }
    }
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);