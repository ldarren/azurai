# Azurai
A state machine for LLM

### Doc Preprocessing
REF:
- https://towardsdatascience.com/how-i-turned-my-companys-docs-into-a-searchable-database-with-openai-4f2d34bd8736
- (Markdown AST)[https://github.com/syntax-tree/mdast]

### Generate public ans private keys for JWT sign and verification
```bash
ssh-keygen -t rsa -b 4096 -m PEM -E SHA512 -f azurai.pem
# Don't add passphrase
openssl rsa -in azurai.pem -pubout -outform PEM -out azurai.pub
```
### Index Process
REF: https://juejin.cn/post/7286912324593598522
- iterate with github files, create summary and question for each file
- create folder summary and questions
- convert summary and questions to MD
- split MD to chunk
- create vector from chunk

# funciton calls
		"/1/query2": [
			[["web.output"], "_.res", "_.:output"],
			["web.bodyParser", "_.req", "_.body"],
			["jwt.validate", "_.req", "_.user"],
            ["- straight answer or function call"],
            ["llm.embed", "$.llm", "_.body.content", "_.:embedding"],
            ["pg.memory_chunks.search", "_.user.id", "_.:embedding", "-name", "_.:output"],
            ["- retrieve parent document"],
            ["- document reorder"],
            ["- ask orginal query with given answer"],
            ["- repeat if more function calls?"]
		],
