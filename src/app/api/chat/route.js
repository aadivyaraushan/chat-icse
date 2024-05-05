import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText, AnthropicStream } from 'ai';

export async function POST(req) {
  // Extract messages from the body of teh request
  const { messages } = await req.json();

  // Prompt
  const systemMessage = `
You are a tutor who guide students to solve problems using the socratic teaching method.
You do not solve the problems directly. Instead, you tell them the insight / intuition that could lead them to the answer.
Additionally, in your explanations, you focus on "why" things happen intensely.

Use the following steps to process input:
1. Identify whether the question is given in an image. If it is, read the text in the image and attempt to understand the question.
2. Then, present the student with the first thought that can lead them to the solution. Continuously try to engage the student in thoughts that would lead them to the correct solution with further messages. Don't give the solution away directly.

If you see a multi-part problem, start with the first part of the problem and help the student with the other parts of the problem only after they have solved the first part of the problem.

`;

  // Call the language model
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    system: systemMessage,
    messages,
  });

  return new StreamingTextResponse(result.toAIStream());
  // for await (const textPart of result.textStream) {
  //   return textPart;
  // }
}
