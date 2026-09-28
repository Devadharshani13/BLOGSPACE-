"""
BlogSpace Database Seed Script
================================
Run this after setting up your PostgreSQL database:

    python seed.py

Default credentials (CHANGE for any non-local deployment):
  Admin: admin@blogspace.com / Admin@123
  Users: alice@example.com / Demo@123
         bob@example.com / Demo@123
         priya@example.com / Demo@123
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timezone, timedelta
from app.database.database import SessionLocal, engine
from app.database.base import Base
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.tag import Tag
from app.models.post import Post, PostStatus
from app.models.comment import Comment
from app.models.like import Like
from app.models.bookmark import Bookmark
from app.core.security import get_password_hash
from app.utils.slug import slugify


def seed():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Categories ────────────────────────────────────────────────────────
        print("Seeding categories...")
        category_data = [
            ("Technology", "Explore the latest in technology, gadgets, and innovation."),
            ("Artificial Intelligence", "Deep dives into AI, machine learning, and the future of intelligent systems."),
            ("Programming", "Tutorials, tips, and best practices for developers."),
            ("Web Development", "Everything about building modern web applications."),
            ("Cybersecurity", "Stay safe online — security tips, threats, and best practices."),
            ("Education", "Learning strategies, resources, and insights for lifelong learners."),
            ("Career", "Career advice, job hunting tips, and professional growth strategies."),
            ("Travel", "Destinations, travel tips, and adventures from around the world."),
            ("Lifestyle", "Wellness, productivity, mindfulness, and everyday inspiration."),
        ]
        categories = {}
        for name, desc in category_data:
            cat = db.query(Category).filter(Category.name == name).first()
            if not cat:
                cat = Category(name=name, slug=slugify(name), description=desc)
                db.add(cat)
                db.flush()
            categories[name] = cat
        db.commit()

        # ── Tags ─────────────────────────────────────────────────────────────
        print("Seeding tags...")
        tag_names = [
            "python", "fastapi", "react", "javascript", "typescript",
            "postgresql", "docker", "machine-learning", "deep-learning", "nlp",
            "web-dev", "api", "security", "productivity", "career-growth",
            "travel", "mindfulness", "tutorial", "beginners", "advanced",
        ]
        tags = {}
        for name in tag_names:
            tag = db.query(Tag).filter(Tag.slug == name).first()
            if not tag:
                tag = Tag(name=name.replace("-", " ").title(), slug=name)
                db.add(tag)
                db.flush()
            tags[name] = tag
        db.commit()

        # ── Users ─────────────────────────────────────────────────────────────
        print("Seeding users...")

        def get_or_create_user(email, name, password, role=UserRole.USER, bio=None):
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    password_hash=get_password_hash(password),
                    role=role,
                    bio=bio,
                    is_active=True,
                )
                db.add(user)
                db.flush()
            return user

        admin = get_or_create_user(
            "admin@blogspace.com", "Admin", "Admin@123", role=UserRole.ADMIN,
            bio="Platform administrator for BlogSpace."
        )
        alice = get_or_create_user(
            "alice@example.com", "Alice Kumar", "Demo@123",
            bio="Full-stack developer and tech enthusiast. I write about Python, FastAPI, and web development."
        )
        bob = get_or_create_user(
            "bob@example.com", "Bob Chen", "Demo@123",
            bio="AI researcher and machine learning practitioner. Passionate about making AI accessible."
        )
        priya = get_or_create_user(
            "priya@example.com", "Priya Nair", "Demo@123",
            bio="Travel enthusiast, writer, and lifelong learner. Exploring the world one story at a time."
        )
        db.commit()

        # ── Posts ─────────────────────────────────────────────────────────────
        print("Seeding blog posts...")

        posts_data = [
            {
                "title": "The Future of AI in Web Development",
                "author": bob,
                "category": categories["Artificial Intelligence"],
                "tags": [tags["machine-learning"], tags["web-dev"], tags["python"]],
                "status": PostStatus.PUBLISHED,
                "views": 1342,
                "excerpt": "Artificial intelligence is transforming how we build, deploy, and maintain web applications. From AI-powered user experiences to automated testing, the possibilities are endless.",
                "content": """<h2>Introduction</h2>
