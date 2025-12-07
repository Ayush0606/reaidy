import axios from 'axios';

/**
 * AI Service for transaction analysis using Gemini API
 */
class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.baseURL = process.env.AI_PROVIDER_URL || 
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Construct prompt for AI analysis
   */
  constructPrompt(userId, month, transactions) {
    const transactionList = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      description: t.description,
      amount: t.amount,
      category: t.category
    }));

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    const prompt = `You are a financial advisor analyzing spending patterns for a user.

Month: ${month}
Total Transactions: ${transactions.length}
Total Spending: $${totalSpending.toFixed(2)}

Transactions:
${JSON.stringify(transactionList, null, 2)}

Please analyze this spending data and provide:
1. A concise 3-5 sentence summary of the user's spending pattern
2. Top 3 spending categories with amounts and percentage of total
3. 3 specific, actionable suggestions to reduce spending
4. A realistic monthly savings goal based on the data
5. One quick tip for each of the top 3 categories

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "Your 3-5 sentence summary here",
  "topCategories": [
    {"category": "category_name", "amount": 123.45, "percent": 45.6},
    {"category": "category_name", "amount": 67.89, "percent": 25.1},
    {"category": "category_name", "amount": 45.67, "percent": 16.8}
  ],
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Specific suggestion 3"
  ],
  "savingsGoal": 150
}`;

    return prompt;
  }

  /**
   * Call Gemini API for analysis
   */
  async analyzeTransactions(userId, month, transactions) {
    try {
      if (!this.apiKey) {
        throw new Error('AI API key not configured');
      }

      if (!transactions || transactions.length === 0) {
        return {
          summary: 'No transactions found for this month.',
          topCategories: [],
          suggestions: ['Start tracking your expenses to get personalized insights.'],
          savingsGoal: 0
        };
      }

      const prompt = this.constructPrompt(userId, month, transactions);

      // Call Gemini API
      const response = await axios.post(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Extract response text
      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Invalid response from AI service');
      }

      // Parse JSON response (handle markdown code blocks if present)
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(cleanedText);

      // Validate response structure
      if (!analysis.summary || !analysis.topCategories || !analysis.suggestions) {
        throw new Error('Invalid AI response structure');
      }

      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error.response?.data || error.message);
      
      // Return fallback analysis
      return this.getFallbackAnalysis(transactions);
    }
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  getFallbackAnalysis(transactions) {
    if (!transactions || transactions.length === 0) {
      return {
        summary: 'No transactions found for this month.',
        topCategories: [],
        suggestions: ['Start tracking your expenses to get personalized insights.'],
        savingsGoal: 0
      };
    }

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate category totals
    const categoryTotals = {};
    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    // Get top 3 categories
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: (amount / totalSpending * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return {
      summary: `You spent $${totalSpending.toFixed(2)} across ${transactions.length} transactions this month. Your highest spending was in ${topCategories[0]?.category || 'various categories'}. Consider reviewing your recurring expenses and discretionary spending.`,
      topCategories: topCategories.map(c => ({
        ...c,
        percent: parseFloat(c.percent)
      })),
      suggestions: [
        'Review subscriptions and cancel unused services',
        'Set spending limits for discretionary categories',
        'Track daily expenses to identify patterns'
      ],
      savingsGoal: Math.round(totalSpending * 0.1) // 10% of spending
    };
  }
}

export default new AIService();
