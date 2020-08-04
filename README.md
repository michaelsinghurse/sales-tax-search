# Sales Tax Search 

Sales Tax Search is a web application designed to assist tax preparers and
accountants with the often tedious task of looking up sales tax rates. It is
still under development and all suggestions for its improvement are much
appreciated.

## Technologies Used 

### Front-End
* HTML/CSS
* JavaScript (no front-end frameworks)
* jQuery 
* [clipboard.js](https://clipboardjs.com/)
* [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)

### Back-End
* Node.js
* Express.js
* MongoDB
* [Avalara AvaTax API](https://developer.avalara.com/)
* [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)

## Technical Challenges
### SPA without a Framework

I wanted the app to have the look and feel of a single page application without
the overhead of using a front-end framework. I knew at the outset that I was 
just going to have a few pages - the search page, an about page, and a login 
page - and I wanted each page to have the same header, background image, and 
footer. If I had separate html files for each of those pages, there would be a 
significant amount of code duplication. Instead, I chose to create one base 
html file, which acts as a shell that contains the header, background, and
footer, and then client-side JavaScript code switches out the content of the
`main` element in response to user navigation.

Let me illustrate how this works by considering the following scenarios.

**First: User enters a url.** When the user enters a url, the browser sends a 
request to the server for the resource at the entered path, whether it's "/" for
the root, "/about" for the "About" page, or "/foo" for a non-existent page. The
server in this application always responds by sending the "index" page, which is
the shell for all the other views and contains links to the static resources
like CSS and JavaScript files and the header, main (which is empty), and footer html. 

Once the browser receives and parses the "index" page, it fires the
`DOMContentLoaded` event. Client-side JavaScript code responds to this 
event by fetching and inserting the view corresponding to the url. 
It first retrieves the url of the current page via the 
`window.location.pathname` property. It then checks to see if that path
is for a page that actually exists. If so, it sends an AJAX request to the server for
the view corresponding to that page. If the path does not exist, it sends a request for the 
"404" view. For example, if the url is "salestaxsearch.com/about", 
a request is sent for "/views/about". If the url is "salestaxsearch.com/foo", 
a page that doesn't exist, a request is sent to "/views/404". And then once
the view is returned, it is inserted into the `main` element.

**Second: User clicks an anchor.** When the user clicks a navigation bar anchor,
JavaScript code prevents the browser from taking its default action of follwing
the link. If this were allowed to occur, then
there would be the same two round trips to the server as illustrated in the case
of the user entering a url (discussed above), and there would also be a full page 
load of the "index" page. Instead, JavaScript code sends an AJAX request for the 
view referenced in the anchor element's `href` property, and inserts the returned 
hmtl into the `main` element. There is not a page reload.

If nothing more were done at this point, however, the user's back and forward
navigation buttons would not work as expected. Because the browser's default
action was prevented, the session history is not updated and the browswer
acts as if the page was never changed. In order to simulate a true page change,
I used the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History)
to add the new url to the history stack via the `history.pushState` method. 
The first and second arguments to the method are `state` and `title`. Since 
the application isn't maintaining state between pages and
since the title attribute is ignored by most browsers, I simply pass in an empty
object and empty string, respectively. The third argument is the relevent one 
for my purposes, and I pass in the url of the new page requested. After doing 
this, the back and forward buttons work as expected. 

### Minimizing the Wait for a Map

Rendering the map at the sales location is a two-step process involving two
separate Google Maps API's. First, I call the Google Maps Gecoding API with the
address, and it returns, among other things, the latitude and longitude of the
address. Then I pass these coordinates to the Google Maps JavaScript API and it
renders a map centered at that location. The JavaScript API must be called from 
the browser, while the Geocoding API can be called from either the browswer or
server.

In my first iteration of the app, I had the following sequence - upon a search form
submit, I would take the street, city, state, and zip and make an AJAX request
to the server. The server called the Avalara AvaTax API for the tax rates at
that address. When it responds, I pass the rates into a view and return the html
rendered by the view engine. Then I call the Geocoding API and the JavaScript
API in sequence. What happened was that I would insert the HTML returned by the 
server and then call the two Google Maps API's. The `div` container for the map
would be empty for a second or two while awaiting the Map APIs's responses. I didn't
want that to happen so I re-factored the steps.

Now, the current iteration has the server calling both the Avalara and Geocoding
API's. I use `Promise.allReady()` to wait for the response from both API's,
before passing the rates and latitude and longitute to the view. The latidude
and longitude I place in a `data` attribute in the maps `div` container. Now
once the HTML is returned and inserted to the DOM, only the Maps JavaScript API
needs called. It queries the container for the data attribute, takes the
latitude and longitude from it, and then renders the map based on those
coordinates. I didn't measure the difference in speed, but now the map renders
only probably less than a second after the rates html does. There is not an empty
map box for long.

### Exposing the Google Maps API key

The Google Maps JavaScript API key must be embedded in a `script` element in the
HTML. This poses a security problem as anyone who is motivated can look at the
HTML of your page and steal the key. In addition, if you have the key embedded
in your html, it will show up on GitHub. I did this initially and
received security warnings from GitHub, and so knew I need to change something.

I took a few steps to try to mitigate the liklihood of my key being stolen
and the damage that could occur it were. 

First, rather than have the key typed in the HTML, I put it in an environment 
variable and have the view engine insert it when the page is sent by the server.
Someone can still access the HTML if they are viewing the web site, but at 
least it's not sitting there in the html in my public repo.

Second, I set restrictions on the key through the Google Console. I restricted
the key to only specific hosts, and so unless the request is coming from one
of the two or three websites I specify, it will be rejected.

Third, I created a separate key for the Geocoding API. As I said above, I use
the Geocoding API on the server-side only, and so this key doesn't come with the
same security vulnerabilities as using the other key does. 

## Potential Features
1. **Add links to jurisdiction websites**. One accountant suggested that it would be 
   helpful if each search result contained hyperlinks to the state, city, county, 
   and district taxing jurisdiction websites. The user could then click through
   to see the primary source documents for the rates.

2. **Separate the combined district rate into its individual components.** The 
   app currently lumps all special district taxes together, and there is no way 
   to tell what the individual district names and rates are. For example,
   certain addresses in Denver, CO have a combined district rate of 1.1%. If this 
   new feature were added, there would be a line for each of the individual district
   rates that make up the combined rate - in this case, the Regional 
   Transportation District tax of 1% and the Scientific and Cultural Facilities 
   District tax of 0.1%.

3. **Add an input for the seller's address**. In some states and for some 
   transactions, the sales tax rate is based upon the seller's address rather 
   than the buyer's. For example, one origin-based state is Illinois. If your 
   business is based in Chicago, and you ship a product to a customer in 
   Rockford, IL, you would charge the Chicago rate (origin) rather than the 
   Rockford rate (destination). As it stands now, the app doesn't consider the
   complexities of origin- and destination-based rates. It shows you the rate
   that would apply if you bought a product face-to-face at your address. 

4. **Add an input for the product type**. Product types add another layer of 
   complexity to sales tax rates. There are different rates for different 
   products. For example, some states have lower rates for essentials like 
   groceries and medicine. Some states have different rates for software 
   depending on whether the software is custom or off-the-shelf ("canned"). 
   In order to present an accurate sales tax rate, the app needs to take the 
   product type into consideration.
   
## Author
* Michael Singhurse
* michaelsinghurse@gmail.com 

