const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AppError = require("../utilities/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("./email");
const crypto = require("crypto");
const sign = require("../utilities/signToken");
//status messages and error handling
const catchAsyncFunction = require("../utilities/catchAsync");
