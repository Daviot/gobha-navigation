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
		if (logging) {
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

				// add breadcrumb property
				let url = file
				//console.log(url)
				files[file].breadcrumb = []
				if (url.indexOf('index') > 0) {
					url = url.substring(0, url.indexOf('index'))
					let splitted = url.split('/')
					let breadcrumbNav = []
					for (let i = 0, len = splitted.length; i < len; i++) {
						let item = splitted[i]
						// console.log('length', breadcrumbNav.length)
						if (item != '') {
							if (breadcrumbNav.length == 0) {
								breadcrumbNav.push(`${item}/`)
							} else {
								breadcrumbNav.push(`${breadcrumbNav[breadcrumbNav.length - 1]}${item}/`)
							}
						}
						// console.log(i, breadcrumbNav[i])
					}
					// console.log(splitted)
					files[file].breadcrumb = breadcrumbNav
				}
				// console.log('breadcrumb', files[file].breadcrumb)
				// console.log('-------------')
			}
		})

		// process the files
		each(Object.keys(htmlFiles), (file, next) => {
			convert(htmlFiles[file], next)
		}, (err) => {
			var navKeys = Object.keys(navigation)
			// sort the entries in the navigation
			navKeys.forEach((navGroup) => {
				navigation[navGroup].sort((a, b) => {
					if (a.order < b.order)
						return -1;
					if (a.order > b.order)
						return 1;
					return 0;
				})
			})
			// console.log(navigation)
			// console.log(htmlFiles)
			// add navigation to the files
			htmlFiles.forEach((file) => {
				// deep clone
				files[file].navigation = JSON.parse(JSON.stringify(navigation))

				// set active nodes
				console.log(' ')
				console.log('---------------------------------')
				console.log(file)
				console.log(files[file].breadcrumb)
				navKeys.forEach((navGroup) => {
					
				 	for(let i = 0, len = files[file].navigation[navGroup].length; i < len; i++) {
						let reduced = files[file].breadcrumb.filter((crumb) => {
							let equals = crumb == files[file].navigation[navGroup][i].file
							//console.log(equals ? '=' : '!', crumb, files[file].navigation[navGroup][i].file)
							return equals
						})
						console.log(reduced.length)
				 		if(reduced.length > 0)
				 			files[file].navigation[navGroup][i].active = true
				 	}
				})
				
			})
			
			htmlFiles.forEach((file) => {
				console.log(files[file].navigation)
				
			})
			done(err)
		})


		function convert(file, next) {
			var navItem = '',
				url = file
			if (logging) {
				console.log('>', file)
				//console.log(files[file])
			}

			if (files[file].hasOwnProperty('nav')) {
				navItem = files[file].nav.split('=')

				if (navItem.length < 2) {
					navItem = [navItem, 0]
				}

				if (logging) {
					console.log('  > nav found', navItem[0])
				}
				// create nav when not exists
				if (!navigation[navItem[0]]) {
					if (logging) {
						console.log('  > create nav', navItem[0])
					}
					navigation[navItem[0]] = []
				}
				// remove the index from the end
				if (url.indexOf('index') > 0) {
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