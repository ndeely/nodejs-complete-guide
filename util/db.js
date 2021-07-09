const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = cb => {
   MongoClient
       .connect(process.env.MONGODB_URI, { useUnifiedTopology: true} )
       .then(client => {
          _db = client.db();
          cb();
       })
       .catch(err => { if (err) console.log(err) });
};

const getDb = () => {
  if(_db) {
     return _db;
  }
  throw 'No database found.';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

