# WebsiteLinksCollector
Generates a list of sub urls on a particular website (domain).

It works by in a similar way as the depth-first search of a graph.
Since it is written for nodejs, it implements the idea of graph traversal using asynchronous callbacks.

For the specified homepage_url on the server.js, it will start crawling through all links starting with the homepage_url.
It starts fetching the list of links as soon as the server is started. Once all links have been fetched, it will print a message to the console.
The list of links can then be retrieved by simply making a get request to the localhost using a browser.

Example output for homepage_url = ""http://jindal.utdallas.edu"

{"number_of_links":586,"list_of_links":["http://jindal.utdallas.edu","http://jindal.utdallas.edu/rotator/student-earns-campus-professional-recognition","http://jindal.utdallas.edu/news/jindal-school-professor-earns-second-top-award-from-d-ceo","http://jindal.utdallas.edu/news/category/academics","http://jindal.utdallas.edu/news/category/index.php","http://jindal.utdallas.edu/news/category/alumni","http://jindal.utdallas.edu/news/category/corporate","http://jindal.utdallas.edu/news/category/development","http://jindal.utdallas.edu/news/category/events","http://jindal.utdallas.edu/news/category/faculty","http://jindal.utdallas.edu/news/category/students","http://jindal.utdallas.edu/news/month/May-2017",.....]}

*The script will need to be customized depending upon the website it will be used on.
