var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
//INDEX - Show all campgrounds
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
       
});


router.post("/", isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: description, author: author};
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

router.get("/new", isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});


router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
     if(err){
         console.log(err);
     }   else {
         console.log(foundCampground);
         res.render("campgrounds/show", {campground: foundCampground});
     }
    });
});

//edit campground route
router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
     //is user logged in?
     Campground.findById(req.params.id, function(err, foundCampground) {
            res.render("campgrounds/edit", {campground: foundCampground});
     });
});

//update campground route
router.put("/:id", checkCampgroundOwnership, function(req, res){
   //find and update correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
              //redirect to showpage
           res.redirect("/campgrounds/" + req.params.id);
       }
   })

});

//destroy campground route
router.delete("/:id", checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       }
   })
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkCampgroundOwnership(req, res, next) {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("back");
             } else {
                 //does user own campground?
                 if(foundCampground.author.equals(req.user._id)) {
                    next();  
                 } else {
                    res.redirect("back");
                 }
                }
         });
    } else {
        res.redirect("back");
    }
}


module.exports = router;