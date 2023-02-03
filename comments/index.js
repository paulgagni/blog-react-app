//app is an object returned by express(). Actually it instantiates Express and assigns app variable to it.
const express = require('express');
//To use the body parser
const bodyParser = require('body-parser');
//Used to generate a random ID that we are going to assign to the post the user is trying to create
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

//Create express application
const app = express();
//Wire up the bodyparser middleware 
app.use(bodyParser.json());
//Wire up cors as middleware - ensure call cors as a function
app.use(cors());
//Object to store all comments in an in-memory data structure
const commentsByPostId = {};
// req is an object containing information about the HTTP request that raised the event. In response to req, you use res to send back the desired HTTP response.
//Get request handler
app.get('/posts/:id/comments', (req, res) => {
  //Look inside of the commentsByPostId object, look up the ID that was provided inside the path and if not create an empty array so we do not get an undefined
  res.send(commentsByPostId[req.params.id] || []);
});

//Post request handler
app.post('/posts/:id/comments', async (req, res) => {
   //Generate comment ID
  const commentId = randomBytes(4).toString('hex');
  //Pull out comment content provided by user
  const { content } = req.body;
  //Check to see if we already have an array by post ID and if not create an empty array so we do not get an undefined
  const comments = commentsByPostId[req.params.id] || [];
  //Push in the comments we create into the array and add the status of 'pending for moderation feature
  comments.push({ id: commentId, content, status: 'pending' });
  //Assign comments array back to the given post inside of our commentsByPostId object
  commentsByPostId[req.params.id] = comments;
  //Post request to where event broker is running - pass status flag for moderation feature
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending'
    }
  });
  //Send back the entire array of comments
  res.status(201).send(comments);
});

//Post request handler to handle incoming events
app.post('/events', async (req, res) => {
  console.log('Event Received:', req.body.type);

  //Pull out the type and data prpoerties from the request body
  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    //Get the properties needed
    const { postId, id, status, content } = data;
    //Get all the comments associated with the post ID
    const comments = commentsByPostId[postId];
    //Iterate through list of comments and look for the appropriate comment we want to update
    //Find a comment that is equal to the id from the event
    const comment = comments.find(comment => {
      return comment.id === id;
    });
    //Update the status
    comment.status = status;
    //Put the event together and send over to the event-bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { 
        id,
        status,
        postId,
        content
      }
    })
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
