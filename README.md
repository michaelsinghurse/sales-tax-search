# Sales Tax Search 

Sales Tax Search is a web application designed to assist tax preparers and
accountants with the often tedious task of looking up sales tax rates. It is
still under development and all suggestions for its improvement are much
appreciated.

## Major Technologies Used 

### Front-End
* HTML5/CSS
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

## Author
* Michael Singhurse
* singhurse@lisieuxresearch.com 

## Additional Features
1. **Add links to jurisdiction websites**. One beta tester said it would be helpful 
   if each search result contained hyperlinks to the state, city, county, and 
   special district taxing jurisdiction websites. The user could then click through
   to the primary source documents for the rates.

2. **Break out the district tax rate into its individual components.** Right now, 
   all special district taxes are lumped together, and there is no way to tell 
   the individual district names and rates that are in effect. For example, an address 
   in Denver, CO might have a combined district rate of 1.1%. If this new feature were
   added, there would be a line for the Regional Transportation District tax of
   1% and a line for the Scientific and Cultural Facilities District tax of 0.1%.

3. **Add a field to input the seller's address**. In some states and in some transactions, 
   the sales tax rate is assessed based upon the seller's address rather than
   the buyer's. For example, one origin-based state is Illinois. If your business 
   is based in Chicago, and you ship a product to a customer in Rockford, IL, 
   you would charge the Chicago rate (origin) rather than the Rockford rate 
   (destination). As it stands now, this website doesn't consider the
   complexities of origin- and destination-based rates. It shows you the rate
   that would apply if you bought a product face-to-face at a store at your
   address. 

4. **Add a field to input the product type**. This is another complexity of sales 
   tax rates. There are different rates for different types of products. For 
   example, some states have lower rates for essentials like groceries and 
   medicine. Some states have different rates for software depending on whether 
   the software is custom or off-the-shelf ("canned"). In order to present an
   accurate rate, the website needs to take the product type into account.
   
