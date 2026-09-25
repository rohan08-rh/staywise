const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt =require('bcryptjs');

const sendGrid=require('@sendgrid/mail');
require('dotenv').config();
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = (req, res) => {
    res.render('auth/login', { isLoggedIn: req.session.isLoggedIn });
};

exports.getSignin = (req, res) => {
    res.render('auth/signin', { isLoggedIn: req.session.isLoggedIn });
};
exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { isLoggedIn: false, errorMessages: [] });
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  const MILLS_IN_MIN = 60 * 1000;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).render('auth/forgot-password', {
        isLoggedIn: false,
        errorMessages: ['User not found.']
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + MILLS_IN_MIN;
    await user.save();

    const msg = {
      to: normalizedEmail,
      from: 'polkamrohan08@gmail.com',
      subject: 'Here is your OTP to change the password',
      html: `<h1>Your OTP is: ${otp}</h1>`
    };

    await sendGrid.send(msg);

    return res.redirect(`/reset-password?email=${normalizedEmail}`);
  } catch (err) {
    console.log('error in forgot password', err);

    return res.status(500).render('auth/forgot-password', {
      isLoggedIn: false,
      errorMessages: [err.message]
    });
  }
};

exports.getResetPassword = (req, res) => {
  const email = req.query.email || '';

  return res.render('auth/reset-password', {
    isLoggedIn: false,
    email,
    errorMessages: []
  });
};

exports.postResetPassword = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  try {
    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).render('auth/reset-password', {
        isLoggedIn: false,
        email,
        errorMessages: ['All fields are required.']
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('auth/reset-password', {
        isLoggedIn: false,
        email,
        errorMessages: ['Passwords do not match.']
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).render('auth/reset-password', {
        isLoggedIn: false,
        email,
        errorMessages: ['User not found.']
      });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).render('auth/reset-password', {
        isLoggedIn: false,
        email,
        errorMessages: ['Invalid OTP.']
      });
    }

    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      return res.status(400).render('auth/reset-password', {
        isLoggedIn: false,
        email,
        errorMessages: ['OTP has expired. Please request a new one.']
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.redirect('/login');
  } catch (err) {
    console.log('error in reset password', err);

    return res.status(500).render('auth/reset-password', {
      isLoggedIn: false,
      email,
      errorMessages: [err.message]
    });
  }
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).render('auth/login', {
        isLoggedIn: false,
        userType: 'user',
        errorMessages: ['User not found.']
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).render('auth/login', {
        isLoggedIn: false,
        userType: 'user',
        errorMessages: ['Incorrect password.']
      });
    }

    req.session.isLoggedIn=true;
    //res.cookie('userType', user.userType || 'user');
    return res.redirect('/');
  } catch (err) {
    return res.status(500).render('auth/login', {
      isLoggedIn: false,
      userType: 'user',
      errorMessages: [err.message]
    });
  }
};

const firstNameValidatior = [check('firstName')
  .notEmpty()
  .withMessage('First name is required')
  .trim()
  .isLength({ min: 2 })
  .withMessage('First name must be at least 2 characters')];

const lastNameValidatior = [check('lastName')
  .notEmpty()
  .withMessage('Last name is required')
  .trim()
  .isLength({ min: 2 })
  .withMessage('Last name must be at least 2 characters')];

const emailparrword = [
  
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

exports.postSignin = [
  firstNameValidatior,
  lastNameValidatior,
  emailparrword,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('auth/signin', {
        isLoggedIn: req.session.isLoggedIn,
        errorMessages: errors.array().map(err => err.msg)
      });
    }

    try {
      const { firstName, lastName, email, password, userType } = req.body;
      const normalizedEmail = email.trim().toLowerCase();
      const finalUserType = userType === 'host' ? 'host' : 'user';

      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return res.status(422).render('auth/signin', {
          isLoggedIn: req.session.isLoggedIn,
          userType: req.userType || 'user',
          errorMessages: ['An account with this email already exists.']
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        userType: finalUserType
      });

      await user.save();

      const welcomeEmail={
        to:normalizedEmail,
        from:process.env.FROM_EMAIL,
        subject:"welocomr to staywise",
        html:`<h1>welcome ${firstName} ${lastName} book ur house with us </h1>`

      }
      await sendGrid.send(welcomeEmail);
 
      return res.redirect('/login');
    } catch (err) {
      console.log(err);
      return res.status(500).render('auth/signin', {
        isLoggedIn: req.session.isLoggedIn,
        userType: req.userType || 'user',
        errorMessages: ['Something went wrong while creating your account. Please try again.']
      });
    }
  }
];

exports.postLogout = (req, res) => {
   req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.redirect('/login');
   });
};




