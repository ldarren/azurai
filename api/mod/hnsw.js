const fs = require('node:fs/promises')
const { HierarchicalNSW } = require('hnswlib-node')
const { Configuration, OpenAIApi } = require('openai')

function HNSW(db, index, desc){
	this.db = db
	this.index = index
	this.description = desc
}

HNSW.prototype = {
	execute(embedding, neighbors = 3){
		// searching k-nearest neighbor data points.
		const numNeighbors = 3;
		const result = this.index.searchKnn(embedding, neighbors);
		console.log('###result:', embedding, result)
		console.table(result);
		console.log('snippet:', this.db[result.neighbors[0]])
		return result
	}
}

async function loadHNSW(cfg){
	// loading db
	const json = await fs.readFile(cfg.jsondb, {flag: 'a+'})
	const db = json ? JSON.parse(json) : {}

	// loading index.
	const index = new HierarchicalNSW('l2', cfg.dimensions)
	index.readIndexSync(cfg.vectordb)

	return new HNSW(db, index, cfg.desc)
}

module.exports = {
	setup(host, cfg, rsc, paths){
		return loadHNSW(cfg)
	}
}

