import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function cllLLm(res, context, question) {
    const stream = await openai.chat.completions.create({
        model: "gpt-5.5",
        stream: true,
        messages: [
            {
                role: "system",
                content: `You are a helpful AI assistant. 
                get the relevant information from the provided context to answer the user's question. 
                Answer should be only within the provided context.
                Rephrase the answer but keep within the boundary of provided context.`
            },
            {
                role: "system",
                content: context,
            },
            {
                role: "user",
                content: question,
            },
        ],
    });

    for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) {
            res.write(`data: ${token}\n\n`);
        }
    }
}
