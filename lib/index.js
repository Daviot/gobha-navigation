/////
// Dependencies
/////
var each = require('async').each

// expose plugin
module.exports = plugin

/**
 * Metalsmith plugin to replace handlebar helper and code in an markdown/html file
 * @param {Object} options
 *   @property {String} extension (optional)
 *   @property {Boolean} logging (optional)
 * @return {Function}
 */
function plugin(opts) {
	// default values
	opts = opts || {}

	// fixed values
	var ext = opts.extension || 'html|php|md|hbs',
		logging = opts.logging || false

	// plugin action
	return (files, metalsmith, done) => {
		if(logging) {
			console.log(' ')
			console.log('[Plugin] navigation')
		}
		var metadata = metalsmith.metadata(),
			keys = Object.keys(files),
			htmlFiles = [],
			navigation = {}

		// iterate over all items to filter html files, exclude assets and other stuff
		keys.forEach((file) => {
			var data = files[file],
				regex = `.*\.(${ext})`

			if (file.match(new RegExp(regex, 'i')) !== null) {
				htmlFiles.push(file)
			}
		})

		// process the files
		each(Object.keys(htmlFiles), (file, next) => {
			convert(htmlFiles[file], next)
		}, (err) => {
			var navKeys = Object.keys(navigation)
			// sort the entries in the navigation
			navKeys.forEach((navItem) => {
				navigation[navItem].sort((a, b) => {
					if (a.order < b.order)
						return -1;
					if (a.order > b.order)
						return 1;
					return 0;
				})
			})
			//console.log(navigation)
			if (navKeys.length > 0) {
				// add navigation to the files
				keys.forEach((file) => {
					files[file].navigation = navigation
						//console.log(files)
				})
			}
			done(err)
		})


		function convert(file, next) {
			var navItem = '',
				url = file
			if(logging) {
				console.log('>', file)
			}

			if (files[file].hasOwnProperty('nav')) {
				navItem = files[file].nav.split('=')

				if (navItem.length < 2) {
					navItem = [navItem, 0]
				}

				if(logging) {
					console.log('  > nav found', navItem[0])
				}
					// create nav when not exists
				if (!navigation[navItem[0]]) {
					if(logging) {
						console.log('  > create nav', navItem[0])
					}
					navigation[navItem[0]] = []
				}
				// remove the index from the end
				if(url.indexOf('index') > 0) {
					url = url.substring(0, url.indexOf('index'))
				}
				// add to navigation
				navigation[navItem[0]].push({
					title: files[file].title,
					file: url,
					order: navItem[1]
				})
			}
			// next
			next()
		}
	}
}