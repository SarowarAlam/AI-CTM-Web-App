from transformers import pipeline
import torch

class ZeroShotClassifier:
    def __init__(self, model_name="typeform/distilbert-base-uncased-mnli"):
        self.model_name = model_name
        self.pipeline = None   # Lazy load

    def _load_model(self):
        if self.pipeline is None:
            self.pipeline = pipeline(
                "zero-shot-classification",
                model=self.model_name,
                device=-1   # CPU
            )
        return self.pipeline

    def classify(self, text: str):
        pipe = self._load_model()
        # Use a default label list; admin can update later
        labels = ["billing", "technical", "account", "feature request", "bug", "general inquiry"]
        result = pipe(text, labels, multi_label=False)
        return result['labels'][0], result['scores'][0]

    def update_labels(self, new_labels: list):
        self.labels = new_labels

# Singleton
classifier = ZeroShotClassifier()