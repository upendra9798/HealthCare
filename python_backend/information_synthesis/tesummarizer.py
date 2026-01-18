import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# Download NLTK data if not already present
try:
    stopwords.words('english')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def textrank_summarize(text: str, num_sentences: int = 3) -> str:
    """
    Performs extractive summarization using the TextRank algorithm.

    Args:
        text (str): The input text to be summarized.
        num_sentences (int): The desired number of sentences in the summary.
                             Defaults to 3.

    Returns:
        str: The extracted summary.
    """
    if not isinstance(text, str) or not text.strip():
        print("Error: Input text must be a non-empty string.")
        return ""
    if not isinstance(num_sentences, int) or num_sentences <= 0:
        print("Error: num_sentences must be a positive integer.")
        return ""

    # 1. Split the text into sentences
    # Using NLTK's sentence tokenizer for better accuracy
    sentences = nltk.sent_tokenize(text)

    # Handle cases where the text might be too short for the requested summary length
    if num_sentences > len(sentences):
        print(f"Warning: Requested {num_sentences} sentences, but only {len(sentences)} available. Returning all sentences.")
        num_sentences = len(sentences)

    # 2. Preprocess sentences for similarity calculation
    # Remove special characters, convert to lowercase, remove stopwords, and stem words
    stop_words = set(stopwords.words('english'))
    stemmer = PorterStemmer()

    clean_sentences = []
    for sentence in sentences:
        # Remove non-alphabetic characters and split into words
        words = re.sub(r'[^a-zA-Z]', ' ', sentence).lower().split()
        # Remove stopwords and stem words
        words = [stemmer.stem(word) for word in words if word not in stop_words]
        clean_sentences.append(' '.join(words))

    # 3. Create TF-IDF vectors for sentences
    # TF-IDF (Term Frequency-Inverse Document Frequency) reflects the importance of a word
    # in a document relative to a corpus. Here, each sentence is a "document".
    vectorizer = TfidfVectorizer()
    # Fit the vectorizer to the cleaned sentences and transform them into TF-IDF vectors
    sentence_vectors = vectorizer.fit_transform(clean_sentences)

    # 4. Calculate similarity between sentences
    # Compute cosine similarity between all pairs of sentence vectors
    # This creates a similarity matrix where each entry [i, j] is the similarity
    # between sentence i and sentence j.
    similarity_matrix = cosine_similarity(sentence_vectors)

    # 5. Build the TextRank graph and run the algorithm
    # Initialize scores for each sentence (equivalent to PageRank initialization)
    scores = np.ones(len(sentences)) / len(sentences)
    damping_factor = 0.85 # Damping factor for PageRank (probability of following a link)
    num_iterations = 100 # Number of iterations for convergence

    for _ in range(num_iterations):
        # Update scores based on the similarity matrix
        # This is the core PageRank-like update rule
        new_scores = (1 - damping_factor) + damping_factor * np.dot(similarity_matrix.T, scores)
        # Normalize the new scores (optional, but good practice for stability)
        new_scores /= new_scores.sum()
        scores = new_scores

    # 6. Rank sentences and select the top N
    # Create a list of (score, original_sentence_index) tuples
    ranked_sentences = sorted(((scores[i], i) for i, _ in enumerate(sentences)), reverse=True)

    # Get the indices of the top N sentences
    top_sentence_indices = [ranked_sentences[i][1] for i in range(num_sentences)]

    # Sort the indices to maintain the original order of sentences in the summary
    top_sentence_indices.sort()

    # Construct the final summary
    summary_sentences = [sentences[i] for i in top_sentence_indices]
    summary = ' '.join(summary_sentences)

    return summary

# Example Usage:
if __name__ == "__main__":
    long_text = """
    Artificial intelligence (AI) is rapidly transforming various industries, from healthcare to finance.
    Machine learning, a subset of AI, enables systems to learn from data without explicit programming.
    Deep learning, an even deeper subset, utilizes neural networks with multiple layers to uncover intricate patterns.
    These technologies are being used for tasks like image recognition, natural language processing, and predictive analytics.
    The ethical implications of AI, such as bias in algorithms and job displacement, are also a growing concern.
    Researchers are actively working on developing more robust, fair, and transparent AI systems.
    The future of AI holds immense promise for solving complex global challenges, but careful consideration of its societal impact is crucial.
    """

    # Summarize the text into 2 sentences
    summary_2_sentences = textrank_summarize(long_text, num_sentences=2)
    print("--- Summary (2 sentences) ---")
    print(summary_2_sentences)
    print("\n")

    # Summarize the text into 4 sentences
    summary_4_sentences = textrank_summarize(long_text, num_sentences=4)
    print("--- Summary (4 sentences) ---")
    print(summary_4_sentences)
    print("\n")

    # Example with very short text
    short_text = "This is a short test. It has only two sentences."
    summary_short = textrank_summarize(short_text, num_sentences=5)
    print("--- Summary (short text, more sentences requested) ---")
    print(summary_short)
    print("\n")

    # Example with invalid input
    summary_invalid = textrank_summarize("", num_sentences=2)
    print("--- Summary (invalid input) ---")
    print(summary_invalid)
    print("\n")
