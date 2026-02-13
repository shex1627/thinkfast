import streamlit as st
import anthropic
import json
import time
import random
import os
from datetime import datetime

DEPLOY_MODE = os.environ.get("DEPLOY_MODE", "").lower() in ("1", "true", "yes")
ENV_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# --- Config ---
st.set_page_config(
    page_title="ThinkFast",
    page_icon="⚡",
    layout="centered",
    menu_items={} if DEPLOY_MODE else None,
)

if DEPLOY_MODE:
    st.markdown(
        "<style>#MainMenu {visibility: hidden;}</style>",
        unsafe_allow_html=True,
    )

# --- Preset Topics & Concepts ---
TOPIC_CONCEPTS = {
    "JavaScript": [
        "closures", "promises", "the event loop", "prototypal inheritance",
        "async/await", "hoisting", "higher-order functions", "the DOM",
        "arrow functions vs regular functions", "the this keyword", "destructuring",
        "spread and rest operators", "template literals", "modules (import/export)",
        "classes and inheritance", "callbacks", "promise chaining", "try/catch and error handling",
        "the fetch API", "map, filter, and reduce", "variable scoping (var, let, const)",
        "immediately invoked function expressions (IIFE)", "currying", "debouncing and throttling",
        "web workers", "service workers", "local storage vs session storage", "cookies",
        "regular expressions", "object vs Map", "array vs Set", "WeakMap and WeakSet",
        "symbols", "proxies and reflect", "generators and iterators",
        "garbage collection in JavaScript",
    ],
    "Python": [
        "decorators", "generators", "list comprehensions", "the GIL",
        "duck typing", "context managers", "virtual environments", "dunder methods",
        "metaclasses", "iterators vs iterables", "the descriptor protocol",
        "multiple inheritance and MRO", "lambda functions", "map, filter, and reduce",
        "class methods vs static methods", "property decorators", "the *args and **kwargs syntax",
        "dictionary comprehensions", "set comprehensions", "the walrus operator",
        "asyncio and async/await", "the with statement", "exception handling and custom exceptions",
        "modules and packages", "the import system", "pip and package management",
        "type hints and annotations", "dataclasses", "named tuples", "function closures",
        "mutable vs immutable types", "shallow vs deep copy", "the is vs == operators",
        "pass by reference vs pass by value", "Python's memory management", "slots",
    ],
    "Machine Learning": [
        "gradient descent", "overfitting", "neural networks",
        "supervised vs unsupervised learning", "backpropagation",
        "bias-variance tradeoff", "decision trees", "cross-validation",
        "regularization (L1/L2)", "feature engineering",
        "ensemble methods (bagging vs boosting)", "precision vs recall",
        "ROC curves", "k-nearest neighbors", "dimensionality reduction (PCA)", "transfer learning",
        "transformer architecture and self-attention",
        "vanishing and exploding gradients",
        "BatchNorm vs LayerNorm",
        "training, validation, and test data splits",
        "batch vs mini-batch vs stochastic gradient descent",
        "generative vs discriminative models",
        "CNNs vs traditional neural networks",
        "concept drift in production models",
        "F1-score and when to optimize for precision vs recall",
        "feature scaling (normalization vs standardization)",
        "classification vs regression",
    ],
    "Web Development": [
        "REST APIs", "CORS", "cookies vs sessions", "DNS resolution",
        "HTTPS/TLS", "caching strategies", "WebSockets", "responsive design",
        "the critical rendering path", "server-side rendering vs client-side rendering",
        "OAuth and authentication flows", "Content Security Policy",
        "progressive web apps", "service workers", "web accessibility (WCAG)", "GraphQL vs REST",
        "rate limiting (token bucket, sliding window)",
        "web crawlers (deduplication, politeness, distributed crawling)",
        "real-time fraud detection in web systems",
    ],
    "Databases": [
        "SQL joins", "indexing (in databases)", "ACID properties", "normalization",
        "NoSQL vs SQL", "transactions (in databases)", "connection pooling", "sharding",
        "database replication", "CAP theorem", "query optimization", "stored procedures",
        "database migrations", "eventual consistency", "write-ahead logging", "materialized views",
    ],
    "Operating Systems": [
        "processes vs threads", "virtual memory (in OS)", "deadlocks", "file systems",
        "context switching", "scheduling algorithms (in OS)", "system calls", "page replacement (in OS)",
        "the heap (OS memory management)", "the stack (OS call stack)",
        "inter-process communication", "semaphores and mutexes",
        "memory-mapped I/O", "kernel space vs user space", "paging vs segmentation",
        "interrupts and interrupt handling",
        "concurrency patterns (producer-consumer problem)",
        "kernel optimization (loop unrolling, memory coalescing)",
    ],
    "Networking": [
        "TCP vs UDP", "HTTP/2", "load balancing (in networking)", "CDNs",
        "the OSI model", "subnetting", "packet routing", "firewalls",
        "NAT (Network Address Translation)", "ARP (Address Resolution Protocol)",
        "BGP routing", "DHCP", "TCP three-way handshake",
        "HTTP status codes", "TLS handshake", "DNS records (A, CNAME, MX)",
    ],
    "Data Structures": [
        "hash tables", "binary search trees", "linked lists vs arrays",
        "graphs (in data structures)", "stacks and queues",
        "heaps (priority queue data structure)", "tries (prefix trees)", "B-trees",
        "red-black trees", "bloom filters", "skip lists",
        "adjacency list vs adjacency matrix", "disjoint set (union-find)",
        "circular buffers", "LRU cache implementation", "amortized time complexity",
        "SnapshotArray implementation", "KV store with versioning and transactions",
    ],
    "Generative AI": [
        "RAG (retrieval-augmented generation)",
        "vector databases and ANN search",
        "LLM inference serving and optimization",
        "PagedAttention and KV cache management",
        "quantization (4-bit/8-bit) for model compression",
        "agentic AI systems (Plan-Act-Observe loop)",
        "tool calling and safety in AI agents",
        "memory in multi-agent workflows",
        "human-in-the-loop design for AI agents",
        "prompt engineering techniques",
        "RLHF (reinforcement learning from human feedback)",
        "constitutional AI",
        "embeddings and semantic search",
        "text-to-image generation (diffusion models)",
        "fine-tuning vs pre-training",
        "knowledge distillation",
        "tokenization in LLMs",
        "context windows and attention limits",
        "chain-of-thought prompting",
        "few-shot vs zero-shot learning",
        "hallucination in LLMs and mitigation strategies",
        "guardrails for LLM outputs",
        "model evaluation metrics (perplexity, BLEU, ROUGE)",
        "ReAct prompting pattern",
        "chunking strategies for RAG pipelines",
        "cross-encoder reranking for retrieval",
        "hybrid search (vector + BM25)",
        "AI safety and alignment",
        "model monitoring and drift detection",
        "distributed training (data parallelism vs model parallelism)",
    ],
    "Physics": [
        "gravity", "quantum entanglement", "thermodynamics",
        "special relativity", "electromagnetic waves", "entropy (in physics)",
        "Heisenberg's uncertainty principle", "wave-particle duality",
        "conservation of energy", "Schrödinger's equation", "the photoelectric effect",
        "nuclear fission vs fusion", "the Doppler effect", "Ohm's law",
        "centripetal vs centrifugal force", "the Standard Model of particle physics",
    ],
    "Economics": [
        "supply and demand", "inflation", "opportunity cost",
        "game theory", "monetary policy", "comparative advantage",
        "market equilibrium", "externalities",
        "GDP and how it's measured", "the Phillips curve", "moral hazard",
        "adverse selection", "fiscal policy vs monetary policy",
        "the tragedy of the commons", "price elasticity", "Keynesian vs classical economics",
    ],
}

