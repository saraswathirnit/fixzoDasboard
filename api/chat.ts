import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleChatRequest(message: string, workshopData: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes workshop data and answers questions about it."
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(workshopData)}\n\nQuestion: ${message}`
        }
      ],
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response received from AI');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error 
      ? error.message
      : 'An unexpected error occurred while processing your request';
      
    return `I apologize, but ${errorMessage.toLowerCase()}. Please try again or rephrase your question.`;
  }
} 