#!/usr/bin/env node
const fs = require('node:fs')
const { HierarchicalNSW } = require('hnswlib-node')
const { Configuration, OpenAIApi } = require('openai')
const {mod} = require('../env.json')

const model = 'text-embedding-ada-002'
const numDimensions = 1536; // the length of data point vector that will be indexed.
const maxElements = 100; // the maximum number of data points.
const inputName = process.argv[2] || "Northwind_Health_Plus_Benefits_Details.pdf"
const dbName = 'db.json'
const vectorName = 'vector.hnsw'

async function main(db){
	const keys = Object.keys(db)
	const label = Array.isArray(keys) && keys.length ? parseInt(keys.at(-1)) + 1 : 0
	/**
	 * Setup openai
	 */
  const configuration = new Configuration({
    apiKey: mod.llm['api-key']
  })
  const openai = new OpenAIApi(configuration)
  
	/**
	 * Setup hnsw
	 */
  const index = new HierarchicalNSW('l2', numDimensions);
	if (label) index.readIndexSync(vectorName)
  else index.initIndex(maxElements);

	/**
	 * Setup pdf reader
	 */
  const {PdfReader} = await import('pdfreader')
  let content = ''

	/**
	 * Setup tiktoken
	 */
	const { encoding_for_model } = await import("@dqbd/tiktoken")
	const enc = encoding_for_model(model)

	return new Promise((resolve) => {
		new PdfReader().parseFileItems(inputName, async (err, item) => {
			if (err) {
				console.error("error:", err);
			}else if (!item){ 
				for(let i = label; content.length; i++) {
					const input = content.substring(0, 6000)
					content = content.substring(6000)

	console.log(i, input)
					
					const res = await openai.createEmbedding({ model, input })
					const embedding = res.data.data[0].embedding
	console.log(embedding)
					
					index.addPoint(embedding, i)
					db[i] = {f:inputName,s:input}
				}
				
				// saving index.
				index.writeIndexSync(vectorName)
				resolve()
			}else if (item.text) {
				content += item.text
			}
		})
	})
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
	fs.writeFile(dbName, JSON.stringify(db), err => {
		if (err) return console.error(err)
		console.log('Save!')
	})
})
