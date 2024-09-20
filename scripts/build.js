// Import the fs-extra module for file system operations
const fse = require('fs-extra')

const path = require('path')

// Import the promisify function from the util module to convert callback-based functions to promise-based
const { promisify } = require('util')

// Convert the ejs.renderFile function to a promise-based function
const ejsRenderFile = promisify(require('ejs').renderFile)

// Convert the glob function to a promise-based function
const globP = promisify(require('glob'))

// Import the site configuration
const config = require('../site.config')

const srcPath = './src'

const destPath = './public'

fse.emptyDirSync(destPath)

// Copy the assets folder from source to destination
fse.copy(`${srcPath}/assets`, `${destPath}/assets`)

// Find all .ejs files in the src/pages directory
globP('**/*.ejs', { cwd: `${srcPath}/pages` })
    .then((files) => {
        // Iterate through each found file
        files.forEach((file) => {
            // Parse the file path to get file information
            const fileData = path.parse(file)
            // Construct the destination path for the file
            const destPath = path.join(destPath, fileData.dir)

            // Create the destination directory
            fse.mkdirs(destPath)
                .then(() => {
                    // Render the page template with the site configuration
                    return ejsRenderFile(
                        `${srcPath}/pages/${file}`, Object.assign({}, config)
                    )
                })
                .then((pageContents) => {
                    // Render the layout template with the site configuration and page contents
                    return ejsRenderFile(
                        `${srcPath}/layout.ejs`, Object.assign({}, config, { body: pageContents })
                    )
                })
                .then((layoutContent) => {
                    // Write the rendered HTML to the destination file
                    fse.writeFile(`${destPath}/${fileData.name}.html`, layoutContent)
                })
                .catch((err) => {
                    // Log any errors that occur during the process
                    console.error(err)
                })
        })
    })
    .catch((err) => {
        // Log any errors that occur during the file search
        console.error(err)
    })