#!/usr/bin/env node
const fs = require('node:fs')
const { HierarchicalNSW } = require('hnswlib-node')
const { Configuration, OpenAIApi } = require('openai')
const {mod} = require('../env.json')

const model = 'text-embedding-ada-002'
const numDimensions = 1536; // the length of data point vector that will be indexed.
const input = process.argv[2] || "important to note that there are some exceptions to the continuity of care rule"
const dbName = 'db.json'
const vectorName = 'vector.hnsw'

// loading index.
const index = new HierarchicalNSW('l2', numDimensions)
index.readIndexSync(vectorName)

async function main(db){
	/**
	 * Setup openai
	 */
  const configuration = new Configuration({
    apiKey: mod.llm['api-key']
  })
  const openai = new OpenAIApi(configuration)

	const res = await openai.createEmbedding({ model, input })
	const embedding = res.data.data[0].embedding
	// searching k-nearest neighbor data points.
	const numNeighbors = 3;
	const result = index.searchKnn(embedding, numNeighbors);
console.log('###result:', embedding, result)
	console.table(result);
	console.log('query:', input)
	console.log('snippet:', db[result.neighbors[0]])
}

fs.readFile(dbName, {flag: 'a+'}, async (err, json) => {
	if (err) return console.error(err)
	let db
	try {
		db = JSON.parse(json)	
	}catch(ex){
		db = {}
	}
	await main(db)
})
