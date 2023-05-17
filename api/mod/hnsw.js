const fs = require('node:fs')
const { HierarchicalNSW } = require('hnswlib-node')
const { Configuration, OpenAIApi } = require('openai')

function HNSW(cfg){
	this.description = cfg.desc
	fs.readFile(this.jsondb, {flag: 'a+'}, async (err, json) => {
		if (err) return console.error(err)
		try {
			this.db = JSON.parse(json)	
		}catch(ex){
			this.db = {}
		}
	})

	// loading index.
	const index = new HierarchicalNSW('l2', numDimensions)
	index.readIndexSync(cfg.vectordb)
}

HNSW.prototype = {
	execute(embedding){
		// searching k-nearest neighbor data points.
		const numNeighbors = 3;
		const result = index.searchKnn(embedding, numNeighbors);
		console.log('###result:', embedding, result)
		console.table(result);
		console.log('query:', input)
		console.log('snippet:', db[result.neighbors[0]])
		return result
	}
}

module.exports = {
	setup(host, cfg, rsc, paths){
		return new HNSW(cfg)
	}
}

