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
			ignores:['package-lock.json','node_modules','dist','build','rest'],
			filePrompts: {
				system:"You are acting as a {contentType} documentation expert for a project called {projectName}.\nBelow is the {contentType} from a file located at \`{path}\`. Do not say \"this file is a part of the {projectName} project\".",
				user:
"Write a detailed technical explanation of what this code does. \n\
Focus on the high-level purpose of the code and how it may be used in the larger project.\n\
Include code examples where appropriate. Keep you response between 100 and 300 words. \n\
DO NOT RETURN MORE THAN 300 WORDS.\n\
Output should be in markdown format.\n\
Do not just list the methods and classes in this file.\
\
{contentType}:\
{text}"
			},
			questionPrompts: {
				user:
"You are acting as a {contentType} documentation expert for a project called {projectName}.\
Below is the {contentType} from a file located at \`{path}\`. \
What are 3 questions that a {targetAudience} might have about this {contentType}? \
Answer each question in 1-2 sentences. Output should be in markdown format.\
\
{contentType}:\
{text}\
\
Questions and Answers:"
			},
			folderPrompts: {
				system:
"You are acting as a {contentType} documentation expert for a project called {projectName}.\
You are currently documenting the folder located at \`{path}\`. \
\
Do not say \"this file is a part of the {projectName} project\".\
Do not just list the files and folders.",
				user:
"Below is a list of the files in this folder and a summary of the contents of each file:\
\
{listFiles}\
\
And here is a list of the subfolders in this folder and a summary of the contents of each subfolder:\
\
{listFolders}\
\
Write a technical explanation of what the code in this file does\n\
and how it might fit into the larger project or work with other parts of the project.\n\
Give examples of how this code might be used. Include code examples where appropriate.\n\
Be concise. Include any information that may be relevant to a developer who is curious about this code.\n\
Keep you response under 400 words. Output should be in markdown format.\n\
Do not just list the files and folders in this folder.'"
			}
		},
		plugins: {
			kb_search: {
				name: 'kb_search',
				description: 'search internal knowledge base',
				parameters: {
					type: 'object',
					properties: {
						q: {
							type: 'string',
							description: 'query string'
						}
					},
					required: ['q']
				}
			}
		}
	}
}
