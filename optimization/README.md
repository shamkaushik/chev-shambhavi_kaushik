This is a prototype to optimize the JS files

This is how to run it:

 - npm install
 - node tools/r.js -o tools/build.js
 - grunt


Changes: 

 - All files need to be proper require modules with the code wrap around a define call and the proper dependencies
 - build.js contains the consolidated files
 - Pages are only loading 3 JS files
 	- require.js
 	- common.js (with most common 3rd party libraries)
 	- [page]_main.js
 - handlebar templates are not part of the HTML itself (embeded within a Script tag)

 Pending work:

  - Finalize folder structure that is compatible with hybris
  - confirm handlebars approach so that we can avoid those calls as well. Recommendation is to create JSPs in hybris for each template and do includes on the main JSP pages
  - integrate the optimization process (second command above) into the main grunt process




