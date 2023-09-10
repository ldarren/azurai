const merge = require('prompt/merge.tpl')
const prompt = require('prompt/index.tpl')

return {
	rsc: {
		llm: {
			merge, prompt
		},
		agents: {
			params_spec:{
				"type": "obj",
				"spec": {
					"model": "str",
					"functions": {
						"type": "arr",
						"spec": {
							"type": "obj",
							"spec": {
								"name": {
									"type": "str",
									"required": 1,
									"lt": 65
								},
								"description": "str",
								"parameters": {
									"type": "obj",
									"spec": {
										"_": {
											"type": "obj",
											"spec": {
												"type": "str",
												"description": "str",
												"enum": {
													"type": "arr",
													"spec": "str"
												}
											}
										}
									}
								},
								"required": {
									"type": "arr",
									"spec": "str"
								}
							}
						}
					},
					"function_call": "obj",
					"temperature": {
						"type": "number",
						"value": 0,
						"gt": -2.00001,
						"lt": 2.00001
					},
					"top_p": {
						"type": "number",
						"value": 0,
						"gt": -2.00001,
						"lt": 2.00001
					},
					"n": {
						"type": "number",
						"value": 1
					},
					"stream": "boo",
					"stop": {
						"type": "arr",
						"spec": "str"
					},
					"max_tokens": "num",
					"presence_penalty":  {
						"type": "num",
						"value": 0,
						"gt": -2.00001,
						"lt": 2.00001
					},
					"frequency_penalty":  {
						"type": "num",
						"value": 0,
						"gt": -2.00001,
						"lt": 2.00001
					},
					"logit_bias": {
						"type": "obj",
						"spec": {
							"_": {
								"type": "num",
								"value": 0,
								"gt": -100.00001,
								"lt": 100.00001
							}
						}
					}
				}
			}
		},
		embed: {
			ignores:['package-lock.json','node_modules','dist','build']
		}
	}
}
