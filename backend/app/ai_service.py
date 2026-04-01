from transformers import pipeline
import torch

class ZeroShotClassifier:
    def __init__(self, model_name = "typeform/distilbert-base-uncased-mnli"):
        self.device = 0 if torch.cuda.is_available() else -1
        self.pipeline = pipeline("zero-shot-classification", model=model_name, device=self.device)
        self.labels = ["billing", "technical", "account", "feature request", "bug", "general inquiry"]

    def classify(self, text: str):
        result = self.pipeline(text, self.labels, multi_label=False)
        top_label = result['labels'][0]
        confidence = result['scores'][0]
        return top_label, confidence

    def update_labels(self, new_labels: list):
        self.labels = new_labels

# Singleton instance
classifier = ZeroShotClassifier()