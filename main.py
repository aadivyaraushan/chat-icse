from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma, VectorStore
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import PyPDFDirectoryLoader
from langchain.memory import ConversationBufferMemory


loader = PyPDFDirectoryLoader('./sources')
# loader becomes function to load temp.pdf
documents = loader.load()
# loader.load() basically means "load the file passed as parameter to PyPDFLoader" (which here is temp.pdf)
# you can't directly do pdf.load() because files in python don't have a function for loading as langchain.schema files
# langchain.schema.Document files are special because they have extra features useful for NLP, like metadata about files

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
# chunk here represents a segment of text from the document
# chunk size here represents number of characters
# chunk_overlap represents the number of characters to overlap between adjacent chunks i.e. how much context to share
# between chunks
# the document is split into chunks to make it easier to analyse
# text_splitter basically becomes a function that splits a document into chunks of 1000 characters with no overlap
documents_chunks = text_splitter.split_documents(documents)  # this just splits the document
# documents now stores chunks of the document

vector_store_database = Chroma.from_documents(documents_chunks, OpenAIEmbeddings())
# OpenAIEmbeddings() creates a class that implements the embed method
# the embed method converts chunks of the document (documents) into vector database items
# by making them into vector database items, you can more easily search over the items



memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
# memory in langchain basically means the ability to remember things that happened earlier in a conversation
# ConversationBufferMemory stores all available messages in the conversation as context

answer_question = ConversationalRetrievalChain.from_llm(ChatOpenAI(temperature=0, model_name='gpt-3.5-turbo',
                                                                   max_tokens=1000),
                                                        vector_store_database.as_retriever(search_kwargs={"k": 1}),
                                                        max_tokens_limit=4097,
                                                        memory=memory)
# ConversationalRetrievalChain is a retrieval system that retrieves information from vector databases for a certain
# query based on a ton of filters like importance, context-aware filtering, etc
# therefore, it can be used for question answering based on a vector
# since it's context aware and relies on context, it's useful for "Chat"
# here question_answering basically becomes a function to answer questions given

while True:
    query = input("What's your question? (enter q to exit)\n")

    if query == 'q':
        break

    result = answer_question({"question": query})

    print("\nAnswer: {}".format(result['answer']))
