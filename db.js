import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://sanishferrari:Sanish@userdata.jnzmm.mongodb.net/?retryWrites=true&w=majority&appName=UserData";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToDb() {
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
