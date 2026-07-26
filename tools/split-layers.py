"""
Cut a reference image into stacked parallax plates using its depth map.

Each source becomes three plates that are *nested* rather than disjoint:

  <name>-sky.webp   opaque, terrain removed and the sky continued downward
  <name>-far.webp   everything from the terrain silhouette down
  <name>-near.webp  everything from the foreground silhouette down

Nesting matters. Every plate runs to the bottom of the frame, so when the near
plate travels further than the far plate it uncovers more of the far plate
underneath instead of tearing a hole in the scene. That is why the masks are
column-accumulated: once a column enters a layer it stays in it all the way
down.

Depth comes from tools/depth.py (Depth Anything V2). The raw map is inferred at
1036px and upsampled, which leaves silhouettes soft, so it gets guided-filtered
against the source luminance to snap edges back onto the artwork's own contours.
"""
import argparse
import os

import numpy as np
from PIL import Image
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None


def box(a, r):
    return ndimage.uniform_filter(a, size=2 * r + 1, mode="nearest")


def guided_filter(guide, src, r=8, eps=1e-4):
    """Edge-preserving refinement of `src` using `guide` (He et al. 2010).

    Pulls the blurry upsampled depth back onto the high-frequency edges that
    exist in the full-resolution artwork.
    """
    mean_g, mean_s = box(guide, r), box(src, r)
    cov = box(guide * src, r) - mean_g * mean_s
    var = box(guide * guide, r) - mean_g * mean_g
    a = cov / (var + eps)
    b = mean_s - a * mean_g
    return box(a, r) * guide + box(b, r)


def layer_mask(depth, thresh, min_blob, feather):
    """Binary mask of 'at least this near', accumulated to the bottom.

    Speckle is cleared *before* accumulation: one stray near-pixel high in a
    column would otherwise flood that entire column downward.

    Components are also required to reach the bottom of the frame. Ground
    always does in these compositions, so anything floating in the sky is a
    depth artefact, typically a patch of empty sky in a corner that the model
    reads as nearer than a distant ridge.
    """
    m = depth >= thresh
    m = ndimage.binary_opening(m, np.ones((3, 3)))

    lab, n = ndimage.label(m)
    if n:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        grounded = set(np.unique(lab[-1])) - {0}
        keep = np.zeros(n + 1, bool)
        for i in range(1, n + 1):
            keep[i] = sizes[i - 1] >= min_blob and i in grounded
        m = keep[lab]

    m = ndimage.binary_closing(m, np.ones((9, 9)))
    m = np.maximum.accumulate(m, axis=0)

    alpha = m.astype(np.float32)
    if feather > 0:
        alpha = ndimage.gaussian_filter(alpha, feather)
    return alpha


def extend_sky(rgb, terrain_alpha):
    """Continue the sky downward behind the terrain.

    Only ever seen through the feathered silhouette edge, since the far plate covers
    the rest at every scroll position, so a per-column continuation of the last
    clear sky row is enough, and it keeps the sun's colour correct at the seam.
    """
    h, w, _ = rgb.shape
    solid = terrain_alpha > 0.5
    out = rgb.copy()

    # First terrain row per column; columns with no terrain stay untouched.
    has = solid.any(axis=0)
    first = np.where(has, solid.argmax(axis=0), h)

    for c in np.flatnonzero(has):
        y0 = first[c]
        if y0 <= 2:
            continue
        src = rgb[max(0, y0 - 6) : y0, c].mean(axis=0)
        out[y0:, c] = src

    # Break up the vertical streaking a touch.
    return ndimage.gaussian_filter(out, (9, 3, 0))


def flatten_transparent(rgb, alpha, bleed=10):
    """Blank the RGB under fully transparent pixels so WebP can collapse it.

    A plate is mostly empty sky above its silhouette, but WebP still encodes
    colour there, which on the wireframe piece cost more than the visible
    artwork did. The edge colour is first bled outward by `bleed` pixels so
    downscaling never samples the blanked area into the silhouette and leaves a
    dark halo.
    """
    solid = alpha > 0.004
    if solid.all():
        return rgb

    near = ndimage.binary_dilation(solid, np.ones((3, 3)), iterations=bleed)
    _, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True)

    out = np.where(solid[..., None], rgb, rgb[iy, ix])
    return out * near[..., None]


def save(rgb, alpha, path, quality):
    if alpha is not None:
        rgb = flatten_transparent(rgb, alpha)

    arr = np.clip(rgb, 0, 255).astype(np.uint8)
    if alpha is None:
        Image.fromarray(arr, "RGB").save(path, "WEBP", quality=quality, method=6)
    else:
        a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(np.dstack([arr, a]), "RGBA").save(
            path, "WEBP", quality=quality, method=6, exact=True
        )
    kb = os.path.getsize(path) / 1024
    print(f"  wrote {os.path.basename(path)}  {kb:,.0f} KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--depth", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--far", type=float, required=True, help="sky|terrain depth cut")
    ap.add_argument("--near", type=float, required=True, help="far|near depth cut")
    ap.add_argument("--width", type=int, default=3840)
    ap.add_argument("--quality", type=int, default=92)
    ap.add_argument("--min-blob", type=int, default=4000)
    ap.add_argument("--feather", type=float, default=1.5)
    ap.add_argument("--debug", action="store_true")
    args = ap.parse_args()

    img = Image.open(args.src).convert("RGB")
    if img.width != args.width:
        h = round(img.height * args.width / img.width)
        img = img.resize((args.width, h), Image.Resampling.LANCZOS)
    rgb = np.asarray(img, dtype=np.float32)
    h, w, _ = rgb.shape

    d = Image.open(args.depth)
    if d.size != (w, h):
        d = d.resize((w, h), Image.Resampling.BICUBIC)
    depth = np.asarray(d, dtype=np.float32) / 65535.0

    print(f"{args.name}: {w}x{h}  cuts far={args.far} near={args.near}")

    lum = (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255.0
    depth = np.clip(guided_filter(lum, depth), 0, 1)

    far_a = layer_mask(depth, args.far, args.min_blob, args.feather)
    near_a = layer_mask(depth, args.near, args.min_blob, args.feather)
    print(f"  coverage far={far_a.mean():.1%} near={near_a.mean():.1%}")

    sky = extend_sky(rgb, far_a)

    save(sky, None, f"{args.outdir}/{args.name}-sky.webp", args.quality)
    save(rgb, far_a, f"{args.outdir}/{args.name}-far.webp", args.quality)
    save(rgb, near_a, f"{args.outdir}/{args.name}-near.webp", args.quality)

    if args.debug:
        ov = rgb.copy()
        ov[..., 0] = np.maximum(ov[..., 0], far_a * 255)
        ov[..., 1] = np.maximum(ov[..., 1], near_a * 255)
        Image.fromarray(ov.astype(np.uint8)).resize((1600, round(1600 * h / w))).save(
            f"{args.outdir}/{args.name}-debug.png"
        )
        print(f"  wrote {args.outdir}/{args.name}-debug.png")


if __name__ == "__main__":
    main()
