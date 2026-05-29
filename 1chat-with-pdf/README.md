### Folder Structure chat with PDF

project/
│
├── client/                 # React UI
│
├── server/
│   ├── agents/
│   │    └── chatAgent.js
│   │
│   ├── routes/
│   │    ├── upload.js
│   │    └── chat.js
│   │
│   ├── services/
│   │    ├── embeddingService.js
│   │    ├── vectorStore.js
│   │    └── pdfService.js
│   │
│   ├── db/
│   │    └── chroma/
│   │
│   └── app.js
│
└── docker-compose.yml


### Core Flow

## 1 Upload PDF
Frontend
 ↓
POST /upload
 ↓
Parse PDF
 ↓
Chunking
 ↓
Embeddings
 ↓
Store in ChromaDB


## 2 Ask Question
Frontend
 ↓
POST /chat
 ↓
Embedding of question
 ↓
Similarity search
 ↓
Top chunks retrieved
 ↓
LLM answer generation
 ↓
Stream response


### Installation Backend

```
npm install express openai chromadb pdfjs-dist multer dotenv cors
```

### POST METHOD

```
curl --request POST \
  --url http://localhost:3000/upload \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: Requestly/1.0' \
  --data '
{
  "email": "yash@yopmail.com",
  "id": 1
}
'
```

### POST METHOD

```
curl --request POST \
  --url http://localhost:3000/upload \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: Requestly/1.0' \
  --data '
{
  "email": "yash@yopmail.com",
  "id": 1
}
'
```

### GET QUERY SEARCH
```
curl --request POST \
  --url http://localhost:3000/chat \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: Requestly/1.0' \
  --data @- <<EOF
{
  "question": "is this exist in document 'Morbi elit nunc'?"
}
EOF
```