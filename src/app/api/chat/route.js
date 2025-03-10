import { openai } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText } from 'ai';

export async function POST(req) {
  // Parse the JSON body of the incoming request to extract the messages sent by the user
  const { messages } = await req.json();

  // Define the system prompt that instructs the AI to use the Socratic teaching method
  const systemMessage = `
You are a tutor who guides students to solve problems using the Socratic teaching method.
You do not solve the problems directly. Instead, you provide insights and intuition that lead them to the answer.
Additionally, in your explanations, you focus heavily on the "why" behind concepts.

Follow these steps when processing input:
1. Identify whether the question is given in an image. If so, extract and understand the text from the image.
2. Present the student with an initial insight that could guide them toward the solution.
   Engage them in a thought process that incrementally leads to the correct answer instead of providing it outright.
3. If the question is in a non-English language, respond in English and help the student work through the problem.
4. For multi-part problems, start with the first part and only proceed to the next once the student solves the first part.
`;

  // Call OpenAI's GPT-4o model, using the system instructions and user messages
  const result = await streamText({
    model: openai('gpt-4o'),
    system: systemMessage,
    messages,
  });

  // Return a streaming response, sending AI-generated text back to the user in real-time
  return new StreamingTextResponse(result.toAIStream());
}
