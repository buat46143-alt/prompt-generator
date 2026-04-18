export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    modelsEndpoint: 'https://api.openai.com/v1/models',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    })
  },
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    modelsEndpoint: null, // Anthropic tidak punya endpoint list models
    staticModels: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    })
  },
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    modelsEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    headers: () => ({
      'Content-Type': 'application/json'
    })
  },
  grok: {
    name: 'Grok',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    modelsEndpoint: null,
    staticModels: ['grok-beta', 'grok-vision-beta'],
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    })
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    modelsEndpoint: 'https://openrouter.ai/api/v1/models',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Prompt Generator'
    })
  },
  mistral: {
    name: 'Mistral',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    modelsEndpoint: 'https://api.mistral.ai/v1/models',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    })
  },
  ollama: {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/api/chat',
    modelsEndpoint: 'http://localhost:11434/api/tags',
    headers: () => ({
      'Content-Type': 'application/json'
    })
  }
};

// Template prompt tetap sama
export const PROMPT_TEMPLATE = `You are an expert prompt engineer specializing in creating structured, high-quality prompts for AI systems.

Your task: Generate a comprehensive, well-structured prompt based on the user's request.

User's request: {USER_INPUT}

Create a prompt following this exact architecture:

**Role**
// Define the Expert Persona
## Establish the AI's expertise, audience awareness, and communication approach.
You are a [specific role/expert] with expertise in [domain].
Your audience: [description + knowledge level]
Communication style: [tone + specific requirements]
## Example
You are a senior business strategy consultant with expertise in competitive analysis.
Your audience: C- suite executives with limited time for deep technical details.
Communication style: Concise, data-driven, and actionable with a confident tone.

**Task**
// Specify the Objective
## Clearly articulate what needs to be accomplished with explicit requirements.
Action verb and specific objective
Key requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]
etc..
## Example
Analyze the competitive positioning of our SaaS product against three main competitors.
Key requirements:
- Identify unique differentiators and vulnerabilities
- Quantify market share implications where possible
- Provide actionable recommendations for Q1 strategy

**Context**
// Provide Relevant Background
## Supply the information needed to understand and complete the task.
Give Relevant information, documents, background details, or data needed
## Example
Our product: Project management tool for remote teams, $49/month, 50K users.
Competitor:
1. Asana - 100K users, extensive integrations.
2. Monday.com - 80K users, visual interface focus.
3. ClickUp - 60K users, feature-rich, lower price point $35/month
Recent customer feedback highlights our superior mobile experience but mentions lack of time-tracking features.

**Example**
// Provide Example Outputs
## Explain what good output looks like
- Ex. 1: "Show what good output looks like for scenario 1."
- Ex. 2: "Show what good output looks like for scenario 2."
## Example
Ex. 1:
"Our $49/month price point positions us as a premium option compared to ClickUp's $35/month. This 40% price premium must be justified through: (1. Superior mobile UX, 2. Enterprise-grade security, 3. White glove onboarding). Risk: Price-sensitive SMBs may churn to ClikUp unless we demonstrate clear ROI advantage."

**Output**
// Define Expected Results
## Specify format, length, and structure of the desired output.
Format: [specific format - eg., 'Markdown table with 3 columns']
Length: [constraint - eg., '300-500 words']
Structure: [if applicabl- eg., 'Introduction --> Analysis --> Recommendations']
## Example
Format: Executive summary (1 paragraph) + comparison table (4 columns: Features|Us|Competitors|Impact) + 3 strategic recommendations.
Length: 300-500 words total.
Structure: Summary --> Comparison --> Recommendations

**Constraints**
// Set Boundaries & Guidelines
## Establish what should and should not be included.
- [Specific do's and don'ts]
- [Style requirements]
- [Any limitations or boundaries]
## Example
- No jargon or technical implementation details
- Focus only on strategic business implications
- Avoid speculating on competitors future roadmaps
- Do not recommend features that would take >6 months to build

**Instructions**
// Guide the Process
## Provide meta-guidance on how to approach the task
For complex tasks: Think through your approach step-by-step, then provide the final answer in the requested format.
If information is missing or uncertain, state this explicitly rather than guessing.


Generate the complete prompt now, filling in all sections appropriately based on the user's request. Make it specific, actionable, and professionally structured.`;
