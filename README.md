# www.effinger.ch

## Setup

* Generator: [Hugo](https://gohugo.io/)
* SASS Precompiler: Hugo takes SASS files in the `assets` folder and generates CSS under `static/css`.
* Source Code: Stored on [GitHub](https://github.com/makery/www.effinger.ch)
* Hosting: [Netlify](https://www.netlify.com/)
* Domain Registrar: [Cyon](https://www.cyon.ch/) (Marco's Account)


### Rebuilds on Netlify

* Whenever something is pushed to GitHub, Netlify rebuilds the site.
* Every night at 3am [IFTTT](https://ifttt.com/) calls a Netlify webhook to trigger a rebuild.
* Daily rebuilds are necessary for:
  * Hiding past events.
  * Showing the current coworking host based on the Google Calendar entry.
  * Showing opening hours specified in `data/oeffnungszeiten_coworking.toml` and `data/oeffnungszeiten_kaffeebar.toml`


## Local Development

To develop and preview the website locally, follow those steps:

1. Install Hugo: https://gohugo.io/getting-started/installing/   
Note: Your Hugo version must be higher or equal to the version specified in `netlify.toml`.
2. In the command line execute `hugo server`.
3. This will start a local server that you can view at `http://localhost:1313/`.


## Edit Content

This section describes how to add and edit content of the website.

### Events

To create a new event follow these steps:

1. Go to the website and find one of the later events that looks similar to what you want. Take note of the event number in the url.
2. Find the event under `content/events/...` and make a copy of it.
3. Change the folder name to match the latest event number + 1.
4. Change the metadata which is in the [toml](https://github.com/toml-lang/toml) format:
    * **title**: The title of the event.
    * **description**: A summary of the text. The summary is displayed when the the event is shared in Slack or social media. Google also uses this description in search results. So this is quite important.
    * **image**: The main image of the event. This is - like the description - displayed in social media.
    * **startdate**: The date and time when the event starts. The format is `2018-12-02T10:00:00Z`.
    * **enddate**: The end date and time.
    * **categories**: The category is displayed in the overview and is also used to determine the event color. The valid categories are specified in `assets/sass/custom/_events.scss`. Current categories: `community`, `kaffeebar`, `coworking`, `atelier`, `werkstatt`, `labor`.
    * **location**: The location of the event.
    * **registration** (optional): If set to true, a form is displayed for registration. This creates a Google Sheet where the registered users are saved. To see the Google Sheet click on the link called "Teilnehmende".
    * **registration_max** (optional): Limits the registration to the specified number of people.
    * **registration_close** (optional): Date and time when the registration should be closed.
5. Add blog images. All images of the event should be stored in the folder of the event.
6. Add the content: Below the metadata add the [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) content.



### Blog

To create a new blog post follow these steps:

1. Go to the website and find one of the later blog posts that look similar to what you want to add.
2. Find that blog post under `content/blog/...` and make a copy of it.
3. Rename the folder. The folder name will be the url of the post so make sure it does not contain any special characters.
4. Change the metadata which is in the [toml](https://github.com/toml-lang/toml) format:
    * **title**: The main title.
    * **date**: The publish date in reverse notation.
    * **description**: A summary of the text. The summary is displayed in the blog overview and also when the post is shared in Slack or social media. Google also uses this description in search results. So this is quite important.
    * **image**: The main image of the post. This is - like the description - displayed in the overview and on social media.
    * **authors**: A list of authors (full name).
    * **comments**: If set to true, comments are enabled.
    * **tags**: The tags of the blog post. Make sure not to use too many new tags. To see an overview of all existing tags see the sidebar in the [blog overview](https://www.effinger.ch/blog/).
5. Add blog images. All images of the blog post should be stored in the folder of the post.
6. Add the content: Below the metadata add the [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) content.


#### HTML in Content

The markdown content can also contain HTML. You should try to avoid too much HTML. But for some things it is necessary. Here are some examples of when you must use HTML markup:

##### Lead text

```
<div class="lead">
  Schön war es mit euch zu feiern und in Erinnerungen schwelgen. Wunderbar war es anzusehen, wie auch unser Jubiläumsfest die Vielfalt verkörpert hat, die im Effinger im letzten Jahr entstanden ist.
</div>
```

##### Image Captions

```
<p class="image-caption">
  Besuch bei den Effinger-Coworkerinnen Hanne und Marion in ihrer Heimat Norwegen.
</p>
```


##### YouTube Videos

```
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/9uqIkhLZ1FA?rel=0" frameborder="0" allowfullscreen></iframe>
</div>
```

or in the 4:3 format

```
<div class="embed-responsive embed-responsive-4by3">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/9uqIkhLZ1FA?rel=0" frameborder="0" allowfullscreen></iframe>
</div>
```

##### Carousel Slider

```
<div class="blog-posts-carousel-alt">
  <div>
    <img src="bau-01.jpg">
  </div>
  <div>
    <img src="bau-02.jpg">
  </div>
  <div>
    <img src="bau-03.jpg">
  </div>
</div>
```


## Effianer and Kaffeebar Team

To add or edit **Effianer** change the following files:

* Info about Effianer: `data/effianer.toml`
* Effianer images: `static/images/effianer/...`

To add or edit **Kaffeebar** team members change the following files:

* Kaffeebar: `data/kaffeebar.toml`
* Kaffeebar images: `static/images/kaffeebar/...`


## Kaffeebar Menu

The Kaffeebar menu is defined in the file `content/kaffeebar/_index.md`.

All menu items are defined as [toml](https://github.com/toml-lang/toml) metadata.