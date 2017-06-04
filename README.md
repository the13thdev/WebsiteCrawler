# WebsiteLinksCollector
Generates a list of links on a particular website (domain).

It works by in a similar way as the depth-first search of a graph.
Since it is written for nodejs, it implements the idea of graph traversal using asynchronous callbacks.

For the specified homepage_url on the server.js, it will start crawling through all links starting with the homepage_url.
It starts fetching the list of links as soon as the server is started. Once all links have been fetched, it will print a message to the console.
The list of links can then be retrieved by simply making a get request to the localhost using a browser.

*The script will need to be customized depending upon the website it will be used on.
