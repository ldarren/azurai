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
