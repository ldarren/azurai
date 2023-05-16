const { Configuration, OpenAIApi } = require('openai')
const promptTemplate = require('./prompt.txt')
const mergeTemplate = require('./merge.txt')
//const follow_up_questions_prompt_content = require('./follow_up_questions_prompt_content.txt')

function convertHistory2Messages(history, approx_max_tokens=1000) {
	const messages = [{role: 'system', content: 'if not mentioned otherwise, all output format should be in html'}]
	history.forEach(h => {
		if (h['user']) messages.push({
		role: 'user',
		content: h['user']
		})
		if (h['bot']) messages.push({
		role: 'assistant',
		content: h['bot']
		})
	})
	let tokenCount = approx_max_tokens * 4
	const index = messages.findLastIndex(m => {
		tokenCount -= m.content.length
		return tokenCount <= 0
	})

	return -1 === index ? messages : messages.slice(index)
}

function LLM({model, apiKey}){
	this.model = model
	const configuration = new Configuration({
		apiKey,
	})
	this.openai = new OpenAIApi(configuration)
}

LLM.prototype = {
	async simpleChat(history, overrides = {}){
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
		console.log('#### chat:res.data ######', JSON.stringify(res))

		return res
	},
	async simpleAsk(prompt, overrides = {}){
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
		console.log('#### ask:res.data ######', JSON.stringify(res))

		return res
	},
	mergeHistory(question, history){
		const prompt = mergeTemplate
			.replace("${question}", question)
			.replace("${history}", history)
		return this.simpleAsk(prompt, {
			model: "text-davinci-003",
			prompt,
			max_tokens: 256,
			temperature: 0.7,
			stream: false,
			stop: ["Observation:"],
		})
	},
	async answerQuestion(question, tools){
		// construct the prompt, with our question and the tools that the chain can use
		const toolNames = Object.keys(tools)
		let prompt = promptTemplate
			.replace("${question}", question)
			.replace(
				"${tools}",
				toolNames.map(toolname => `${toolname}: ${tools[toolname].description}`).join("\n")
			)
			.replace("${toolNames}", toolNames)


		// allow the LLM to iterate until it finds a final answer
		while (true) {
			const res = await this.simpleAsk(prompt, {
				model: "text-davinci-003",
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
				const actionInput = text.match(/Action Input: "?(.*)"?/)?.[1]
				const result = await tools[action.trim()].execute(actionInput)
				prompt += `Observation: ${result}\n`
			} else {
				return text.match(/Final Answer: (.*)/)?.[1]
			}
		}
	}
}

module.exports = {
	setup(host, cfg, rsc, paths){      
		return new LLM(cfg)
	},
	async chat(llm, history, overrides, output){
		const res = await llm.simpleChat(history, overrides)
		const completion = res.data

		Object.assign(output, {usage: res.usage, data_points: '', answer: completion.choices[0].message.content, thoughts: 'Searched for:<br>{q}<br><br>Prompt:<br>'})
		return this.next()
	},
	async ask(llm, question, overrides, output){
		const res = await llm.simpleAsk(question, overrides)
		const completion = res.data

		Object.assign(output, {usage: res.usage, data_points: '', answer: completion.choices[0].text, thoughts: 'Searched for:<br>{q}<br><br>Prompt:<br>'})
		return this.next()
	},
	async rag(llm, question, history, output){
		let q = question
		if (history.length > 0) {
			const res = await llm.mergeHistory(question, history)
			q = res.data.choices[0].text
		}
		const res = await llm.answerQuestion(q)
		const completion = res.data

		Object.assign(output, {usage: res.usage, data_points: '', answer: completion.choices[0].text, thoughts: 'Searched for:<br>{q}<br><br>Prompt:<br>'})
		return this.next()
	},
}
