const fs = require('node:fs/promises')
const { HierarchicalNSW } = require('hnswlib-node')

function HNSW(cfg, db, index, desc){
	this.cfg = cfg
	this.db = db
	this.index = index
	this.description = desc
	this.label = Math.max(0, ...Object.keys(db))
}

HNSW.prototype = {
	execute(embedding, neighbors = 3){
		// searching k-nearest neighbor data points.
		const result = this.index.searchKnn(embedding, neighbors);
		console.log('###result:', embedding, result)
		console.table(result);
		const snippet = this.db[result.neighbors[0]]
		console.log('snippet:', snippet)
		return snippet
	},
	async insert(fname, snippet, embedding){
		const i = ++this.label
		this.index.addPoint(embedding, i)
		this.db[i] = {f: fname, s: snippet}
		await this.index.writeIndex(this.cfg.vectordb) 
		await fs.writeFile(this.cfg.jsondb, JSON.stringify(this.db))
	}
}

async function loadHNSW(cfg){
	// loading db
	const json = await fs.readFile(cfg.jsondb, {flag: 'a+'})
	const db = json.length ? JSON.parse(json) : {}

	// loading index.
	const index = new HierarchicalNSW(cfg.space, cfg.dimensions)
	if (json.length) index.readIndexSync(cfg.vectordb)
  else index.initIndex(cfg.maxElements)

	return new HNSW(cfg, db, index, cfg.desc)
}

module.exports = {
	setup(cfg, rsc, paths){
		return loadHNSW(cfg)
	},
	execute(hnsw, embedding, output){
		const res = hnsw.execute(embedding)
		Object.assign(output, res)
		return this.next()
	},
	async insert(hnsw, fname, snippet, embedding){
		const res = await hnsw.insert(fname, snippet, embedding)
		return this.next()
	}
}

