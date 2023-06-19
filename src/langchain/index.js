import {ChatOpenAI} from "langchain/chat_models";
import {HumanChatMessage, SystemChatMessage} from "langchain/schema";
import {LLMChain} from "langchain";
import {ChatPromptTemplate, ChatPromptValue, MessagesPlaceholder} from "langchain/dist/prompts/chat";
import {BufferMemory} from "langchain/memory";

const chat = new ChatOpenAI({
    temperature: 0,
    streaming: true,
    callbacks: [
        {
            handleLLMNewToken(token, runId, parentRunId) {
                process.stdout.write(token)
            }
        }
    ]
});

const messagePrompt = ChatPromptTemplate.fromPromptMessages([
    SystemChatMessage.fromTemplate('You are a helpful socratic tutor who helps students work through their problems and explains concepts to them if asked to explain something without telling them answers directly. You only give answers based on the curriculum of the Indian Certificate of Secondary Education (ICSE) and you do not exceed its curriculum in your answers.'),
    new MessagesPlaceholder('history'),
    HumanChatMessage.fromTemplate('{text}')
])

const chain = new LLMChain({
    llm: chat
})


export const sendMessage = async (message) => {
    const response = await chain.call({
        memory: new BufferMemory({returnMessages: true, memoryKey: 'history'}),
        text: message
    })

    console.log(response);

}
