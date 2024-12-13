import { MongoClient, ServerApiVersion } from "mongodb";

//uri connection to the database
const uri = "mongodb+srv://sanishferrari:Sanish@userdata.jnzmm.mongodb.net/?retryWrites=true&w=majority&appName=UserData";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToDb() { //Function to connect to the database
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      return client; 
    } catch (error) {
      console.error("Errore di connessione a MongoDB:", error);
    }
  }
connectToDb().catch(console.dir);
