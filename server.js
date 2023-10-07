const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });


process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
})

const app = require('./app');

const mongoDB = "mongodb+srv://weniasss:NsCbukhLo8ZVx95H@cluster0.jr2o6dx.mongodb.net/natours?retryWrites=true&w=majority";
mongoose.connect(mongoDB)
  .then ((result) => {
    // console.log(result.connections)
    console.log('connection success');
})



  const port = process.env.PORT || 3000

  const server = app.listen(port , () => {
      console.log(`app running on port ${port}...`);
  });
  

  
  process.on('unhandledRejection', err=>{
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
  



