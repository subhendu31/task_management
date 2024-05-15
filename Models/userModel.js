
var mongoose = require("mongoose");
var passwordHash = require("password-hash");

const userSchema = new mongoose.Schema({
    image: {
        type: String,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        // unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    passwordCrypto: {
        type: String,
    },
    userType: {
        type: String,

    },
    mobile: {
        type: Number,
    },
    token: {
        type: String,
        required: false,
        unique: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: Date,
        default: new Date(),
    },
    updatedOn: {
        type: Date,
        default: new Date(),
    },
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return passwordHash.verify(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
