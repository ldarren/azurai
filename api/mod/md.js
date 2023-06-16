const fs = require('node:fs/promises')
const path = require('node:path')
const pdf2md = require('@opendocsg/pdf2md')
let mdast

module.exports = {
	async setup(){
		({default:mdast} = await import('markdown-ast'))
	},
	async parse(mime, fname, output, key = 'md'){
		const fbuf = await fs.readFile(fname, {flag: 'a+'})
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

	async split(md, output){
		const ast = mdast(md)

		let searchSection = false
		let section = ''
		for (let pc of ast){
			if (searchSection && pc.type === 'title'){
				output.push(section)
				section = ''
				searchSection = false
			}
			switch(pc.type){
			case 'title':
				section += `\n${'#'.repeat(pc.rank)} ${pc.block[0].text}\n`
				break
			case 'text':
				section += pc.text
				searchSection = true
				break
			case 'break':
				section += '\n'
				break
			}
		}
		
		return this.next()
	}
}
