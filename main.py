# imports
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.document_loaders import TextLoader
from langchain.document_loaders import PyPDFLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.prompts import PromptTemplate
import panel as pn
import os

# getting api key
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']

# setting up widgets
file_input = pn.widgets.FileInput(width=300)

prompt = pn.widgets.TextEditor(
    value="",
    placeholder="Enter your questions here...",
    height=160,
    toolbar=False
)

run_button = pn.widgets.Button(
    name="Run"
)

select_chunks = pn.widgets.IntSlider(
    name="Number of relevant chunks",
    start=1,
    end=5,
    step=1,
    value=2
)

select_chain_type = pn.widgets.RadioButtonGroup(
    name='Chain type',
    options=[
        'stuff',
        'map_reduce',
        'refine',
        'map_rerank'
    ]
)

widgets = pn.Row(
    pn.Column(prompt, run_button, margin=5),
    pn.Card(
        'Chain type:',
        pn.Column(select_chain_type, select_chunks),
        title='Advanced settings', margin=10
    ), width=400
)

conversations = []


def qa(file, query: str, chain_type: str, k: int):
    # load document
    loader = PyPDFLoader(file)
    documents = loader.load()
    # split into chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    texts = text_splitter.split_documents(documents)
    # select embeddings to use
    embeddings = OpenAIEmbeddings()
    # create the vectorstore to use as the index
    db = Chroma.from_documents(texts, embeddings)
    # expose this index in a retriever interface
    retriever = db.as_retriever(search_type='similarity', search_kwargs={'k': k})
    prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the 
    answer, just say that you don't know, don't try to make up an answer.
    
    {context}
    
    Question: {question}
    Answer:"""
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=['context', 'question']
    )
    chain_type_kwargs = {'prompt': PROMPT}
    qa = RetrievalQA.from_chain_type(
        llm=OpenAI(model_name='gpt-3.5-turbo'), chain_type=chain_type, retriever=retriever, return_source_documents=True,
        chain_type_kwargs=chain_type_kwargs)
    result = qa({'query': query})
    print(result['result'])
    return result


def qa_result(_):
    if file_input.value is not None:
        file_input.save('temp.pdf')

        if prompt.value:
            result = qa('temp.pdf',
                        query=prompt.value,
                        chain_type=select_chain_type.value,
                        k=select_chunks.value)
            conversations.extend([
                pn.Row(
                    pn.panel("\U0001F60A", width=10),
                    prompt.value,
                    width=600
                ),
                pn.Row(
                    pn.panel("\U0001F916", width=10),
                    pn.Column(
                        result['result'],
                        'Relevant source text:',
                        pn.pane.Markdown(
                            '\n--------------------------------------------------------------------\n'.join(
                                doc.page_content for doc in result["source_documents"]))
                    )
                )
            ])

    return pn.Column(*conversations, margin=15, width=575, min_height=400)


qa_interactive = pn.panel(
    pn.bind(qa_result, run_button),
    loading_indicator=True
)

output = pn.WidgetBox('*Output will show up here:*', qa_interactive, width=630, scroll=True)

pn.Column(
    pn.pane.Markdown("""
    Step 1: Upload a PDF file \n 
    Step 2: Enter your OpenAI API key. It will not be stored permanently.
    Step 3: Type your question at the bottom and click "Run" \n
    """),
    pn.Column(file_input, OPENAI_API_KEY, output, widgets)
).servable()
