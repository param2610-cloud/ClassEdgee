import sqlite3
import datetime
import pandas as pd
from transformers import pipeline

# 1. Database Setup
# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect("chatbot_data.db")
cursor = conn.cursor()

# Create tables for storing user data, interaction history, and performance data
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        grade_level TEXT
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS interactions (
        interaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question TEXT,
        response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS performance (
        performance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        topic TEXT,
        score REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
    )
''')

conn.commit()

# 2. NLP Module Setup
# Initialize the NLP pipeline using Hugging Face's transformers
nlp_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")


def get_response(question, context):
    """Generates a response based on the question and context."""
    response = nlp_pipeline({
        'question': question,
        'context': context
    })
    return response['answer']

# 3. Chatbot Interaction Function
def handle_interaction(user_id, question):
    """Handles user interaction, stores the interaction in the database, and generates a response."""
    # Define the context (in a real scenario, this should be dynamic and related to the subject/topic)
    context = "The laws of motion state that an object at rest will remain at rest, and an object in motion will remain in motion unless acted upon by an external force."
    
    # Get the response from the NLP model
    response = get_response(question, context)
    
    # Store the interaction in the database
    cursor.execute('''
        INSERT INTO interactions (user_id, question, response, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (user_id, question, response, datetime.datetime.now()))
    conn.commit()
    
    return response

# 4. Performance Analysis Function
def analyze_performance(user_id):
    """Analyzes the user's performance data to identify any learning gaps."""
    # Fetch user performance data from the database
    cursor.execute("SELECT topic, score FROM performance WHERE user_id = ?", (user_id,))
    data = cursor.fetchall()
    
    # Convert data to a DataFrame for easier analysis
    df = pd.DataFrame(data, columns=['topic', 'score'])
    
    # Calculate average scores by topic
    avg_scores = df.groupby("topic").mean()
    
    # Identify topics where the score is below the threshold (e.g., below 70%)
    gaps = avg_scores[avg_scores['score'] < 0.7]
    
    return gaps

def provide_feedback(user_id):
    """Generates feedback based on the user's learning gaps."""
    gaps = analyze_performance(user_id)
    feedback = []
    
    # Provide feedback for topics with performance gaps
    for topic in gaps.index:
        feedback.append(f"You may need to review {topic} as your average score is below the threshold.")
    
    return feedback

# 5. Chatbot Main Function
def chatbot(user_id, question):
    """Main function to handle the chatbot interaction and provide feedback if needed."""
    # Get the chatbot response
    response = handle_interaction(user_id, question)
    
    # Generate personalized feedback based on performance
    feedback = provide_feedback(user_id)
    
    # Combine the response and feedback
    feedback_message = "\n".join(feedback) if feedback else "You're doing great! Keep up the good work."
    
    return response, feedback_message

# 6. Example Usage
if __name__ == "__main__":
    # Example user_id (1) for testing the chatbot
    user_id = 1
    
    # Example question for the chatbot
    question = "Can you explain Newton's laws of motion?"
    
    # Get the chatbot's response and feedback
    response, feedback = chatbot(user_id, question)
    
    # Print the chatbot response and feedback
    print("Chatbot response:", response)
    print("Feedback:", feedback)