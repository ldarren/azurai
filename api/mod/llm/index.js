const { Configuration, OpenAIApi } = require('openai')
const pico = require('pico-common')

function convertHistory2Messages(history, approx_max_tokens=2000) {
	let tokenCount = approx_max_tokens * 4
	const index = history.findLastIndex(m => {
		tokenCount -= m.content.length
		return tokenCount <= 0
	})

	return -1 === index ? history : history.slice(index)
}

function LLM({model, apiKey}, {merge, prompt}){
	this.model = model
	const configuration = new Configuration({
		apiKey,
	})
	this.openai = new OpenAIApi(configuration)
	this.mergeTemplate = merge
	this.promptTemplate = prompt
}

LLM.prototype = {
	async chat(history, overrides = {}){
		console.log('#### chat:req ######', JSON.stringify(history))

		// STEP 1: Generate an optimized keyword search query based on the chat history and the last question
		const res = await this.openai.createChatCompletion(Object.assign({
			model: this.model,
			messages: convertHistory2Messages(history),
			temperature: 0.3,
			max_tokens: 512,
			n: 1,
			// stop: ['\n']
		}, overrides))
		console.log('#### chat:res.data ######', JSON.stringify(res.data))

		return res
	},
	async ask(prompt, overrides = {}){
		console.log('#### ask:req ######', JSON.stringify(prompt))

		// STEP 1: Generate an optimized keyword search query based on the chat history and the last question
		const res = await this.openai.createCompletion(Object.assign({
			model: 'text-davinci-003',
			prompt,
			temperature: 0.3,
			max_tokens: 512,
			n: 1,
			// stop: ['\n']
		}, overrides))
		console.log('#### ask:res.data ######', JSON.stringify(res.data))

		return res
	},
	summarize(question, history){
console.log('######merge template######', this.mergeTemplate)
		const prompt = this.mergeTemplate
			.replace("${question}", question)
			.replace("${history}", history)
		return this.ask(prompt, {
			model: "text-davinci-003",
			prompt,
			max_tokens: 256,
			temperature: 0.7,
			stream: false,
			stop: ["Observation:"],
		})
	},
	async rag(ctx, question, retrievals, model = 'text-davinci-003'){
		// construct the prompt, with our question and the retrievals that the chain can use
console.log('######prompt template######', this.promptTemplate)
		let prompt = this.promptTemplate
			.replace("${question}", question)
			.replace(
				"${retrievals}",
				retrievals.map(retrieval => `${retrieval.name}: ${retrieval.description}`).join("\n")
			)
			.replace("${retrievalNames}", retrievals.map(r => r.name))


		// allow the LLM to iterate until it finds a final answer
		while (true) {
			const res = await this.ask(prompt, {
				model,
				prompt,
				max_tokens: 256,
				temperature: 0.7,
				stream: false,
				stop: ["Observation:"],
			})

			// add this to the prompt
			const text = res.data.choices[0].text
			prompt += text

			const action = text.match(/Action: (.*)/)?.[1]
			if (action) {
				// execute the action specified by the LLMs
				const query = text.match(/Action Input: "?(.*)"?/)?.[1]
				const observation = {}
console.log('#####Observation start:', query)
				await ctx.next(null, `GET/${action.trim()}`, {body: {query}, output: observation})
				prompt += `Observation: ${observation.s}\n`
console.log('#####Observation end:', prompt)
			} else {
				return {usage: res.usage, text: text.match(/Final Answer: (.*)/)?.[1]}
			}
		}
	},
	async embed(input, model = 'text-embedding-ada-002'){
		const res = await this.openai.createEmbedding({ model, input })
		return res.data.data[0].embedding
	}
}

module.exports = {
	setup(cfg, rsc, paths){      
		return new LLM(cfg, rsc.llm)
	},
	async chat(llm, history, overrides, output){
		const res = await llm.chat(history, overrides)
		const completion = res.data

		Object.assign(output, completion)
		return this.next()
	},
	async ask(llm, question, overrides, output){
		const res = await llm.ask(question, overrides)
		const completion = res.data

		Object.assign(output, {usage: res.usage, data_points: '', answer: completion.choices[0].text, thoughts: 'Searched for:<br>{q}<br><br>Prompt:<br>'})
		return this.next()
	},
	async embed(llm, query, output){
		const res = await llm.embed(query)
		output.length = 0
		output.push(...res)
		return this.next()
	},
	async rag(llm, question, history, retrievals, output){
		let q = question
		if (history.length > 0) {
			const res = await llm.summarize(question, history)
			q = res.data.choices[0].text
		}
		const res = await llm.rag(this, q, retrievals)

		Object.assign(output, {usage: res.usage, data_points: '', answer: res.text, thoughts: 'Searched for:<br>{q}<br><br>Prompt:<br>'})
		return this.next()
	}
}
