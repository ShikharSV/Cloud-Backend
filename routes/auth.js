const { application } = require('express');
const express=require('express');
const router=express.Router();
const User=require('../models/User');
const { body, validationResult } = require('express-validator');


// Create a user using: POST "api/auth/createuser"  No login required
router.post('/createuser',[
    body('password','Enter a valid name').isLength({ min: 3 }),
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
    user= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
    res.json(user)
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");
    }
})

module.exports=router;  