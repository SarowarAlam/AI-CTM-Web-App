import os
from transformers import pipeline

class ZeroShotClassifier:
    def __init__(self, model_name="typeform/distilbert-base-uncased-mnli"):
        self.model_name = model_name
        self.pipeline = None
        self.labels = ["billing", "technical", "account", "feature request", "bug", "general inquiry"]
        self.disabled = os.getenv("DISABLE_AI", "false").lower() == "true"

    def _load_model(self):
        if self.disabled:
            return None
        if self.pipeline is None:
            self.pipeline = pipeline(
                "zero-shot-classification",
                model=self.model_name,
                device=-1
            )
        return self.pipeline

    def classify(self, text: str):
        if self.disabled:
            return "general inquiry", 0.0
        pipe = self._load_model()
        result = pipe(text, self.labels, multi_label=False)
        return result['labels'][0], result['scores'][0]

    def update_labels(self, new_labels: list):
        if not self.disabled:
            self.labels = new_labels

classifier = ZeroShotClassifier()