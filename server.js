require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { URL } = require('url');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original: String,
  short: Number
});

const urlModel = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyparser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

const stringIsAValidUrl = (s, protocols) => {
    try {
        url = new URL(s);
        return protocols
            ? url.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/new', function(req, res) {
  const url = req.body.url;
  if (!url || !stringIsAValidUrl(url, ['http', 'https'])) {
    res.json({ error: "invalid url" })
    end()
  }
  let count = Math.floor(Math.random() * 1000000) + 100;
  const urlObj = new urlModel({ original: url, short: count + 1 });

  urlObj.save((err, data) => {
    if (err) {
      res.json({ error: "URL not created" });
      end()
    }
    res.json({
      original_url: url,
      short_url: data.short
    });
  })
});

app.get('/api/shorturl/:id', function(req, res) {
  const urlId = req.params.id
  if (!urlId) res.json({ error: "Short URL required" })

  urlModel.findOne({ short: urlId }, (err, data) => {
    console.log(err)
    if (err) {
      res.json({ error: "short URL not found" })
      end()
    }
    res.redirect(data.original);
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
