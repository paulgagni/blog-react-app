const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
//Wire up the bodyparser middleware 
app.use(bodyParser.json());
app.use(cors());
//Create empty object
const posts = {};

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    //Pull id and title out of data
    const { id, title } = data;
    //insert into posts object
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    //Pull id, content, and postId out of data - add in the status flag for moderation feature
    const { id, content, postId, status } = data;
    //Find the aappropriate post inside of our post object
    const post = posts[postId];
    //add in the status flag for moderation feature
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    //Pull out the updated data
    const { id, content, postId, status } = data;
    // Look inside the post object to find all the comments with the appropriate post. look to that array of comments and find the comment that we're trying to update.
    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    //Update the comment status and content
    comment.status = status;
    comment.content = content;
  }
};

app.get('/posts', (req, res) => {
  //Send back the entire posts object anytime it is requested
  res.send(posts);
});

app.post('/events', (req, res) => {
  //Every event that is created has a type and a data property - use req to pull that out of the body
  const { type, data } = req.body;

  handleEvent(type, data);
  //Empty object to say the event was received and it was processed
  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");
  try {
    //Get all the events that have occurred over time
    const res = await axios.get("http://event-bus-srv:4005/events");

    //Iterate through all the events that have occured 
    for (let event of res.data) {
      console.log("Processing event:", event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});

