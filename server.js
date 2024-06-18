const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
require('dotenv').config()
const app = express();
const basicAuth = require('express-basic-auth');
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.plugin(require('./app/utils/diff-plugin'));

const allowedOrigins = ['http://localhost:3000']

var corsOptions = {
  origin: allowedOrigins
};

app.use(cors());

// visualizar arquivo estático
const uploadConfig = require('./app/config/upload')
app.use('/files', express.static(uploadConfig.directory))
// parse requests of content-type - application/json
app.use(express.json({limit: '50mb'}));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

const Teste = mongoose.model(
  "Teste",
  new mongoose.Schema({
    timestamp: String,
    dados: []  
  })
)

mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB!");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Processo project!" });
});

// post to insert data in mongo
app.post("/api/processo", basicAuth({
    users: {
      'user': process.env.USERPASS
    },
  }),
  async (req, res) => {
    let timestamp = new Date().toLocaleString('pt-BR', {timeZone: 'America/Belem'})
    try {
      let count = 0
      if (typeof(req.body[0]) === "object") {
        try {
          req.body.filter(async item => {
            const teste = new Teste({
              timestamp: timestamp,
              dados: item,
            })
            await teste.save((err, test) => {
              if (err) {
                console.log("Erro ao salvar documento em Teste")
                res.status(500).json('erro no tratamento dos dados');
                return;
              } else {
                console.log("Data saved in Mongo collection array ", timestamp)
              }
            })
            count = count + 1
          })
          res.status(200).json(`u${req.body[count]?.ubc} f${req.body[count]?.forno} OK`)
        } catch (error){
          res.status(500).json('erro no tratamento dos dados');
          console.log("erro nos registros do processo", error, timestamp)
        }
      } else {
        console.log("Dado recebido não é do tipo object", timestamp)
        res.status(422).send("Erro nos registros")
      }
    } catch (error){
      console.log("Erro no código da rota api/processo!!! ", error, timestamp)
      res.status(500).json('erro na rota');
    }
});

app.get("/api/processo/getalldados", (req, res) => {
    Teste.find().sort({ _id: -1 }).limit(5000).exec((err, teste) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send(teste);
    })
})

app.delete("/api/processo/deletebyid", basicAuth({
    users: {
      'user': process.env.USERPASS
    },
  }),
  async (req, res) => {
    const { _id } = req.body
    try {
      Teste.findByIdAndRemove(_id, function(err, doc) {
        if (err) res.send(err);
        else {
          console.log("Documento processo excluído: ", doc)
          res.send(doc);
        }
      })
    } catch (error){
      console.log('🔺 erro ao excluir documento do processo');
      res.status(500).send({ message: '🔺 Erro ao excluir documento do processo: ' })
    }
})

app.post("/api/processo/search", (req, res) => {
  // const { ubc, forno, lote } = req.body;
  const dataIni = req.body.dataIni / 1000
  const dataFim = req.body.dataFim / 1000

  Pirometro.find({
    'dados.local': 1,
    'dados.timestamp': { $gte: dataIni, $lte: dataFim },
    'dados.processo': req.body.processo
  }).sort({_id: -1}).exec((err, processo) => {
    if (err) {
      res.status(500).send({ message: "Erro ao buscar dados" });
      return;
    } else {
      res.status(200).send(processo);
    }
  });
});

// set port, listen for requests
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${process.env.APP_WEB_URL}:${PORT}`);
})