AUDIENCES = {
    "a 10-year-old child": "child",
    "a non-technical adult": "non-technical",
    "a peer with similar expertise": "peer",
    "a job interviewer": "interviewer",
    "a business executive": "executive",
}

MAX_PERSONA_LENGTH = 50  # Character limit for custom persona to prevent prompt injection

PROMPT_TEMPLATES = [
    "[{topic}] Explain {concept} to {audience}.",
    "[{topic}] What is {concept} and why does it matter? Explain for {audience}.",
    "[{topic}] Describe how {concept} works to {audience}.",
    "[{topic}] Summarize {concept} in a way that {audience} would understand.",
    "[{topic}] What are the most important things to know about {concept}? Explain for {audience}.",
    "[{topic}] Walk through {concept} step by step for {audience}.",
]

TIMER_OPTIONS = {
    "30 seconds": 30,
    "60 seconds": 60,
    "90 seconds": 90,
    "120 seconds": 120,
    "3 minutes": 180,
    "5 minutes": 300,
}


def sanitize_persona(persona: str) -> str:
    """Sanitize and validate custom persona input to prevent prompt injection."""
    if not persona:
        return ""

    # Trim to max length
    persona = persona[:MAX_PERSONA_LENGTH].strip()

    # Remove special characters that could be used for injection
    # Allow only letters, numbers, spaces, hyphens, and basic punctuation
    allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -,.'")
    persona = "".join(c for c in persona if c in allowed_chars)

    # Remove any newlines or control characters
    persona = " ".join(persona.split())

    return persona


