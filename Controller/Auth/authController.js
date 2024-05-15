var mongoose = require("mongoose");
var jwt = require("jsonwebtoken")
const { Validator } = require("node-input-validator");
const crypto = require("crypto");
var passwordHash = require("password-hash");
const { InputError, DBerror } = require("../../Service/errorHandeler");
var ResponseCode = require("../../Service/response");
const userModel = require("../../Models/userModel");

// const S3 = require("../../Service/s3");

const iv = "1234567812345678";
const Securitykey = "12345678123456781234567812345678";


function createToken(data) {
    return jwt.sign(data, "keepsmile")
}

const userRegistration = async (req, res) => {
    const v = new Validator(req.body, {
        email: "required|email",
        password: "required|minLength:8",
    });
    let matched = await v.check().then((val) => val);
    if (!matched) {
        return res.status(200).send({
            status: false,
            error: v.errors,
            message: InputError(v.errors),
        });
    }
    const encrypter = crypto.createCipheriv("aes-256-cbc", Securitykey, iv);
    var encryptedMsg = encrypter.update(req.body.password, "utf8", "hex");
    encryptedMsg += encrypter.final("hex");
    console.log("encryptedMsg", encryptedMsg);

    await userModel.findOne({ email: req.body.email, isDeleted: false }).exec()

        .then((data) => {
            if (data == null || data == "") {
                let userData = {
                    ...req.body,
                    password: passwordHash.generate(req.body.password),
                    passwordCrypto: encryptedMsg,
                    userType: "User",
                    token: createToken(req.body),
                    createdOn: new Date(),
                };

                const savedData = new userModel(userData);
                return savedData.save().then((data) => {
                    const dataFormate = {
                        email: data.email,
                        token: data.token,
                    };

                    return res.status(ResponseCode.errorCode.success).json({
                        status: true,
                        message: "New User created successfully",
                        data: dataFormate,
                    });
                });
            } else {
                return res.status(ResponseCode.errorCode.dataExist).json({
                    status: false,
                    message: "email already exist,please try another email",
                });
            }
        })
        .catch((error) => {
            const errors = DBerror(error);
            res.status(ResponseCode.errorCode.serverError).json({
                status: false,
                message: errors,
                error: error,
            });
        });

};


const getTokenData = async (token) => {
    let adminData = await userModel.findOne({ token: token }).exec();
    return adminData;
};

const login = async (req, res) => {
    const v = new Validator(req.body, {
        email: "required",
        password: "required",
    });
    let matched = await v.check().then((val) => val);
    if (!matched) {
        return res
            .status(200)
            .send({ status: false, error: v.errors, message: InputError(v.errors) });
    }
     userModel.findOne({ email: req.body.email })
        .then((User) => {
            if (User != null && User.comparePassword(req.body.password)) {
                const DataFormate = {
                    token: User.token,
                    userType: User.userType
                };
                res.status(ResponseCode.errorCode.success).json({
                    status: true,
                    message: "Admin login successfully",
                    data: DataFormate,
                });
            } else {
                res.status(ResponseCode.errorCode.serverError).json({
                    status: false,
                    message: "data not exist",
                    //   error: err,
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(ResponseCode.errorCode.dataNotmatch).json({
                status: false,
                message: "Data Not found",
            });
        });
};



module.exports = {
    userRegistration,
    getTokenData,
    login
}