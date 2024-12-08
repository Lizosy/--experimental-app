import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://lizwoz:lizwoz001@cluster0.tkh1m.mongodb.net/maybe?retryWrites=true&w=majority';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;