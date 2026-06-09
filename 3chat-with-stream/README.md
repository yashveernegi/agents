# Chat with website content

website-chatbot/
│
├── package.json
├── index.js
│
├── config/
│   └── chroma.js
│
├── services/
│   ├── embedding.js
│   ├── scraper.js
│   ├── chunker.js
│   ├── indexWebsite.js
│   └── search.js
│
└── routes/
    └── chat.js



//sample request
```
curl --location 'localhost:3000/chat' \
--header 'Content-Type: application/json' \
--data '{"question":"indian history"}'
```