const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
//Wire up the bodyparser middleware 
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  //Add post to post collection
  posts[id] = {
    id,
    title
  };
  //Post request to where event broker is running
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostCreated',
    data: {
      id, 
      title
    }  
  });


  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Received Event:', req.body.type);

  res.send({});
});

app.listen(4000, () => {
  console.log('v25');
  console.log('Listening on 4000');
});
