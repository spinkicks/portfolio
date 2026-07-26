"""
Monocular depth maps for the reference artwork, via Depth Anything V2 (Large).

Replaces the old per-image colour/texture heuristics: instead of guessing which
pixels are terrain from hue and roughness, we estimate how far every pixel sits
from the camera and let the layer split fall out of that.

Writes <name>-depth.png (16-bit, full source resolution) next to the sources.
"""
import argparse
import json
import os

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

REPO = "onnx-community/depth-anything-v2-large"
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def load_session():
    path = hf_hub_download(REPO, "onnx/model.onnx")
    cfg = json.load(open(hf_hub_download(REPO, "preprocessor_config.json")))
    so = ort.SessionOptions()
    so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    sess = ort.InferenceSession(path, so, providers=["CPUExecutionProvider"])
    return sess, cfg


def patch_round(v: int, patch: int = 14) -> int:
    """DINOv2 needs both sides on its 14px patch grid."""
    return max(patch, int(round(v / patch)) * patch)


def infer(sess, img: Image.Image, size: int, pad: int = 0) -> np.ndarray:
    """Run one forward pass and return the depth at inference scale.

    Aspect ratio is preserved. Squashing 16:9 into a square distorts the scene
    geometry badly enough that the model reads the empty sky corners as nearer
    than the mountain tops, which makes a global depth threshold unusable.

    `pad` mirrors a border into the frame so any residual edge artefact lands on
    padding that gets cropped away.
    """
    w, h = img.size
    nw, nh = patch_round(size), patch_round(size * h / w)
    net = img.resize((nw, nh), Image.Resampling.BICUBIC)

    x = np.asarray(net, dtype=np.float32) / 255.0
    x = (x - MEAN) / STD
    if pad:
        x = np.pad(x, ((pad, pad), (pad, pad), (0, 0)), mode="reflect")
    x = x.transpose(2, 0, 1)[None]  # NCHW

    out = sess.run(None, {sess.get_inputs()[0].name: x})[0]
    d = np.squeeze(out).astype(np.float32)
    if pad:
        d = d[pad:-pad, pad:-pad]
    return d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    # 518 is the training resolution. Larger inputs recover finer ridge detail
    # because DINOv2 interpolates its position embeddings; 1036 is 2x and still
    # a multiple of the 14px patch size.
    ap.add_argument("--size", type=int, default=1036, help="inference width")
    ap.add_argument("--pad", type=int, default=28)
    args = ap.parse_args()

    img = Image.open(args.src).convert("RGB")
    w, h = img.size
    nw, nh = patch_round(args.size), patch_round(args.size * h / w)
    print(f"source {w}x{h} -> inference at {nw}x{nh} (pad {args.pad})")

    sess, cfg = load_session()
    print("input shape:", sess.get_inputs()[0].shape)

    depth = infer(sess, img, args.size, args.pad)
    print(f"raw depth {depth.shape} range {depth.min():.2f}..{depth.max():.2f}")

    # Normalise to 0..1 where 1 = nearest, then lift back to source resolution.
    depth = (depth - depth.min()) / max(depth.max() - depth.min(), 1e-6)
    full = np.asarray(
        Image.fromarray((depth * 65535).astype(np.uint16)).resize(
            (w, h), Image.Resampling.BICUBIC
        )
    )

    Image.fromarray(full).save(args.out)
    print(f"wrote {args.out}  {full.shape[1]}x{full.shape[0]} 16-bit")


if __name__ == "__main__":
    main()
