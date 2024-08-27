const express = require('express')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

users = []

app.use(express.urlencoded({ extended: false }));

app.post('/api/users', (req, res)=>{
  const username = req.body.username
  if(!username) {
    return res.json({error: "Username is required"})
  }
  const newUser = {
    username: username,
    _id: uuidv4(),
    log: []
  }
  users.push(newUser)
  res.json(newUser)
})

app.get('/api/users', (req,res) =>{
  res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res)=>{
  const {_id} = req.params
  const {description, duration, date} = req.body
  const user = users.find(u => u._id === _id)
  if(!user){
    return res.json({error: "User not found"})
  }

  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  }
  user.log.push(exercise)

  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  })
})
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.json({ error: "User not found" });
  }

  let logs = user.log;

  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(log => new Date(log.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(log => new Date(log.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: logs.length,
    log: logs.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
