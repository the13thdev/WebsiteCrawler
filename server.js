//Importing modules
var express = require('express');
var morgan = require('morgan');
var request = require('request');
var cheerio = require('cheerio');
var url = require('url');

//data Variables

//homepage url must be without the ending /
var homepage_url = "http://jindal.utdallas.edu";

//known file extensions to omit from the web links
var file_extenstions = [".pdf",".jpg",".png",".gif",".ppt",".pptx",".doc",".docx",".xls",".zip", ".swf"];

//sub paths to exclude
var exclude_paths = ["http://jindal.utdallas.edu/som","http://jindal.utdallas.edu/som/faculty","http://jindal.utdallas.edu/faculty","http://jindal.utdallas.edu/phd-students","http://jindal.utdallas.edu/blog","http://jindal.utdallas.edu/som/blog", "http://jindal.utdallas.edu/som/application", "http://jindal.utdallas.edu/application"];

//varible to keep track of viited nodes
var visited = [];
//variable representing list of all nodes
var list = [];

//initializing express
var app = express();

//setting port to listen on
app.set('port', (process.env.PORT || 5000));

//middleware for logging requests
app.use(morgan('dev'));

app.get('/',function(req,res,next){

    res.json({number_of_links:list.length, list_of_links: list});
    //res.send("Website Links Collector! :)");
});

/**
 * Middleware to be used at last to hande invalid requests made to server
 * If a request is made to the server for which an endpoint has not been defined, then this middleware displays an error text.
 */
app.use(function(req,res,next){
  res.send("Error.....!!!!");
});

//Start server
app.listen(app.get('port'),function(){
  console.log('Node app is running on port', app.get('port'));
  console.log("Starting to fetch data");
  //marking homepage_url as visited
  visited[homepage_url]=true;
  //crawling outward from homepage rl
  recursiveScrape(homepage_url, function() { console.log("All data fetched"); });
});

/*
  If the current_url is not a broken link, then the function fetches all links on that webpage and marks the content_url as visited.
  For all valid sub urls listed on the current_url page, it calls the recursiveScrape() on them to get list of links from them.
  Works in a simillar way to depth first search of a graph traversal. Once all the links have been fetched starting with current_url as root node,
  then the function call reportCallback();
  If the current_url is a broken link, it calls the reportCallback directly.
*/
function recursiveScrape(current_url, reportCallback)
{
  //console.log("recursiveScrape called with "+current_url);
  //visited[current_url]=true;

  function processSublist(sublist) {
    //console.log("..logging sublist");
    //console.log(sublist);
    if(sublist.length<=0){
      reportCallback();
    } else{
      var sublist_counter = 0;
      function sublist_callback(){
        ++sublist_counter;
        if(sublist_counter<sublist.length){
          recursiveScrape(sublist[sublist_counter],sublist_callback);
        }
        else {
          reportCallback();
        }
      }
      recursiveScrape(sublist[0],sublist_callback);
    }
  }

  //getting all links on current_url page
  request.get({ url: current_url}, function(error, response, body){
    var sublist = [];
    if(!error && response.statusCode==200){
      //Data Successfully loaded
      console.log("data fetched Successfully from url "+current_url);
      console.log("links count = "+list.length);
      //feeding body through cheerio
      var $ = cheerio.load(body);
      var i,j,urlIsAPathToFile,urlIsAPathToExclude,arr = $('a');
      for(i=0;i<arr.length;++i)
      {
        if((($(arr[i]).attr('href'))!=null))
        {
          /*if(current_url==null)
          console.log("..current_url undefined");
          if(($(arr[i]).attr('href'))==null)
          {
            console.log("..href attr undefined");
            console.log(arr);
          }*/
          var item_url = getUniqueURL(url.resolve(current_url,$(arr[i]).attr('href')));
          //console.log(item_url);
          if(isAValidSubUrl(item_url))
          sublist.push(item_url);
        }
      }

      var redirect_url = getUniqueURL(response.request.uri.href);
      console.log(redirect_url);

      //if the current_url is redirected to a different url
      if(redirect_url!= current_url) {
        //console.log("..redirect is different");
        //marking redirect url as visited
        visited[redirect_url]=true;
        //pushing the redirect url to sublist so that it can be processed later
        if(isAValidSubUrl(redirect_url))
        list.push(redirect_url);
      }
      //if the current_url is not redirected to any other url
      else {
        //adding current_url to list
        list.push(current_url);
      }
      processSublist(sublist);
    }
    //current_url is only added to the list if it is not a broken link
    //If the link is broken, reportCallback is directly called.
    else {
      //if the link is broken, no need to push current_url to list or call process sublist as there is no sublist in a way. Directly report callback.
      reportCallback();
    }
  });

}

/*
Returns true if the url has not been visited before and it is a valid sub url of the mentioned homepage_url that needs to be scraped.
*/
function isAValidSubUrl(item_url)
{
    //checking if the url represents a file on the website
    urlIsAPathToFile=false;
    for(j=0;j<file_extenstions.length;++j) {
      if(item_url.endsWith(file_extenstions[j])) {
        urlIsAPathToFile=true;
      }
    }

    //checking if the url is a path that needs to be excluded
    urlIsAPathToExclude=false;
    for(j=0;j<exclude_paths.length;++j) {
      if(item_url.startsWith(exclude_paths[j])) {
        urlIsAPathToExclude=true;
      }
    }

    if(item_url.startsWith(homepage_url) && !urlIsAPathToFile && !urlIsAPathToExclude && !visited[item_url]) {
      visited[item_url]=true;
      //console.log("..pushing "+item_url);
      return true;
    }

  return false;
}


/*
For simillar urls the function returns the same unique url.
Removes the #part from urls, removes the query part, removes the last occuring '/' at end, and changes 'https:' to 'http:'
*/
function getUniqueURL(item_url) {

  if(item_url.indexOf('#')>0){
    item_url = (item_url.substring(0,item_url.indexOf('#')));
  }
  if(item_url.indexOf('?')>0){
    item_url = (item_url.substring(0,item_url.indexOf('?')));
  }

  if(item_url.charAt(item_url.length-1)=='/')
  item_url = (item_url.substring(0,item_url.length-1));

  if(item_url.startsWith("https:")) {
    item_url = ("http:" + item_url.substring(6));
  }
  return item_url;
}
