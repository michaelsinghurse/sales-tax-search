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

## Potential Features
1. **Add links to jurisdiction websites**. One person suggested that it would be 
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
