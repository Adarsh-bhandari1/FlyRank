import { createClient } from "@supabase/supabase-js";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import "dotenv/config";
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
const superbase_url = process.env.SUPERBASE_URl;
const superbase_key = process.env.SUPERBASE_KEY;
if (!superbase_url || superbase_key) {
    console.log("Unable to connect to superbase please check the credentials!");
}

const superbase = createClient(superbase_url, superbase_key);
app.get('/', (req, res) => {
    res.json({
        message: " Server running fine!"
    })
});

app.listen(port, () => {
    console.log(`Server running at ${port}`);
    console.log(`superbase connected`);
})