def generate_prompt(topic: str, custom_concept: str | None = None, custom_persona: str | None = None, custom_concepts: dict | None = None) -> tuple[str, str, str]:
    """Generate a practice prompt. Returns (full_prompt, concept, audience_label)."""
    if custom_concept:
        concept = custom_concept
    else:
        preset = TOPIC_CONCEPTS.get(topic, [])
        extra = (custom_concepts or {}).get(topic, [])
        all_concepts = preset + extra
        if all_concepts:
            concept = random.choice(all_concepts)
        else:
            concept = f"a key concept from {topic}"

    # Use custom persona if provided and valid, otherwise random
    if custom_persona:
        sanitized = sanitize_persona(custom_persona)
        if sanitized:
            audience_label = sanitized
        else:
            audience_label = random.choice(list(AUDIENCES.keys()))
    else:
        audience_label = random.choice(list(AUDIENCES.keys()))

    template = random.choice(PROMPT_TEMPLATES)
    prompt = template.format(topic=topic, concept=concept, audience=audience_label)
    return prompt, concept, audience_label


def score_explanation(
    prompt: str,
    explanation: str,
    topic: str,
    audience: str,
    timer_duration: int,
    time_used: int,
) -> dict | None:
    """Send explanation to Claude for scoring."""
    api_key = st.session_state.get("api_key", "")
    if not api_key:
        st.error("Please enter your Anthropic API key in the sidebar.")
        return None

    client = anthropic.Anthropic(api_key=api_key)
    word_count = len(explanation.split())

    # Determine time-based expectations
    if timer_duration <= 60:
        time_context = "very short time (≤60s) - expect bullet points or a brief paragraph covering key ideas only"
        completeness_note = "For this short timeframe, completeness means hitting 2-3 key points, not exhaustive coverage"
    elif timer_duration <= 120:
        time_context = "moderate time (60-120s) - expect 1-2 paragraphs with main concepts and an example"
        completeness_note = "Should cover main concepts with at least one concrete example or analogy"
    else:
        time_context = "extended time (>120s) - expect well-developed explanation with examples, nuance, and structure"
        completeness_note = "Should provide thorough coverage with examples, context, and possibly counterexamples"

    scoring_prompt = f"""You are an expert communication coach. Evaluate how well someone explained a concept under time pressure.

## Context
- **Prompt given**: "{prompt}"
- **Topic**: {topic}
- **Target audience**: {audience}
  ⚠️ IMPORTANT: The explanation must be tailored specifically for "{audience}". Evaluate clarity and appropriateness based on this exact audience persona.
- **Time allowed**: {timer_duration} seconds ({time_context})
- **Time used**: {time_used} seconds
- **Word count**: {word_count} words

## The Explanation
\"\"\"
{explanation}
\"\"\"

## Evaluation Guidelines

**Time-Adjusted Expectations**:
- {completeness_note}
- Minor typos, grammar issues, or abrupt endings are acceptable given time pressure
- Prioritize clarity and accuracy over polish
- Judge completeness relative to the time constraint - shorter times should NOT be penalized for brevity

**Scoring Dimensions**:
1. **Clarity**: Is it understandable specifically for "{audience}"? Consider the vocabulary, examples, and analogies appropriate for this exact persona.
2. **Accuracy**: Are the core concepts technically correct?
3. **Structure**: Is there logical flow (even if brief)?
4. **Completeness**: Does it cover what's reasonable given {timer_duration} seconds?
5. **Conciseness**: Efficient use of limited time?

Respond with ONLY this JSON (no markdown fences, no preamble):

{{
  "clarity": {{"score": <1-10>, "feedback": "<2-3 sentences>"}},
  "accuracy": {{"score": <1-10>, "feedback": "<2-3 sentences>"}},
  "structure": {{"score": <1-10>, "feedback": "<2-3 sentences>"}},
  "completeness": {{"score": <1-10>, "feedback": "<2-3 sentences>"}},
  "conciseness": {{"score": <1-10>, "feedback": "<2-3 sentences>"}},
  "overall": {{
    "score": <1-10 weighted: clarity 25%, accuracy 25%, structure 20%, completeness 15%, conciseness 15%>,
    "grade": "<A+ to F>",
    "summary": "<2-3 sentence overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"]
  }},
  "model_explanation": "<A concise, well-structured explanation that could realistically be typed within {timer_duration} seconds. This should demonstrate ideal clarity, accuracy, and structure for the given audience while respecting the time constraint.>"
}}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            messages=[{"role": "user", "content": scoring_prompt}],
        )
        text = message.content[0].text
        json_match = text[text.index("{"):text.rindex("}") + 1]
        return json.loads(json_match)
    except Exception as e:
        st.error(f"Scoring failed: {e}")
        return None


def render_score_bar(label: str, score: int, feedback: str):
    """Render a single score category."""
    color = "#22c55e" if score >= 7 else "#eab308" if score >= 5 else "#ef4444"
    st.markdown(f"**{label}**: **{score}/10**")
    st.progress(score / 10)
    st.caption(feedback)


# --- Session State Init ---
defaults = {
    "phase": "setup",        # setup | practicing | submitted | scored
    "prompt": "",
    "concept": "",
    "audience": "",
    "explanation": "",
    "start_time": None,
    "time_used": 0,
    "score": None,
    "history": [],
    "selected_topics": [],
    "custom_topics": [],
    "custom_concepts": {},  # {topic_name: [concept1, concept2, ...]}
    "custom_persona": "",
    "api_key": ENV_API_KEY,
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# --- Sidebar ---
with st.sidebar:
    st.title("Settings")
    if not ENV_API_KEY:
        api_key = st.text_input("Anthropic API Key", type="password", value=st.session_state.api_key)
        st.session_state.api_key = api_key
        st.divider()
    st.subheader("Timer Duration")
    timer_label = st.select_slider(
        "How long do you want?",
        options=list(TIMER_OPTIONS.keys()),
        value="60 seconds",
    )
    timer_duration = TIMER_OPTIONS[timer_label]

    st.divider()
    st.subheader("Your Topics")
    selected = st.multiselect(
        "Pick topics you know",
        options=list(TOPIC_CONCEPTS.keys()),
        default=st.session_state.selected_topics,
        key="topic_multiselect",
    )
    # Only update if changed to avoid unnecessary reruns
    if selected != st.session_state.selected_topics:
        st.session_state.selected_topics = selected

    custom = st.text_input("Add a custom topic")
    if custom and st.button("Add Topic"):
        if custom not in st.session_state.custom_topics:
            st.session_state.custom_topics.append(custom)
            st.rerun()

    if st.session_state.custom_topics:
        st.caption(f"Custom: {', '.join(st.session_state.custom_topics)}")

    st.divider()
    st.subheader("Custom Questions")
    st.caption("Add your own concepts/questions to any topic.")
    all_topic_names = list(TOPIC_CONCEPTS.keys()) + st.session_state.custom_topics
    concept_topic = st.selectbox("Topic", options=all_topic_names, key="concept_topic_select")
    concept_input = st.text_input("New question/concept", key="concept_input")
    if concept_input and st.button("Add Concept"):
        if concept_topic not in st.session_state.custom_concepts:
            st.session_state.custom_concepts[concept_topic] = []
        if concept_input not in st.session_state.custom_concepts[concept_topic]:
            st.session_state.custom_concepts[concept_topic].append(concept_input)
            st.rerun()

    if concept_topic and st.session_state.custom_concepts.get(concept_topic):
        st.caption(f"Your custom concepts for {concept_topic}:")
        for i, c in enumerate(st.session_state.custom_concepts[concept_topic]):
            col1, col2 = st.columns([4, 1])
            with col1:
                st.text(c)
            with col2:
                if st.button("×", key=f"rm_concept_{concept_topic}_{i}"):
                    st.session_state.custom_concepts[concept_topic].pop(i)
                    st.rerun()

    preset_count = len(TOPIC_CONCEPTS.get(concept_topic, [])) if concept_topic else 0
    custom_count = len(st.session_state.custom_concepts.get(concept_topic, [])) if concept_topic else 0
    if concept_topic:
        st.caption(f"Total: {preset_count} preset + {custom_count} custom = {preset_count + custom_count}")

    st.divider()
    st.subheader("Audience / Persona")
    st.caption(f"Default personas: {', '.join(list(AUDIENCES.keys())[:3])}, ...")

    custom_persona = st.text_input(
        "Custom persona (optional)",
        value=st.session_state.custom_persona,
        max_chars=MAX_PERSONA_LENGTH,
        placeholder="e.g., a curious teenager",
        help=f"Define who you're explaining to. Max {MAX_PERSONA_LENGTH} chars. Leave blank for random default personas."
    )
    st.session_state.custom_persona = custom_persona

    if custom_persona:
        sanitized = sanitize_persona(custom_persona)
        if sanitized != custom_persona.strip()[:MAX_PERSONA_LENGTH]:
            st.caption("⚠️ Some characters were filtered for security")
        if sanitized:
            st.caption(f"✓ Will use: **{sanitized}**")

    st.divider()
    if st.session_state.history:
        st.subheader(f"History ({len(st.session_state.history)} attempts)")
        for i, h in enumerate(reversed(st.session_state.history[-10:])):
            with st.expander(f"#{len(st.session_state.history) - i} — {h['topic']}: {h['score']}/10"):
                st.write(f"**Prompt**: {h['prompt']}")
                st.write(f"**Time**: {h['time_used']}s / {h['timer']}s")
                st.write(f"**Grade**: {h['grade']}")

# --- Main Area ---
st.title("⚡ ThinkFast")
st.caption("Practice explaining concepts clearly, under time pressure.")

all_topics = st.session_state.selected_topics + st.session_state.custom_topics

# ========== SETUP PHASE ==========
if st.session_state.phase == "setup":
    if not all_topics:
        st.info("Select at least one topic in the sidebar to get started.")
        st.stop()

    if not st.session_state.api_key:
        st.warning("Set the ANTHROPIC_API_KEY environment variable or enter your key in the sidebar to enable AI scoring.")

    st.subheader("Ready to practice?")
    st.write(f"**Topics**: {', '.join(all_topics)}")
    st.write(f"**Timer**: {timer_label}")

    if st.button("Generate Prompt", type="primary", use_container_width=True):
        topic = random.choice(all_topics)
        prompt, concept, audience = generate_prompt(topic, custom_persona=st.session_state.get("custom_persona", ""), custom_concepts=st.session_state.custom_concepts)
        st.session_state.prompt = prompt
        st.session_state.concept = concept
        st.session_state.audience = audience
        st.session_state.current_topic = topic
        st.session_state.timer_duration = timer_duration
        st.session_state.phase = "practicing"
        st.session_state.explanation = ""
        st.session_state.start_time = time.time()
        st.rerun()

# ========== PRACTICING PHASE ==========
elif st.session_state.phase == "practicing":
    elapsed = time.time() - st.session_state.start_time
    remaining = max(0, st.session_state.timer_duration - elapsed)

    st.subheader("Your Prompt")
    st.info(st.session_state.prompt)

    # Timer display
    mins, secs = divmod(int(remaining), 60)
    timer_color = "green" if remaining > st.session_state.timer_duration * 0.5 else "orange" if remaining > st.session_state.timer_duration * 0.2 else "red"
    st.markdown(
        f"### :{timer_color}[⏱ {mins:02d}:{secs:02d}]"
    )
    st.progress(remaining / st.session_state.timer_duration)

    explanation = st.text_area(
        "Type your explanation here...",
        value=st.session_state.explanation,
        height=250,
        key="explanation_input",
        disabled=remaining <= 0,
    )
    st.session_state.explanation = explanation

    word_count = len(explanation.split()) if explanation.strip() else 0
    st.caption(f"{word_count} words")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Submit", type="primary", use_container_width=True, disabled=not explanation.strip()):
            st.session_state.time_used = int(elapsed)
            st.session_state.phase = "submitted"
            st.rerun()
    with col2:
        if st.button("Cancel", use_container_width=True):
            st.session_state.phase = "setup"
            st.rerun()

    # Auto-refresh timer (every 1 second)
    if remaining > 0:
        time.sleep(1)
        st.rerun()
    elif explanation.strip():
        st.session_state.time_used = st.session_state.timer_duration
        st.session_state.phase = "submitted"
        st.rerun()

# ========== SUBMITTED — SCORING ==========
elif st.session_state.phase == "submitted":
    st.subheader("Scoring your explanation...")
    st.info(st.session_state.prompt)
    st.write(f"*Your explanation ({len(st.session_state.explanation.split())} words, {st.session_state.time_used}s used):*")
    st.text(st.session_state.explanation)

    with st.spinner("Claude is evaluating your explanation..."):
        result = score_explanation(
            prompt=st.session_state.prompt,
            explanation=st.session_state.explanation,
            topic=st.session_state.current_topic,
            audience=st.session_state.audience,
            timer_duration=st.session_state.timer_duration,
            time_used=st.session_state.time_used,
        )

    if result:
        st.session_state.score = result
        st.session_state.history.append({
            "topic": st.session_state.current_topic,
            "prompt": st.session_state.prompt,
            "explanation": st.session_state.explanation,
            "timer": st.session_state.timer_duration,
            "time_used": st.session_state.time_used,
            "score": result["overall"]["score"],
            "grade": result["overall"]["grade"],
            "full_score": result,
            "timestamp": datetime.now().isoformat(),
        })
        st.session_state.phase = "scored"
        st.rerun()
    else:
        st.error("Scoring failed. Check your API key and try again.")
        if st.button("Back to Setup"):
            st.session_state.phase = "setup"
            st.rerun()

# ========== SCORED — RESULTS ==========
elif st.session_state.phase == "scored":
    result = st.session_state.score

    st.subheader("Results")
    st.info(st.session_state.prompt)

    # Overall score
    overall = result["overall"]
    score_val = overall["score"]
    grade = overall["grade"]

    col1, col2, col3 = st.columns([1, 1, 2])
    with col1:
        st.metric("Score", f"{score_val}/10")
    with col2:
        st.metric("Grade", grade)
    with col3:
        st.metric("Time", f"{st.session_state.time_used}s / {st.session_state.timer_duration}s")

    st.write(overall["summary"])

    # Strengths & improvements
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**Strengths**")
        for s in overall.get("strengths", []):
            st.markdown(f"- {s}")
    with col2:
        st.markdown("**Areas to Improve**")
        for s in overall.get("improvements", []):
            st.markdown(f"- {s}")

    st.divider()

    # Category breakdown
    st.subheader("Breakdown")
    for cat in ["clarity", "accuracy", "structure", "completeness", "conciseness"]:
        if cat in result:
            render_score_bar(cat.capitalize(), result[cat]["score"], result[cat]["feedback"])
            st.write("")

    st.divider()

    # Your explanation
    with st.expander("Your explanation"):
        st.text(st.session_state.explanation)

    # Model explanation
    if "model_explanation" in result:
        with st.expander("Model explanation"):
            st.markdown(result["model_explanation"])

    # Actions
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Try Again (Same Topic)", use_container_width=True):
            topic = st.session_state.current_topic
            prompt, concept, audience = generate_prompt(topic, custom_persona=st.session_state.get("custom_persona", ""), custom_concepts=st.session_state.custom_concepts)
            st.session_state.prompt = prompt
            st.session_state.concept = concept
            st.session_state.audience = audience
            st.session_state.timer_duration = timer_duration
            st.session_state.explanation = ""
            st.session_state.start_time = time.time()
            st.session_state.phase = "practicing"
            st.rerun()
    with col2:
        if st.button("New Topic", type="primary", use_container_width=True):
            st.session_state.phase = "setup"
            st.rerun()
