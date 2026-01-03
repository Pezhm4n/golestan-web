import os
import sys
import warnings

# Suppress most TensorFlow logs and Python warnings so STDOUT only contains the prediction
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
warnings.filterwarnings("ignore")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    from predict import predict
except Exception as exc:  # pragma: no cover - import-time failure
    sys.stderr.write(f"ERROR: Failed to import predict.py: {exc}\n")
    sys.exit(1)


def main() -> None:
    if len(sys.argv) != 2:
        sys.stderr.write("Usage: captcha_wrapper.py <image_path>\n")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.isfile(image_path):
        sys.stderr.write(f"ERROR: File not found: {image_path}\n")
        sys.exit(1)

    try:
        with open(image_path, "rb") as f:
            image_content = f.read()
    except Exception as exc:
        sys.stderr.write(f"ERROR: Failed to read image file: {exc}\n")
        sys.exit(1)

    try:
        text = predict(image_content) or ""
    except Exception as exc:
        sys.stderr.write(f"ERROR: Prediction failed: {exc}\n")
        sys.exit(1)

    # IMPORTANT: print only the predicted text to STDOUT
    sys.stdout.write(text.strip() + "\n")
    sys.stdout.flush()


if __name__ == "__main__":
    main()