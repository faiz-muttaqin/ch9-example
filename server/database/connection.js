const mongoose = require("mongoose");

const mongoURI44 =
  "mongodb+srv://admin1:admin123@cluster0.2qjyvpt.mongodb.net/users?retryWrites=true&w=majority&ssl=true";
const mongoURI =
  "mongodb://admin:admin123@ac-2uuq66o-shard-00-00.2qjyvpt.mongodb.net:27017,ac-2uuq66o-shard-00-01.2qjyvpt.mongodb.net:27017,ac-2uuq66o-shard-00-02.2qjyvpt.mongodb.net:27017/users?ssl=true&replicaSet=atlas-53w6j9-shard-0&authSource=admin&retryWrites=true&w=majority";
const connectDB = async () => {
  try {
    // mongodb connection string
    const con = await mongoose.connect(mongoURI);
    // Mongoose 6 always behaves as if useNewUrlParser , useUnifiedTopology ,
    //  and useCreateIndex are true , and useFindAndModify is false . so its deleted/not used
    console.log(`MongoDB connected : ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
