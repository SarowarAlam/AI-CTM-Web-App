from transformers import pipeline

class ZeroShotClassifier:
    def __init__(self, model_name="typeform/distilbert-base-uncased-mnli"):
        self.model_name = model_name
        self.pipeline = None   # Lazy load
        # Define default labels as an instance attribute
        self.labels = ["billing", "technical", "account", "feature request", "bug", "general inquiry"]

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
        # Use the instance's labels
        result = pipe(text, self.labels, multi_label=False)
        return result['labels'][0], result['scores'][0]

    def update_labels(self, new_labels: list):
        self.labels = new_labels

# Singleton
classifier = ZeroShotClassifier()