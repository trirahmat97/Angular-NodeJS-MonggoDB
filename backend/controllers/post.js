const Post = require('../models/posts');

exports.createPost = (req, res, next)=>{
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      post : {
        ...createdPost,
        id: createdPost._id
      }
    })
  }).catch(error => {
    res.status(500).json({
      message: 'Creating a post failed!'
    })
  })
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  console.log(req.file);
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  // console.log(post);
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
  .then(result =>{
    if(result.n > 0) {
      res.status(200).json({message: 'Update Success!'});
    }else{
      res.status(401).json({message: 'Not Unathorize!'});
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Could not update post!'
    })
  })
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId})
  .then(result => {
    if(result.n > 0) {
      res.status(200).json({message: 'Update Success!'});
    }else{
      res.status(401).json({message: 'Not Unathorize!'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting failed!'
    });
  });
}

exports.getList = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
  .then(documents => {
      fetchedPosts = documents;
      return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: "Posts fetched succesfully!",
      posts: fetchedPosts,
      maxPosts: count
    })
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching posts failed!'
    })
  })
}

exports.getById = (req, res, next) => {
  Post.findById(req.params.id)
  .then(post => {
    if(post){
      return res.status(200).json(post);
    }else{
      res.status(404).json({
        message: 'data note fund'
      });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching posts failed!'
    })
  })
}
