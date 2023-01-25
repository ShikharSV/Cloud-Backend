const express=require('express');
const router=express.Router();
const fetchuser=require('../middleware/fetchuser');
const Note=require('../models/Note');
const { body, validationResult } = require('express-validator');



// Get all the notes: GET "api/auth/fetchallnotes"  Login required
router.get('/fetchallnotes',fetchuser, async (req, res)=>{

    try {
        const notes=await Note.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");        
    }
})

// Add a new note POST "api/auth/addnote"  Login required
router.post('/addnote',fetchuser,[
    body('title','Enter a valid title').isLength({ min: 3 }),
    body('description','Must must be atleast 8 characters').isLength({ min: 5 })
], async (req, res)=>{

    try {
        const {title,description,tag}=req.body;
        // If errors, return bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note=new Note({
            title,description,tag,user:req.user.id
        })
        const savedNote=await note.save();
        res.json(savedNote); 
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");       
    }
})

module.exports=router;