
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");
const functions = require("firebase-functions");

const app = express();
app.use(cors({origin: true}));

// Database Ref
const db = admin.firestore();

// Registrar entrada
app.post("/blog/create", (req, res) => {
    (async () => {
        try {
            const id = "" + Date.now()
            await db.collection('blogEntries').doc(id).create({
                idEntry: id,
                title: req.body.title,
                author: req.body.author,
                date: Date.now(),
                content: req.body.content,
            })
            return res.status(200).send({resultado: "Exitoso!", mensaje: "Información Almacenada Correctamente!"})
        } catch (error) {
            console.log(error)
            res.status(500).send({resultado: "Fallido!", mensaje: error})
        }
    })();
})

app.get("/blog", async (req,res) => {

    try{

        const query = db.collection('blogEntries')
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs

        const entries = docs.map((doc) => ({
            idEntry: doc.id,
            title: doc.data().title,
            author: doc.data().author,
            date: doc.data().date,
            content: doc.data().content.substring(0,60),
        }))

        return res.status(200).json(entries)

    }catch(error){
        console.log(error)
        res.status(500).send({resultado: "Fallido!", mensaje: error})
    }

})

app.get("/blog/:id", async (req,res) => {

    try{

        const query = db.collection('blogEntries').doc(req.params.id)
        let querySnapshot = await query.get()
        let response = querySnapshot.data()
        
        return res.status(200).send({resultado: "Existoso!", data: response})
    }catch(error){
        console.log(error)
        res.status(500).send({resultado: "Fallido!", mensaje: error})
    }

})

exports.app = functions.https.onRequest(app)

