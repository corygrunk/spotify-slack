const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const request = require('request')
const spotify = require('spotify-node-applescript')
const getColors = require('get-image-colors')
if (!process.env.PORT) throw Error('PORT missing but required')

var slapp = Slapp({
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})

var app = slapp.attachToExpress(express())

slapp.command('/spotify', '(.*)', (msg, text, question) => {
  qs = encodeURIComponent(text.trim())
  request('https://api.spotify.com/v1/search?q=' + qs + '&type=track,artist,album', function (error, response, body) {
    bodyJson = JSON.parse(body)
    if (!error && response.statusCode == 200 && bodyJson.tracks.items.length) {
      var track = bodyJson.tracks.items[0]
      var trackArtist = ':musical_note: *' + track.name + '* by *' + track.artists[0].name + '*'
      getColors(track.album.images[2].url, function(err, colors){
        var trackColor = colors.map(color => color.hex())[0]
        msg.say({
          text: 'Playing:',
          attachments: [
            {
              title: trackArtist,
              image_url: track.album.images[1].url,
              color: trackColor
            }]
        })
      })
      spotify.playTrack(track.uri, function(){
        // track is playing
      })
    } else {
      msg.say(':cry: Sorry, I couldn\'t find that song')
    }
  })
})

app.get('/', function (req, res) {
  res.send('Hello.')
})

console.log('Listening on : ' + process.env.PORT)
app.listen(process.env.PORT)
