# Scene layer pipeline

Turns a flat piece of artwork into the three parallax plates that
`app/components/scenes/ArtScene.tsx` stacks.

## Why depth

An earlier version guessed at terrain using per-image colour and texture rules
(teal rim light, blue dominance, surface roughness). It was fragile and it broke
on anything it wasn't hand-tuned for. This version estimates how far each pixel
sits from the camera with [Depth Anything V2][dav2] and cuts bands out of that,
so the same two commands work on any landscape without retuning.

[dav2]: https://github.com/depthanything/depth-anything-v2

## Setup

Runs on ONNX Runtime rather than PyTorch — the model is ~1.3 GB instead of a
2.5 GB torch install, and CPU inference on a 4K source takes about 25 seconds.

```bash
python -m venv .venv
.venv/Scripts/python -m pip install onnxruntime huggingface_hub pillow numpy scipy
```

## Running it

```bash
# 1. depth map (16-bit PNG at source resolution)
python tools/depth.py --src art.jpg --out art-depth.png

# 2. plates
python tools/split-layers.py \
    --src art.jpg --depth art-depth.png \
    --name myscene --outdir public/scenes \
    --far 0.24 --near 0.50 --debug
```

`--debug` writes an overlay with the far mask in red and the near mask in green;
check it before trusting the output.

### Picking `--far` and `--near`

`--far` splits sky from ground, `--near` splits background from foreground. Read
them off the depth map — mid-grey is the ridgeline, near-white is whatever is
closest to camera. The values in use:

| scene       | source                    | `--far` | `--near` |
| ----------- | ------------------------- | ------- | -------- |
| `wireframe` | neon-retrowave-art 4K     | 0.24    | 0.50     |
| `highway`   | highway-outrun-ai 4K      | 0.03    | 0.26     |

## Notes

- **Aspect ratio is load-bearing.** Squashing 16:9 into a square for inference
  distorts the geometry enough that empty sky corners read as nearer than the
  mountain tops, which makes a global threshold useless. `depth.py` keeps the
  ratio and rounds both sides onto DINOv2's 14px patch grid.
- **Plates are nested, not disjoint.** Each runs to the bottom of the frame, so
  a faster foreground uncovers more of the range behind it rather than tearing a
  hole. That is what the column accumulation in `layer_mask` is for.
- **Components must reach the bottom edge.** Ground always does; anything
  floating in the sky is a depth artefact.
- **Transparent regions get blanked** before encoding, after bleeding the edge
  colour outward so downscaling can't pull a dark halo into the silhouette. On
  the wireframe piece this halved the file size.
