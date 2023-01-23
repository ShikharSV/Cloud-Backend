const { application } = require('express');
const express=require('express');
const router=express.Router();
const User=require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const JWT_SECRET="Horsemen5599";
const fetchuser=require('../middleware/fetchuser');

// Create a user using: POST "api/auth/createuser"  No login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Must must be atleast 8 characters').isLength({ min: 8 })
],async(req, res)=>{
    // If errors, return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } 
    // Check whether a user with this email exits already  
    try {
        let user=await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({error: "Email already exits"})
    }

    const salt=await bcrypt.genSalt(10);
    const hashPassword= await bcrypt.hash(req.body.password,salt);
    // Create new user
    user= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
      })
    const data={
        user:{
            id:user.id
        }
    }
    const authtoken=jwt.sign(data,JWT_SECRET);
    // console.log(jwtData);


    // res.json(user)
    res.json({authtoken});
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");
    }
})

// Authenticate a user using: POST "api/auth/login"  No login required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Cannot be blank').exists(),
],async(req, res)=>{
    // If errors, return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email,password}=req.body;
    try {
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Invalid Credentials-2"});
        }
        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error:"Invalid Credentials"});
        }
        const data={
            user:{
                id:user.id
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET);
        res.send({authtoken});
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Internal Server Error");
    }
    
})

// Get logged in user details: POST "api/auth/getuser"  Login required
router.post('/getuser',fetchuser,async(req, res)=>{
try {
    userId=req.user.id;
    const user=await User.findById(userId).select("-password");
    res.send(user)
} catch (error) {
    console.error(error.message);
    res.send(500).send("Internal Server Error");
}
})
module.exports=router;  