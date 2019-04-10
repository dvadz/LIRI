'use strict'

require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require("moment");

// var spotify = new Spotify(keys.spotify);

var userInputs = process.argv;
const command = userInputs[2];

console.log(userInputs);
console.log(`The command: ${command}`);

//If a command was provided
if(command) {
    switch (command){
        case "concert-this":
            concert();
            break;
        case "spotify-this-song":
            spotify();
            break;
        case "movie-this":
            movie();
            break;
        case "do-what-it-says":
            simon();
            break;
        default:
            console.log("That is not a valid option");
    }

//provide options
} else {
    console.log("provide some options")
}


function concert() {
    console.log("Look up concerts");
    let artist = userInputs[3];

    // TODO: check if artist is valid
    // TODO: take of special chars as per doc

    const url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

    axios
        .get(url)
        .then(function(response){
        // TODO: show concert details
        // console.log(response.status);

        //status is not OK
        if(response.status != 200) {
            console.log("Search was not successful. Please try again.")
        
        //no listed concerts
        } else if(response.status===200 && response.data.length===0) {
            console.log(`There are no upcoming concerts by "${artist}"`);
        
        //yes we have a match
        } else if(response.status===200 && response.data!=[]){
            let concertDate = moment().set(response.data[0].datetime);
            
            console.log("DETAILS");
            console.log(`Venue: ${response.data[0].venue.name}`);
            console.log(`Location: ${response.data[0].venue.city}, ${response.data[0].venue.region}, ${response.data[0].venue.country}`);
            console.log(`Date: ${concertDate.format("MM/DD/YYYY")}`);
        }

    });

}

function spotify() {
    console.log("Look up a song");

}

function movie() {
    console.log("Look up a movie");

}

function simon() {
    console.log("Let's do it");

}

function getKeywords() {
    for(let i = 3; i < userInputs.length; i++){

    }
}