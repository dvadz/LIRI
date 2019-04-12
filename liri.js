'use strict'

require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");

var Spotify = require("node-spotify-api");

var spotify = new Spotify(keys.spotify);

var userInputs = process.argv;

var liriApp = {
    command: "",
    searchFor: "",
    limit: 5
}

function start() {
    //check for user inputs
    if(userInputs.length<3) {
        console.log("No inputs were provided.");
        return false;
    }
    //get the command
    liriApp.command = userInputs[2];
    //get the search words
    liriApp.searchFor = userInputs.slice(3).join(" ");
    
    executeCommand();
}

function executeCommand() {
    //If a command was provided
    if(liriApp.command) {
        switch (liriApp.command){
            case "concert-this":
                // getSearchWords();
                get_concert();
                break;
            case "spotify-this-song":
                // getSearchWords();
                go_spotify();
                break;
            case "movie-this":
                // getSearchWords();
                get_movie();
                break;
            case "do-what-it-says":
                simon_says();
                break;
            default:
                console.log("Command is not recognized");
        }

    //provide options
    } else {
        // TODO: another possible path, use inquirer to interact with user
        console.log("TODO: provide some options")
    }
}

function get_concert() {
    // let artist = liriApp.userInputs[3];
    let artist = liriApp.searchFor;

    // just creating some space 
    console.log("");

    if(artist==='') {
        artist = "ariana grande"
        console.log(`Default artist => ${artist}`);
    } else {
        console.log(`Searching for => ${artist}`);
    }

    const url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

    axios
    .get(url)
    .then(function(response){

        //status is not OK
        if(response.status != 200) {
            console.log("Search was not successful. Please try again.")
        
        //no listed concerts, there is zero data
        } else if(response.status===200 && response.data.length===0) {
            console.log(`There are no upcoming concerts by "${artist}"`);
        
        //yes we have a match
        } else if(response.status===200 && response.data!=0){
            
            let concertDate = moment(response.data[0].datetime);

            var bandInfo = [
                `Venue: ${response.data[0].venue.name}`,
                `Location: + ${response.data[0].venue.city}, ${response.data[0].venue.region}, ${response.data[0].venue.country}`,
                `Date: ${concertDate.format("MM/DD/YYYY")}`,   
                `===================`
            ].join("\n");
            console.log(bandInfo);
        }
    })
    .catch(function(error){
        console.log(`Please confirm the artist/band name: ${liriApp.searchFor}`);
    });
}

function go_spotify() {
    // Artist(s)
    // The song's name
    // A preview link of the song from Spotify
    // The album that the song is from
    // If no song is provided then your program will default to "The Sign" by Ace of Base.
    let song = liriApp.searchFor;

    //just creating some space
    console.log("");

    if(song==="") {
        song = "The Sign"
        console.log(`Default search => ${song}`);
    } else {
        console.log(`Search for => ${song}`);
    }

    spotify
    .search({ type: 'track', query: song })
    .then(function(response) {

        let songInfo = [
            `Artists: ${response.tracks.items[0].artists[0].name}`,
            `Title: ${response.tracks.items[0].name}`,
            `Preview: ${response.tracks.items[0].album.artists[0].external_urls.spotify}`,
            `Album: ${response.tracks.items[0].album.name}`
        ].join('\n');

        // console.log(   response.tracks.items[0]);
        // console.log("=================");
        console.log(songInfo);
    })
    .catch(function(err) {
        console.log(err);
    });
}

function get_movie() {
    let title = liriApp.searchFor;

    //just creating some space
    console.log("");

    if(title==="") {
        title = "Mr Nobody"
        console.log(`Default search => ${title}`);
    } else {
        console.log(`Searching for => ${title}`);
    }

    const url = "http://www.omdbapi.com/?apikey=trilogy&t=" + title;

    axios
    .get(url)
    .then(function(response){
        let rottenTomatoesRating = "Not rated";
        //get the Rotten Tomatoes rating
        for(let i=0; i<response.data.Ratings.length; i++) {
            if(response.data.Ratings[i].Source==='Rotten Tomatoes') {
                rottenTomatoesRating = response.data.Ratings[i].Value;
                break;
            }
        }
            var movieInfo = [
                `Title: ${response.data.Title}`,
                `Year: ${response.data.Year}`,
                `IMDB_Rating: ${response.data.imdbRating}`,
                `Rotten Tomatoes Rating: ${rottenTomatoesRating}`,
                `Country: ${response.data.Country}`,
                `Language: ${response.data.Language}`,
                `Actors: ${response.data.Actors}`,
                `Plot: ${response.data.Plot}`
            ].join('\n');
            
            console.log(movieInfo);
    })
    .catch(function(error){
        console.log("A problem was encountered while looking up your movie");
    });
}

function simon_says() {
    //read the random.txt file
    fs.readFile("random.txt","utf8", function(error, data){
        if(error) {
            console.log("Error: check the random.txt file");
            return false;
        }
        //split data into an array for later parsing
        let randomFile = data.split(",");
        

        if(randomFile.length<2) {
            console.log("Error: random.txt must have at least 2 arguments.");
        
        //run the command            
        } else {
            liriApp.command = randomFile[0];
            liriApp.searchFor = randomFile[1];
            executeCommand();
        }
    });
}

function getSearchWords() {

    liriApp.searchFor = "";
    let search = [];
    
    if(userInputs.length===4) {
        liriApp.searchFor = userInputs[3]
    } else {
        for(let i = 3; i < userInputs.length; i++){
            // liriApp.searchFor += userInputs[i] + '+';
            search.push(userInputs[i]);
        }
        liriApp.searchFor = search.join("+");
    }
}

function saveToFile(response) {
    fs.writeFile("concert.txt",JSON.stringify(response.data),"utf8", function(error){
        if(error) {
            console.log("Something went wrong during saving response to file");
            console.log(error);
        }
    });

}
start();