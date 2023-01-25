const express=require('express');
const router=express.Router();
const fetchuser=require('../middleware/fetchuser');
const Note=require('../models/Note');
const { body, validationResult } = require('express-validator');



// Get all the notes: GET "api/notes/fetchallnotes"  Login required
router.get('/fetchallnotes',fetchuser, async (req, res)=>{

    try {
        const notes=await Note.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");        
    }
})

// Add a new note POST "api/notes/addnote"  Login required
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

// Update an existing note PUT "api/notes/updatenote"  Login required
router.put('/updatenote/:id',fetchuser, async (req,res)=>{

    try {
        const {title,description,tag}=req.body;
        const newNote={};
        if(title){
            newNote.title=title;
        }
        if(description){
            newNote.description=description;
        }
        if(tag){
            newNote.tag=tag
        }
        let note=await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Note not found")}
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not allowed");
        }
        note= await Note.findByIdAndUpdate(req.params.id,{$set: newNote},{new:true})
        res.json({note});        
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");       
    }
})


// Delete an existing note DELETE "api/notes/deletenote/:id"  Login required
router.delete('/updatenote/:id',fetchuser, async (req,res)=>{

    try {
        //Find note to be deleted
        let note=await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Note not found")}
    
        //Allow deletion of the note only by the same user
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not allowed");
        }
        note= await Note.findByIdAndDelete(req.params.id)
        res.json({"Success": "The note has been deleted", note: note});        
    } catch (error) {
        console.error(error.message);
        res.send(500).send("Some error occured");       
    }
})
module.exports=router;