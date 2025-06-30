# Two-Step Article Generation with LangChain

## Overview

This document outlines the implementation plan for adding a second step to our content brief generator: generating full articles based on the briefs using LangChain's chaining capabilities.

## Current State

**Step 1 (Existing):** User inputs → Content Brief (JSON)
- Frontend: Form with keyword, content type, tone, audience, word count
- Backend: Direct Anthropic API call returning structured brief

## Proposed Enhancement

**Step 2 (New):** Content Brief → Full Article
- Frontend: "Generate Article" button on brief display
- Backend: LangChain chain processing brief into complete article

## Frontend Changes Required

### 1. UI Updates

#### BriefDisplay.tsx
- Add "Generate Article" button below existing brief display
- Add loading state for article generation
- Add article display component/section
- Handle article generation API call

#### New Component: ArticleDisplay.tsx
- Display generated article with proper formatting
- Section headings (H1, H2, H3)
- Markdown/HTML rendering
- Export options (copy, download)

#### State Management
- Add article data to component state
- Track generation status (idle, loading, complete, error)
- Handle article data persistence

### 2. API Integration

```typescript
// New API endpoint call
const generateArticle = async (briefData: BriefData) => {
  const response = await fetch('/api/generate-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(briefData)
  });
  return response.json();
};
```

## Backend Changes Required

### 1. New FastAPI Endpoint

```python
@app.post("/generate-article")
async def generate_article(brief_data: dict):
    service = AnthropicService()
    article = await service.generate_article_from_brief(brief_data)
    return {"article": article}
```

### 2. LangChain Implementation

#### Enhanced AnthropicService Class

```python
from langchain.chains import SequentialChain
from langchain.prompts import PromptTemplate
from langchain.schema import BaseOutputParser

class ArticleOutputParser(BaseOutputParser):
    def parse(self, text: str) -> dict:
        # Parse article into structured format
        pass

async def generate_article_from_brief(self, brief_data: dict) -> dict:
    # Create LangChain sequential chain
    chain = self._create_article_generation_chain()
    result = await chain.arun(brief_data)
    return result
```

#### Multi-Step Chain Structure

1. **Introduction Chain**
   - Input: Brief title, key points, target audience
   - Output: Engaging introduction paragraph
   - Template: Hook + context + thesis statement

2. **Section Generation Chain** 
   - Input: Brief outline sections + previous content
   - Output: Detailed section content
   - Template: Section heading + body paragraphs + transitions

3. **Conclusion Chain**
   - Input: Article content + key points
   - Output: Compelling conclusion
   - Template: Summary + call-to-action + final thought

4. **Article Assembly Chain**
   - Input: All generated sections
   - Output: Complete formatted article
   - Template: Title + meta + intro + sections + conclusion

### 3. LangChain Chain Configuration

```python
def _create_article_generation_chain(self):
    # Introduction prompt
    intro_template = PromptTemplate(
        input_variables=["title", "key_points", "audience", "tone"],
        template="""Write an engaging introduction for an article titled "{title}".
        Target audience: {audience}
        Tone: {tone}
        Key points to preview: {key_points}
        
        Create a hook, provide context, and end with a clear thesis statement."""
    )
    
    # Section generation prompt
    section_template = PromptTemplate(
        input_variables=["heading", "subpoints", "previous_content", "tone"],
        template="""Write a detailed section for the heading "{heading}".
        Subpoints to cover: {subpoints}
        Previous content for context: {previous_content}
        Tone: {tone}
        
        Write 2-3 paragraphs with smooth transitions."""
    )
    
    # Create sequential chain
    return SequentialChain(
        chains=[intro_chain, section_chain, conclusion_chain, assembly_chain],
        input_variables=["brief_data"],
        output_variables=["complete_article"]
    )
```

## Benefits of LangChain Approach

### 1. **Structured Processing**
- Each article section gets focused attention
- Consistent quality across all parts
- Better coherence between sections

### 2. **Memory & Context**
- Previous sections inform later ones
- Maintains tone and style throughout
- Avoids repetition and ensures flow

### 3. **Template Reusability**
- Standardized prompts for each article type
- Easy to customize for different content types
- Consistent output formatting

### 4. **Error Handling**
- Individual chain failures can be isolated
- Retry specific sections without regenerating entire article
- Better debugging and monitoring

### 5. **Scalability**
- Easy to add new chain steps (e.g., SEO optimization, fact-checking)
- Modular design allows for feature expansion
- Can add parallel chains for different article formats

## Implementation Phases

### Phase 1: Backend Chain Development
1. Install additional LangChain dependencies
2. Create article generation chains
3. Test with sample brief data
4. Add new API endpoint

### Phase 2: Frontend Integration
1. Add "Generate Article" button to BriefDisplay
2. Create ArticleDisplay component
3. Implement API integration
4. Add loading and error states

### Phase 3: Enhancement & Polish
1. Add article export functionality
2. Implement article editing capabilities
3. Add multiple format options (HTML, Markdown, PDF)
4. Performance optimization

## File Structure After Implementation

```
/Users/di/code/adaptify/
├── backend/
│   ├── anthropic_service.py (enhanced with LangChain chains)
│   ├── main.py (new /generate-article endpoint)
│   └── requirements.txt (additional LangChain dependencies)
├── frontend/
│   ├── components/
│   │   ├── BriefDisplay.tsx (enhanced with article generation)
│   │   ├── ArticleDisplay.tsx (new component)
│   │   └── BriefForm.tsx (unchanged)
│   └── lib/
│       └── types.ts (new ArticleData type)
└── markdown/
    └── two-step-article-generation.md (this file)
```

## Technical Considerations

### Performance
- Article generation will take 10-30 seconds
- Need proper loading states and progress indicators
- Consider implementing WebSocket for real-time updates

### Cost Management
- Multiple API calls per article generation
- Implement usage tracking and rate limiting
- Consider caching for similar requests

### User Experience
- Clear indication of generation progress
- Ability to cancel generation
- Option to regenerate specific sections
- Save/load article drafts

This implementation transforms the tool from a brief generator into a complete content creation platform, with LangChain providing the orchestration needed for complex, multi-step article generation.