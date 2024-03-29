//app is an object returned by express(). Actually it instantiates Express and assigns app variable to it.
const express = require('express');
//To use the body parser
const bodyParser = require('body-parser');

const axios = require('axios');

//Create express application
const app = express();
//Wire up the bodyparser middleware 
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        });
    }
});

app.listen(4003, () => {
    console.log('Listening on 4003')
});