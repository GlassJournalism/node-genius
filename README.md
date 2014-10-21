# Glass Genius CMS

## Accessing Production

Access Glass Genius CMS at http://glacial-ridge-6503.herokuapp.com/

## Running Locally

* Install Node.js from http://nodejs.org/download/
* Install Git if you don't have it installed http://git-scm.com/downloads
* Clone this repository ````git clone https://github.com/GlassJournalism/node-genius.git````
* From the repo directory, run ````npm install````
* To start the server locatlly, run ```npm start``` and browse to [http://localhost:1337](http://localhost:1337)
* To use Sails to refresh the browser automatically when Views are updated, run ````sails lift````


## Card Templates

View the HTML for Google's sample Glass cards at the Glass Developer Playground
https://developers.google.com/glass/tools-downloads/playground

### Creating Templates

* Create a new Template by browsing to **/template/create**
* Use the built-in HTML editor and preview window to design the card exactly how it will appear on the user's Glass
* To delineate fields to be populated by data, use the template convention of **{{item}}** where *item* will be replaced by content.  
* Fields can be placed anywhere - inside text areas, URLs that represent videos or images, or any other content that should be populated from the Card model into this Template.

### Sample Card ###

````
<article class="photo">
  <img src="{{backgroundImage}}" width="100%" height="100%">
  <div class="overlay-gradient-tall-dark"/>
  <section>
    <img src="{{avatarImage}}" class="left"/>
    <p class="text-auto-size">{{contentText}}</p>
  <section>
</article>

````

When a card is created with this Template, the available fields for content will be **backgroundImage**, **avatarImage**, and **contentText**.
