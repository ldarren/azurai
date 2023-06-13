const fs = require('node:fs')
const path = require('node:path')
const pdf2md = require('@opendocsg/pdf2md')

module.exports = {
	setup(){
	},
	async parse(mime, fbuf, output, key = 'md'){
		console.log('####', output)
		let md
		switch(mime){
		case 'application/pdf':
			md = await pdf2md(fbuf)
			break
		case 'text/html':
		case 'text/markdown':
		case 'text/plain':
		default:
			break
		}
		Object.assign(output, {[key]: md})
		return this.next()
	},

	async split(){
		return this.next()
	}
}
