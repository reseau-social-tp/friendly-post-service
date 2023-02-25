const mongoose = require('mongoose');

const URI = process.env.MONGO_URL;
mongoose.set("debug", true);
mongoose.set("strictQuery", false);

mongoose.connect(URI,
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
} 
)
.then(() => console.log("connected to MongoDB"))
.catch((err) => console.log("Failed to connect to MongoDB", err));
