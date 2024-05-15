const userModel = require('../../Models/userModel');
var mongoose = require('mongoose')
const { Validator } = require("node-input-validator");
const { InputError, DBerror } = require("../../Service/errorHandeler");
var ResponseCode = require("../../Service/response");

const userGetProfile = async (req, res) => {
    console.log("get profile api hit====");
    return userModel.aggregate([
        {
            $match: {
                isDeleted: false,
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $project: {
                __v: 0,
                token: 0,
                isDeleted: 0,
                password: 0,
                createdOn: 0,
                updatedOn: 0,
            },
        },
        {
            $sort: {
                _id: -1,
                createdOn: -1
            },
        },
    ])
        .then((data) => {
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "Get All profile deatils  Successfully",
                data: data[0],
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(ResponseCode.errorCode.serverError).json({
                status: false,
                message: "Server error. Please try again.",
                error: error,
            });
        });
};


const updateUserProfile = async (req, res) => {
    try {
        const updateUser = await userModel.findOneAndUpdate(
            { _id: req.user._id },
            { ...req.body, updated_on: new Date() },
            { new: true }
        );

        if (updateUser) {
            return res.status(ResponseCode.errorCode.success).json({
                status: true,
                message: "User data updated successfully",
                // data: updateUser,
            });
        } else {
            return res.status(ResponseCode.errorCode.dataNotMatch).json({
                status: false,
                message: "Admin not match",
                data: null,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(ResponseCode.errorCode.serverError).json({
            status: false,
            message: "Server error. Please try again.",
            error: err.message,
        });
    }
};

module.exports = { userGetProfile, updateUserProfile };
