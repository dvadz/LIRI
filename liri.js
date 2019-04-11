'use strict'

require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require("moment");
var Spotify = require("node-spotify-api");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);

var debug = true;

var liriApp = {
    command: "",
    searchFor: "",
    limit: 5
}

// console.log(liriApp.userInputs);
// console.log(`The command: ${command}`);


function start() {

    //check for user inputs
    if(process.argv.length<3) {
        console.log("No inputs were provided.");
        return false;
    }
    //get the command
    liriApp.command = process.argv[2];

    //If a command was provided
    if(liriApp.command) {
        switch (liriApp.command){
            case "concert-this":
                getSearchWords();
                get_concert();
                break;
            case "spotify-this-song":
                getSearchWords();
                go_spotify();
                break;
            case "movie-this":
                getSearchWords();
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

    // TODO: check if artist is valid
    // TODO: take of special chars as per doc
    // TODO: support multiple words string

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
            
            let count = 0;
            //display the first 5 results
            do{
                if(count===0) console.log("==FIRST 5 RESULTS==");

                let concertDate = moment(response.data[count].datetime);

                console.log(`Venue: ${response.data[count].venue.name}`);
                console.log(`Location: ${response.data[count].venue.city}, ${response.data[0].venue.region}, ${response.data[0].venue.country}`);
                console.log(`Date: ${concertDate.format("MM/DD/YYYY")}`)   
                console.log("===================")
                count++
            }while(count<response.data.length && count<liriApp.limit);
            console.log(`Number of results : ${response.data.length}`);
        }
            saveToFile(response);
    })
    .catch(function(error){
        console.log(`Please confirm the artist/band name: ${liriApp.searchFor}`);
    });
}

function go_spotify() {
    spotify
    .search({ type: 'track', query: 'All the Small Things' })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(err) {
      console.log(err);
    });
}

function get_movie() {
    // TODO: no movie title is provided
    // var title = liriApp.userInputs[3];
    let title = liriApp.searchFor;

    if(title==="") {
        title = "Mr+Nobody"
    }
    var url = "http://www.omdbapi.com/?apikey=trilogy&t=" + title;

    axios
    .get(url)
    .then(function(response){
        // console.log("parsing OMDB response")
        // console.log(response.data);
        // console.log(url);
        let rottenTomatoesRating = "Not rated";
        //get the Rotten Tomatoes rating
        for(let i=0; i<response.data.Ratings.length; i++) {
            if(response.data.Ratings[i].Source==='Rotten Tomatoes') {
                rottenTomatoesRating = response.data.Ratings[i].Value;
                break;
            }
        }
            console.log("================")
            console.log(`Title: ${response.data.Title}`);
            console.log(`Year: ${response.data.Year}`);
            console.log(`IMDB_Rating: ${response.data.imdbRating}`);
            console.log(`Rotten Tomatoes Rating: ${rottenTomatoesRating}`);
            console.log(`Country: ${response.data.Country}`);
            console.log(`Language: ${response.data.Language}`);
            console.log(`Actors: ${response.data.Actors}`);
            console.log(`Plot: ${response.data.Plot}`);
            console.log("================")
    })
    .catch(function(error){
        console.log("A problem was encountered while looking up your movie");
    });
}

function simon_says() {
    console.log("Let's do it");

}

function getSearchWords() {

    liriApp.searchFor = "";
    let temp = [];
    
    if(process.argv.length===4) {
        liriApp.searchFor = process.argv[3]
    } else {
        for(let i = 3; i < process.argv.length; i++){
            // liriApp.searchFor += process.argv[i] + '+';
            temp.push(process.argv[i]);
        }
        liriApp.searchFor = temp.join("+");
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