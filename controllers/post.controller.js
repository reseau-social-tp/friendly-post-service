const PostModel = require("../models/post.model");

const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readPost = async (req, res) => {
    try {
        const posts = await PostModel.find({posterId: { $in: req.params.following.split(",") }}).sort({ createdAt: -1})
        res.json({posts})
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg: err.message})
    }
};

module.exports.readPostsOfUser = async (req, res) => {
    try {
        const posts = await PostModel.find({posterId: req.params.id}).sort({ createdAt: -1})
        res.json({posts})
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg: err.message})
    }
},
module.exports.getPost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id)
        if(!post) return res.status(400).json({msg: "Post does not exist."})
        
        res.json({post})
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
},
module.exports.createPost = async (req, res) => {
    let images = [req.body?.image];
    // if(req.files)
    // {
    //     req.files.forEach(file => {
    //     images.push('/images/' + file.filename);
    //     });
    // }
  const newPost = new PostModel({
    pictures: images,
    posterId: req.body.posterId,
    message: req.body.message,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.updatePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown :" + req.params.id);
    let images = [];
    if(req.files)
    {
        req.files.forEach(file => {
        images.push('/images/' + file.filename);
        });
    }

    const updatedRecord = {
        message: req.body.message,
        pictures: images
  };

  PostModel.findByIdAndUpdate(
    req.params.id,
    { $set: updatedRecord },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
};

module.exports.deletePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown :" + req.params.id);

  PostModel.findByIdAndDelete(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Deleted error : " + err);
  });
};

module.exports.likePost = async (req, res) =>{
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("Id unknown :" + req.params.id);

    try{
        PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {likers: req.body.userId}
            },
            {new: true},
            (err, docs) => {
                if(err) return res.status(400).send(err);
            }
        );
        UserModel.findByIdAndUpdate(
            req.body.userId,
            {
                $addToSet : { likes: req.params.id}
            },
            {new: true},
            (err, docs) =>{
                if(!err) res.status(200).send(docs);
                else return res.status(400).send(err);
            }
        )
    }
    catch(err) {
        return res.status(400).send(err);
    }
    
}

module.exports.unlikePost = async (req, res) =>{
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("Id unknown :" + req.params.id);

    try{
        PostModel.findByIdAndUpdate(
            req.params.id,
            {
                
                $pull: {likers: req.body.userId}
            },
            {new: true},
            (err, docs) => {
                if(err) return res.status(400).send(err);
            }
        );
        UserModel.findByIdAndUpdate(
            req.body.userId,
            {
                $pull : { likes: req.params.id}
            },
            {new: true},
            (err, docs) =>{
                if(!err) res.status(200).send(docs);
                else return res.status(400).send(err);
            }
        )
    }
    catch(err) {
        return res.status(400).send(err);
    }
}

module.exports.commentPost = (req, res) =>{
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("Id unknown :" + req.params.id);
    try{
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push :{
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp : new Date().getTime()
                    }
                }
            },
            {new: true},
            (err, docs) =>{
                if(!err) res.status(200).send(docs);
                else return res.status(400).send(err);
            }
        );
    }
    catch(err){
        res.status(400).send(err);
    }

};

module.exports.editCommentPost = (req, res) =>{
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("Id unknown :" + req.params.id);
    
    try{
        return PostModel.findById(req.params.id, (err, docs) =>{
            const theComment = docs.comments.find((comment) =>
                comment._id.equals(req.body.commentId)
            );
            if(!theComment) return res.status(404).send("Comment not found");
            theComment.text = req.body.text;
            return docs.save((err) =>{
                if(!err) return res.status(200).send(docs);
                return res.status(500).send(err);
            });

        });
    }
    catch(err){
        return res.status(400).send(err);
    }
}

module.exports.deleteCommentPost = (req, res) =>{
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("Id unknown :" + req.params.id);
    
    try{
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull:{
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            {new: true},
            (err, docs) => {
                if(!err) return res.status(200).send(docs);
                else return res.status(400).send(err);
            }
        )
    }
    catch(err){
        return res.status(400).send(err);
    }
}