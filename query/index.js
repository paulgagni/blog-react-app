const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
//Create empty object
const posts = {};

app.get('/posts', (req, res) => {
  //Send back the entire posts object anytime it is requested
  res.send(posts);
});

app.post('/events', (req, res) => {
  //Every event that is created has a type and a data property - use req to pull that out of the body
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    //Pull id and title out of data
    const { id, title } = data;
    //insert into posts object
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    //Pull id, content, and postId out of data
    const { id, content, postId } = data;
    //Find the aappropriate post inside of our post object
    const post = posts[postId];
    post.comments.push({ id, content });
  }

  console.log(posts);
  //Empty object to say the event was received and it was processed
  res.send({});
});

app.listen(4002, () => {
  console.log('Listening on 4002');
});