<p>Artificial intelligence is no longer a distant dream — it's reshaping how we build web applications today. From intelligent autocomplete to AI-driven UI personalization, developers are finding new ways to integrate AI into their daily workflows.</p>
<h2>AI in Modern Development</h2>
<p>Tools like GitHub Copilot and ChatGPT have fundamentally changed how developers write code. Instead of starting from scratch, developers now collaborate with AI to prototype features faster, catch bugs earlier, and write better documentation.</p>
<h2>Real-world Applications</h2>
<p>Companies like Netflix and Spotify already use AI to power their recommendation engines. In web development, AI is being used for A/B testing automation, smart image optimization, and natural language search. The result? Better user experiences with less manual effort.</p>
<h2>Challenges and Considerations</h2>
<p>Despite the excitement, AI in web development comes with challenges. Model bias, data privacy concerns, and the cost of running inference at scale are all real problems developers must address. Responsible AI integration requires careful planning and continuous monitoring.</p>
<h2>The Road Ahead</h2>
<p>The next few years will bring AI even closer to the core of web development. We'll see more AI-native frameworks, smarter development environments, and AI assistants that understand entire codebases. The developers who embrace these tools today will be ahead of the curve tomorrow.</p>""",
            },
            {
                "title": "A Beginner's Guide to FastAPI",
                "author": alice,
                "category": categories["Programming"],
                "tags": [tags["python"], tags["fastapi"], tags["api"], tags["beginners"]],
                "status": PostStatus.PUBLISHED,
                "views": 892,
                "excerpt": "FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. Learn how to get started.",
                "content": """<h2>What is FastAPI?</h2>
<p>FastAPI is a modern Python web framework designed for building high-performance APIs quickly and easily. It's built on top of Starlette for the web parts and Pydantic for data validation. If you've worked with Flask or Django, FastAPI will feel familiar — but with superpowers.</p>
<h2>Why Choose FastAPI?</h2>
<p>FastAPI is one of the fastest Python frameworks available, comparable to NodeJS and Go. It automatically generates interactive API documentation using Swagger UI and ReDoc, supports async/await natively, and uses Python type hints for automatic request validation.</p>
<h2>Getting Started</h2>
<p>Installation is simple: <code>pip install fastapi uvicorn</code>. Create a file called <code>main.py</code> and add your first route. Run it with <code>uvicorn main:app --reload</code> and visit <code>http://localhost:8000/docs</code> to see the auto-generated documentation.</p>
<h2>Building Your First API</h2>
<p>Creating endpoints in FastAPI is intuitive. Use decorators like <code>@app.get()</code>, <code>@app.post()</code>, etc. Define request and response models using Pydantic's BaseModel class, and FastAPI handles validation automatically. Path parameters, query parameters, and request bodies are all handled cleanly.</p>
<h2>Next Steps</h2>
<p>Once you're comfortable with the basics, explore SQLAlchemy for database integration, OAuth2 for authentication, and Alembic for migrations. The FastAPI documentation is outstanding and covers everything you need to build production-ready APIs.</p>""",
            },
            {
                "title": "Building Scalable Web Applications with PostgreSQL",
                "author": alice,
                "category": categories["Web Development"],
                "tags": [tags["postgresql"], tags["web-dev"], tags["python"], tags["advanced"]],
                "status": PostStatus.PUBLISHED,
                "views": 654,
                "excerpt": "PostgreSQL is the world's most advanced open source relational database. Learn how to design, optimize, and scale your PostgreSQL database for production web applications.",
                "content": """<h2>Why PostgreSQL?</h2>
<p>PostgreSQL stands out among relational databases for its reliability, rich feature set, and compliance with SQL standards. It supports JSONB for semi-structured data, full-text search, geospatial queries with PostGIS, and much more — making it the ideal database for modern web applications.</p>
<h2>Schema Design Principles</h2>
<p>Good schema design is the foundation of a scalable application. Normalize your data appropriately, use proper data types, and define constraints at the database level. Never store data you can compute. Use foreign keys to maintain referential integrity and prevent orphaned records.</p>
<h2>Indexing Strategies</h2>
<p>Indexes are the most powerful tool for query optimization. Create indexes on frequently queried columns, but don't over-index — each index slows down writes. Use <code>EXPLAIN ANALYZE</code> to understand query plans and identify bottlenecks. Partial indexes and composite indexes can dramatically improve specific query patterns.</p>
<h2>Connection Pooling</h2>
<p>Web applications open many database connections, and PostgreSQL has overhead per connection. Use a connection pooler like PgBouncer or SQLAlchemy's built-in connection pool to manage connections efficiently. This can increase throughput by 10x in high-traffic scenarios.</p>
<h2>Monitoring and Maintenance</h2>
<p>Use pg_stat_statements to identify slow queries, run VACUUM and ANALYZE regularly, and set up monitoring with tools like pgBadger. A well-maintained PostgreSQL instance can serve millions of requests per day on modest hardware.</p>""",
            },
            {
                "title": "10 Productivity Hacks for Developers",
                "author": alice,
                "category": categories["Career"],
                "tags": [tags["productivity"], tags["career-growth"]],
                "status": PostStatus.PUBLISHED,
                "views": 1821,
                "excerpt": "Boost your developer productivity with these proven techniques. From keyboard shortcuts to deep work strategies, these hacks will help you ship more with less stress.",
                "content": """<h2>1. Master Your Editor</h2>
<p>Your code editor is your primary tool — invest time learning it deeply. Master keyboard shortcuts, learn to use multi-cursor editing, configure snippets for common patterns, and install extensions that fit your workflow. Every minute saved per hour adds up to hours saved per week.</p>
<h2>2. Time-box Your Work</h2>
<p>Use the Pomodoro Technique: work for 25 minutes, take a 5-minute break, repeat. This keeps your focus sharp and prevents burnout. Long unbroken coding sessions often lead to diminishing returns after the first 90 minutes.</p>
<h2>3. Automate Repetitive Tasks</h2>
<p>If you do something more than three times manually, automate it. Write scripts for deployment, code formatting, and test running. Use Makefiles or task runners to standardize your workflow across projects.</p>
<h2>4. Use Version Control Religiously</h2>
<p>Commit small, meaningful changes frequently. Write good commit messages that explain why, not just what. Use branches for features and keep main clean. This makes debugging and collaboration much easier.</p>
<h2>5. Read Documentation First</h2>
<p>Before reaching for Stack Overflow, read the official documentation. Docs are often more accurate and comprehensive than third-party answers. You'll also discover features you didn't know existed.</p>
<h2>6-10. More Productivity Tips</h2>
<p>Use a password manager so you never waste time on credentials. Set up a local development environment that mirrors production. Block distracting sites during deep work sessions. Review and refactor your code regularly — technical debt is productivity debt. Finally, take care of your physical health: sleep, exercise, and breaks directly impact your cognitive performance.</p>""",
            },
            {
                "title": "The Rise of Generative AI",
                "author": bob,
                "category": categories["Artificial Intelligence"],
                "tags": [tags["machine-learning"], tags["deep-learning"], tags["nlp"]],
                "status": PostStatus.PUBLISHED,
                "views": 2105,
                "excerpt": "Generative AI has exploded into mainstream consciousness. From ChatGPT to Midjourney, these models are changing how we create content, write code, and interact with technology.",
                "content": """<h2>What is Generative AI?</h2>
<p>Generative AI refers to artificial intelligence systems that can generate new content — text, images, audio, video, and code — based on patterns learned from training data. Unlike traditional AI that classifies or predicts, generative models create. Large Language Models (LLMs) like GPT-4 and Claude are the most prominent examples.</p>
<h2>The Technology Behind It</h2>
<p>Modern generative AI is powered by transformer architectures, trained on massive datasets using techniques like RLHF (Reinforcement Learning from Human Feedback). These models learn statistical patterns in data and can generate coherent, contextually appropriate content. The scale of these models — billions to trillions of parameters — is what makes them so capable.</p>
<h2>Impact on Industries</h2>
<p>Generative AI is disrupting every industry. In software development, it's writing code and documentation. In marketing, it's generating personalized content at scale. In healthcare, it's assisting with diagnosis and drug discovery. In education, it's creating personalized learning experiences. The speed of adoption is unprecedented in tech history.</p>
<h2>Ethical Considerations</h2>
<p>The power of generative AI comes with serious responsibilities. Misinformation at scale, deepfakes, copyright concerns, and the displacement of creative workers are real challenges. Society needs thoughtful regulation and industry self-governance to ensure these tools benefit humanity broadly.</p>
<h2>Looking Forward</h2>
<p>We're at the beginning of the generative AI revolution. Multimodal models that understand text, images, and audio simultaneously are already here. In the coming years, we'll see AI agents that can take actions, reason over long contexts, and collaborate with humans in increasingly sophisticated ways.</p>""",
            },
            {
                "title": "Building a Healthy Work-Life Balance in Tech",
                "author": priya,
                "category": categories["Lifestyle"],
                "tags": [tags["productivity"], tags["mindfulness"]],
                "status": PostStatus.PUBLISHED,
                "views": 987,
                "excerpt": "The tech industry is notorious for burnout and overwork. Here's how to build a sustainable career while maintaining your health, relationships, and joy outside of work.",
                "content": """<h2>The Burnout Epidemic in Tech</h2>
<p>Tech workers are burning out at alarming rates. The always-connected culture, the pressure to ship fast, and the blurring of work and home boundaries have created a mental health crisis in the industry. Recognizing this is the first step toward change.</p>
<h2>Set Hard Boundaries</h2>
<p>Define clear start and end times for your workday and stick to them. Turn off work notifications after hours. Communicate your boundaries to your team and manager. Remember: your employer is not entitled to your evenings and weekends unless explicitly agreed upon and compensated.</p>
<h2>Invest in Non-Tech Hobbies</h2>
<p>Having interests outside of programming is crucial for mental health and creativity. Physical activities, creative pursuits, and social connections all provide cognitive benefits that actually improve your programming. The best ideas often come while you're doing something completely unrelated to work.</p>
<h2>Practice Mindful Productivity</h2>
<p>Working more hours doesn't always mean getting more done. Focus on deep work — concentrated periods of distraction-free effort — rather than being perpetually busy. Use meditation, journaling, or other mindfulness practices to stay grounded and intentional.</p>
<h2>Build a Support System</h2>
<p>Don't isolate yourself in code. Maintain friendships outside work, nurture your family relationships, and consider therapy or coaching. The tech industry can be isolating, and deliberately building community is essential for long-term wellbeing.</p>""",
            },
            {
                "title": "Exploring the Beauty of the Himalayas",
                "author": priya,
                "category": categories["Travel"],
                "tags": [tags["travel"], tags["mindfulness"]],
                "status": PostStatus.PUBLISHED,
                "views": 642,
                "excerpt": "The Himalayas offer some of the world's most breathtaking landscapes. From the snow-capped peaks of Nepal to the serene valleys of Ladakh, here's everything you need to plan your Himalayan adventure.",
                "content": """<h2>Why the Himalayas?</h2>
<p>The Himalayas are the world's highest mountain range, spanning five countries and containing nine of the ten highest peaks on Earth. Beyond the dramatic scenery, the region offers rich cultural experiences, ancient Buddhist monasteries, and a way of life that feels untouched by modernity. For many travelers, a Himalayan journey is a transformative experience.</p>
<h2>Best Time to Visit</h2>
<p>The best time to trek in the Himalayas depends on your destination. For Nepal (Everest Base Camp, Annapurna), October-November offers clear skies and comfortable temperatures. For Ladakh in India, June-September is ideal when the high mountain passes are open. Avoid monsoon season (July-August) for most trekking regions.</p>
<h2>Top Destinations</h2>
<p>Everest Base Camp in Nepal is the most famous trek, offering jaw-dropping views of the world's highest peak. Annapurna Circuit provides incredible diversity — from subtropical forests to high-altitude desert. In India, Spiti Valley and Ladakh offer otherworldly landscapes and extraordinary Buddhist heritage. Bhutan's Snowman Trek is one of the most challenging and remote treks on the planet.</p>
<h2>Planning and Preparation</h2>
<p>High-altitude trekking requires careful preparation. Physical fitness is essential — start training months before your trip. Altitude sickness is a real risk above 3,000 meters; ascend slowly and know the symptoms. Pack layers for temperature extremes, and invest in quality gear for your boots and sleeping bag.</p>
<h2>A Journey Within</h2>
<p>What makes the Himalayas truly special is how they transform you internally. The silence of the mountains, the hospitality of mountain communities, and the physical challenge of trekking all combine to create an experience that stays with you long after you've returned home. Many travelers find clarity, perspective, and a renewed sense of gratitude after their Himalayan journey.</p>""",
            },
            {
                "title": "Mastering Python Type Hints",
                "author": alice,
                "category": categories["Programming"],
                "tags": [tags["python"], tags["advanced"], tags["tutorial"]],
                "status": PostStatus.PUBLISHED,
                "views": 543,
                "excerpt": "Python type hints make your code more readable, maintainable, and less prone to bugs. This comprehensive guide covers everything from basic annotations to advanced generic types.",
                "content": """<h2>Why Type Hints Matter</h2>
<p>Python is dynamically typed, which gives great flexibility but can lead to hard-to-find bugs. Type hints, introduced in Python 3.5 and improved significantly in 3.10+, allow you to annotate your code with type information. While Python doesn't enforce these at runtime, tools like mypy, pyright, and IDEs use them for static analysis.</p>
<h2>Basic Type Annotations</h2>
<p>Start with simple annotations: <code>name: str</code>, <code>age: int</code>, <code>price: float</code>. For function signatures, annotate both parameters and return types. Use <code>Optional[str]</code> (or <code>str | None</code> in Python 3.10+) for values that might be None. These small changes dramatically improve code readability.</p>
<h2>Collections and Generics</h2>
<p>For collections, use the built-in types directly in Python 3.9+: <code>list[str]</code>, <code>dict[str, int]</code>, <code>tuple[int, ...]</code>. For older Python versions, import from <code>typing</code>: <code>List[str]</code>, <code>Dict[str, int]</code>. Union types can be expressed as <code>int | str</code> in modern Python.</p>
<h2>Pydantic and FastAPI Integration</h2>
<p>Type hints are the foundation of Pydantic models and FastAPI endpoints. Defining your request and response schemas as typed Pydantic models gives you automatic validation, serialization, and documentation. This is where type hints go from optional nicety to essential tool.</p>
<h2>Advanced Patterns</h2>
<p>Protocol classes define structural subtyping (duck typing with type safety). TypeVar enables generic functions. Literal types restrict values to specific constants. NewType creates distinct types from existing ones for added type safety. Mastering these patterns elevates your Python code to a professional level.</p>""",
            },
            {
                "title": "The Art of Mindful Living",
                "author": priya,
                "category": categories["Lifestyle"],
                "tags": [tags["mindfulness"], tags["productivity"]],
                "status": PostStatus.PUBLISHED,
                "views": 438,
                "excerpt": "Mindfulness isn't just meditation — it's a way of engaging with every moment of your life with full attention and awareness. Here's how to bring mindfulness into your everyday routine.",
                "content": """<h2>What Mindfulness Really Means</h2>
<p>Mindfulness has become a buzzword, but its essence is simple: paying attention to the present moment without judgment. It's not about emptying your mind or achieving a special state — it's about noticing what's actually happening, right now, in your thoughts, emotions, and sensations.</p>
<h2>Starting a Mindfulness Practice</h2>
<p>You don't need a special cushion or app to practice mindfulness. Start with five minutes each morning: sit comfortably, close your eyes, and focus on your breath. When your mind wanders (and it will), gently bring attention back without self-criticism. Consistency matters more than duration — five minutes daily beats an hour once a week.</p>
<h2>Mindfulness in Daily Activities</h2>
<p>You can practice mindfulness while doing anything. Eat slowly and notice flavors instead of scrolling through your phone. Walk and observe your surroundings rather than listening to a podcast. Wash dishes with full attention to the sensations of water and soap. These small moments of presence accumulate into a fundamentally different relationship with life.</p>
<h2>The Science Behind It</h2>
<p>Research consistently shows that mindfulness reduces stress, improves focus, and enhances emotional regulation. Regular practice physically changes the brain — increasing gray matter density in areas associated with self-awareness and reducing activity in the default mode network (the "mind-wandering" network).</p>
<h2>Beyond Stress Relief</h2>
<p>Mindfulness isn't just a stress management technique — it's a path to greater aliveness. When you're fully present, ordinary moments become richer. Conversations become more meaningful. Work becomes more engaging. The paradox is that by slowing down and paying attention, you often accomplish more and feel better doing it.</p>""",
            },
            {
                "title": "Cybersecurity Best Practices for Developers",
                "author": alice,
                "category": categories["Cybersecurity"],
                "tags": [tags["security"], tags["web-dev"], tags["advanced"]],
                "status": PostStatus.PUBLISHED,
                "views": 1203,
                "excerpt": "Security is not a feature — it's a foundation. Every developer needs to understand common vulnerabilities and how to prevent them. Here's a practical guide to writing secure code.",
                "content": """<h2>Security is Everyone's Responsibility</h2>
<p>In modern software development, security can't be delegated to a security team and forgotten. Every developer who writes code that handles user data, processes payments, or manages authentication is responsible for security. A single vulnerability can compromise millions of users.</p>
<h2>The OWASP Top 10</h2>
<p>The OWASP Top 10 is the definitive list of the most critical web application security risks. Understanding injection attacks (SQL injection, XSS), broken authentication, insecure deserialization, and security misconfigurations is fundamental knowledge for every developer. Make it your mission to eliminate each of these from your applications.</p>
<h2>Never Trust User Input</h2>
<p>The golden rule of web security: all user input is potentially malicious. Validate on the server side always (not just the client). Use parameterized queries to prevent SQL injection. Sanitize HTML output to prevent XSS. Validate file uploads thoroughly. When in doubt, reject it.</p>
<h2>Secrets Management</h2>
<p>Never commit secrets (API keys, database credentials, JWT secrets) to version control. Use environment variables or secret management services like HashiCorp Vault or AWS Secrets Manager. Rotate secrets regularly. Use different secrets for development, staging, and production environments.</p>
<h2>Authentication and Authorization</h2>
<p>Use bcrypt or argon2 for password hashing — never MD5 or SHA-1. Implement proper session management with secure, httponly cookies. Use JWT carefully and understand its limitations. Implement rate limiting on authentication endpoints. Always verify authorization (not just authentication) before performing sensitive operations.</p>""",
            },
            {
                "title": "Career Growth in the Tech Industry",
                "author": priya,
                "category": categories["Career"],
                "tags": [tags["career-growth"], tags["productivity"]],
                "status": PostStatus.PUBLISHED,
                "views": 876,
                "excerpt": "Navigating a tech career can be overwhelming. Whether you're just starting out or looking to level up, here's a roadmap for sustainable career growth in the technology industry.",
                "content": """<h2>The Non-Linear Tech Career</h2>
<p>Tech careers rarely follow a straight line. You might be a frontend developer who becomes a product manager, or a backend engineer who moves into DevOps. Embrace this non-linearity — the diverse experiences you accumulate make you more valuable and keep your career interesting.</p>
<h2>Building Your Skills Portfolio</h2>
<p>Technical skills are table stakes, but they're not enough. Soft skills — communication, leadership, project management — often determine who advances and who stagnates. Invest equally in both. Build real projects you're proud of. Contribute to open source. Write about what you learn. Your portfolio of work is your best career asset.</p>
<h2>Networking Authentically</h2>
<p>Networking doesn't mean collecting LinkedIn connections. It means building genuine professional relationships. Attend meetups and conferences, contribute to online communities, help others solve problems, and share your knowledge. The opportunities that matter most often come through relationships, not job boards.</p>
<h2>Negotiating Your Worth</h2>
<p>Developers are chronically underpaid partly because they don't negotiate effectively. Always negotiate job offers — companies expect it. Know your market value using resources like Levels.fyi and Glassdoor. Negotiate for total compensation including equity, not just base salary. Don't reveal your current salary if you can avoid it.</p>
<h2>Long-term Career Strategy</h2>
<p>Think in terms of 5-10 year arcs, not just the next job. Decide whether you want to go deep as an individual contributor or broad as an engineering manager — both are valid paths. Consider geography and company stage (startup vs. established company) carefully. Most importantly, optimize for learning and growth, especially early in your career.</p>""",
            },
            {
                "title": "Introduction to Machine Learning with Python",
                "author": bob,
                "category": categories["Artificial Intelligence"],
                "tags": [tags["machine-learning"], tags["python"], tags["beginners"]],
                "status": PostStatus.PUBLISHED,
                "views": 1567,
                "excerpt": "Machine learning doesn't have to be intimidating. This beginner-friendly guide walks you through the fundamentals of ML using Python's most popular libraries.",
                "content": """<h2>What is Machine Learning?</h2>
<p>Machine learning is a subset of artificial intelligence where systems learn from data to make predictions or decisions without being explicitly programmed for each scenario. Instead of writing rules, you feed the algorithm examples and it figures out the patterns. This makes ML powerful for problems where the rules are too complex to specify manually.</p>
<h2>The Python ML Ecosystem</h2>
<p>Python dominates machine learning for good reason: excellent libraries, readable syntax, and a massive community. The core stack is: NumPy for numerical computing, Pandas for data manipulation, Matplotlib/Seaborn for visualization, Scikit-learn for classical ML algorithms, and TensorFlow/PyTorch for deep learning.</p>
<h2>Your First ML Model</h2>
<p>Start with a simple classification problem. Load a dataset (the iris dataset is classic for beginners), split it into training and test sets, choose an algorithm (try a Decision Tree or Random Forest first), fit the model on training data, and evaluate on test data. Scikit-learn makes this remarkably straightforward with its consistent API.</p>
<h2>Understanding Model Evaluation</h2>
<p>Accuracy alone is often misleading. Learn about precision, recall, F1-score, and ROC-AUC for classification problems. For regression, understand RMSE and MAE. Always split your data into train, validation, and test sets. Cross-validation gives more reliable performance estimates. Overfitting (great training performance, poor test performance) is the most common pitfall.</p>
<h2>The Path Forward</h2>
<p>After mastering the basics, explore feature engineering (often more impactful than algorithm choice), hyperparameter tuning, and ensemble methods. Then move into deep learning with neural networks. The field moves fast — follow papers on arXiv, take online courses on Coursera and fast.ai, and build projects to consolidate your learning.</p>""",
            },
            {
                "title": "Modern JavaScript: ES2024 Features",
                "author": alice,
                "category": categories["Programming"],
                "tags": [tags["javascript"], tags["typescript"], tags["web-dev"]],
                "status": PostStatus.PUBLISHED,
                "views": 723,
                "excerpt": "JavaScript continues to evolve rapidly. ES2024 brings powerful new features that make writing modern JavaScript cleaner, more expressive, and more performant.",
                "content": """<h2>The State of Modern JavaScript</h2>
<p>JavaScript has transformed remarkably over the past decade. From a language criticized for its quirks to one of the world's most versatile programming languages, JS now runs everywhere — browsers, servers, mobile apps, edge computing. Each annual ECMAScript release brings features that make the language better.</p>
<h2>Array Grouping</h2>
<p>The new <code>Object.groupBy()</code> and <code>Map.groupBy()</code> methods make it trivially easy to group arrays by a property. Previously, this required reduce() or lodash — now it's a one-liner. This is one of those features you'll use constantly once you know it exists.</p>
<h2>Promise.withResolvers()</h2>
<p>Creating a manually controlled Promise used to require a dance with variables to capture resolve and reject outside the Promise constructor. <code>Promise.withResolvers()</code> returns an object with the Promise and its resolver/rejector, making patterns like deferred promises clean and readable.</p>
<h2>Temporal API Progress</h2>
<p>The Temporal API is a long-awaited replacement for the problematic Date object. It provides immutable, timezone-aware date/time objects with a clean API. While still in proposal stage for most environments, it's coming and will eliminate the need for date libraries like Moment.js and date-fns for most use cases.</p>
<h2>TypeScript as the Standard</h2>
<p>While technically separate from JavaScript, TypeScript has become the de facto standard for serious JavaScript development. If you're not using TypeScript yet, 2024 is the year to start. The tooling support is excellent, the learning curve is manageable, and the productivity benefits are substantial.</p>""",
            },
            {
                "title": "Travel Guide: Southeast Asia on a Budget",
                "author": priya,
                "category": categories["Travel"],
                "tags": [tags["travel"]],
                "status": PostStatus.PUBLISHED,
                "views": 531,
                "excerpt": "Southeast Asia offers some of the world's best travel experiences at incredibly low costs. From the temples of Angkor Wat to the beaches of Thailand, here's how to explore the region on a budget.",
                "content": """<h2>Why Southeast Asia?</h2>
<p>Southeast Asia remains one of the world's best value travel destinations. Your money goes far — excellent food for a few dollars, comfortable guesthouses for $10-20/night, and incredible natural and cultural experiences throughout. Countries like Vietnam, Cambodia, Thailand, and Indonesia each offer distinct flavors while remaining affordable for budget travelers.</p>
<h2>Getting Around</h2>
<p>Budget airlines like AirAsia connect Southeast Asian cities cheaply — book in advance and travel light to avoid baggage fees. Within countries, overnight buses and trains are economical and save on accommodation costs. In cities, grab motorcycles and tuk-tuks for short trips. Learning to use local transit in Bangkok and Kuala Lumpur saves significant money.</p>
<h2>Where to Stay</h2>
<p>Hostels in Southeast Asia range from basic dorms to boutique social spaces with pools. Guesthouses offer private rooms at hostel prices. Airbnb can be good in less touristy areas. Skip the international hotel chains — local accommodation is almost always better value and offers more authentic experiences.</p>
<h2>Eating Well on a Budget</h2>
<p>Street food is Southeast Asia's greatest culinary gift. A bowl of pho in Vietnam, pad thai in Thailand, or nasi goreng in Indonesia costs $1-3 and often surpasses what any restaurant serves. Eat where locals eat — look for plastic chairs, busy stalls, and a lack of English menus. Markets are also excellent for cheap, authentic meals.</p>
<h2>Must-See Highlights</h2>
<p>Don't miss Angkor Wat in Cambodia (sunrise from outside the temple complex is free), Ha Long Bay in Vietnam, Chiang Mai's temple circuit, Ubud in Bali, and the Mekong Delta. Budget for entrance fees at major sites — they add up. The region's natural highlights — beaches, rice terraces, limestone karsts — often require minimal investment to enjoy.</p>""",
            },
            {
                "title": "Getting Started with React and TypeScript",
                "author": alice,
                "category": categories["Web Development"],
                "tags": [tags["react"], tags["typescript"], tags["web-dev"], tags["beginners"]],
                "status": PostStatus.DRAFT,
                "views": 0,
                "excerpt": "React combined with TypeScript creates a powerful development experience. This guide walks you through setting up a React TypeScript project and covers the most important patterns.",
                "content": """<h2>Why React + TypeScript?</h2>
<p>React and TypeScript complement each other perfectly. TypeScript adds static typing to React's component model, catching bugs at compile time, improving IDE support, and making large codebases much more maintainable. The initial setup cost pays back quickly as your project grows.</p>
<h2>Setting Up Your Project</h2>
<p>The fastest way to start is with Vite: <code>npm create vite@latest my-app --template react-ts</code>. This gives you a modern build setup with Hot Module Replacement and TypeScript configured out of the box. Alternatively, Next.js is excellent for server-rendered React applications.</p>
<h2>Component Typing Patterns</h2>
<p>Define your component props with TypeScript interfaces. Use <code>React.FC</code> or just define the props type directly. For children, use <code>React.ReactNode</code>. For event handlers, TypeScript's event types (like <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code>) give you accurate types for event properties.</p>""",
            },
        ]

        created_posts = []
        for i, post_data in enumerate(posts_data):
            slug = slugify(post_data["title"])
            existing = db.query(Post).filter(Post.slug == slug).first()
            if existing:
                created_posts.append(existing)
                continue

            published_at = None
            if post_data["status"] == PostStatus.PUBLISHED:
                # Spread published dates over the past 3 months
                published_at = datetime.now(timezone.utc) - timedelta(days=i * 6 + 2)

            post = Post(
                title=post_data["title"],
                slug=slug,
                excerpt=post_data["excerpt"],
                content=post_data["content"],
                author_id=post_data["author"].id,
                category_id=post_data["category"].id,
                status=post_data["status"],
                views=post_data["views"],
                published_at=published_at,
                created_at=datetime.now(timezone.utc) - timedelta(days=i * 6 + 5),
            )
            post.tags = post_data["tags"]
            db.add(post)
            db.flush()
            created_posts.append(post)
        db.commit()

        # ── Sample Likes ──────────────────────────────────────────────────────
        print("Seeding likes...")
        published_posts = [p for p in created_posts if p.status == PostStatus.PUBLISHED]
        like_combos = []
        for post in published_posts[:10]:
            for user in [alice, bob, priya, admin]:
                like_combos.append((post.id, user.id))

        for post_id, user_id in like_combos:
            existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == user_id).first()
            if not existing:
                db.add(Like(post_id=post_id, user_id=user_id))
        db.commit()

        # ── Sample Bookmarks ──────────────────────────────────────────────────
        print("Seeding bookmarks...")
        for post in published_posts[:6]:
            for user in [alice, priya]:
                existing = db.query(Bookmark).filter(Bookmark.post_id == post.id, Bookmark.user_id == user.id).first()
                if not existing:
                    db.add(Bookmark(post_id=post.id, user_id=user.id))
        db.commit()

        # ── Sample Comments ───────────────────────────────────────────────────
        print("Seeding comments...")
        comment_data = [
            (published_posts[0].id, alice.id, None, "Fantastic overview! AI is definitely changing everything in web development."),
            (published_posts[0].id, priya.id, None, "Great article! I've been using Copilot and it's made me significantly more productive."),
            (published_posts[1].id, bob.id, None, "FastAPI is amazing. The automatic documentation alone is worth switching from Flask."),
            (published_posts[1].id, priya.id, None, "This is exactly the guide I needed when I was starting with FastAPI. Clear and concise!"),
            (published_posts[2].id, alice.id, None, "PostgreSQL's JSONB support is underrated. It gives you the best of relational and document databases."),
            (published_posts[4].id, alice.id, None, "The pace of generative AI is honestly mind-blowing. Great summary of where things stand."),
            (published_posts[4].id, priya.id, None, "I'm both excited and a little nervous about where this is all heading. Important ethical points raised here."),
            (published_posts[5].id, bob.id, None, "Burnout is so real in tech. Setting boundaries saved my mental health."),
            (published_posts[9].id, priya.id, None, "Security is so often an afterthought. Every dev should read this."),
            (published_posts[9].id, bob.id, None, "SQL injection is still the #1 vulnerability in the wild. Parameterized queries, people!"),
        ]

        for post_id, user_id, parent_id, content in comment_data:
            db.add(Comment(post_id=post_id, user_id=user_id, parent_id=parent_id, content=content))
        db.commit()

        print("\n[SUCCESS] Database seeded successfully!")
        print("\nCredentials:")
        print("  Admin:  admin@blogspace.com  /  Admin@123")
        print("  User 1: alice@example.com    /  Demo@123")
        print("  User 2: bob@example.com      /  Demo@123")
        print("  User 3: priya@example.com    /  Demo@123")
        print("\n[IMPORTANT] Change all passwords before any non-local deployment!")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
