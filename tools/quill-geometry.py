"""Generates the plume's vane outlines and barbs for src/PlumeCursor.tsx.

The feather is geometry, not hand-drawn path data: widths follow a smoothed
profile along the shaft, barbs rake back toward the quill end, and a small
deterministic jitter keeps the outer edge from reading as a perfect arc.
Edit the profiles here and paste the output into the component, rather than
editing the path strings by hand.

    python3 tools/quill-geometry.py
"""
import math

A = (9.4, 41.5)   # where the vanes begin, on the shaft
B = (28.0, 3.6)   # feather tip
dx, dy = B[0] - A[0], B[1] - A[1]
L = math.hypot(dx, dy)
d = (dx / L, dy / L)
nL = (-0.8975, -0.4410)   # up-left of the shaft: the wide vane
nR = (0.8975, 0.4410)     # down-right: the narrow vane

# Fullness sits high on the feather; both vanes end in a soft cap, not a point.
WIDE = [(0, 0), (0.07, 1.7), (0.24, 3.3), (0.44, 4.3), (0.62, 4.75), (0.78, 4.35), (0.90, 3.2), (0.97, 1.9), (1, 0.9)]
NARROW = [(0, 0), (0.09, 1.15), (0.30, 2.15), (0.52, 2.5), (0.70, 2.35), (0.85, 1.7), (0.95, 1.0), (1, 0.6)]


def P(t):
    """A point on the shaft. The reference feather curves, so the shaft bows."""
    bow = 1.75 * math.sin(math.pi * t ** 0.92)
    return (A[0] + dx * t + nL[0] * bow, A[1] + dy * t + nL[1] * bow)


def profile(points, t):
    for i in range(len(points) - 1):
        t0, w0 = points[i]
        t1, w1 = points[i + 1]
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0)
            return w0 + (w1 - w0) * (u * u * (3 - 2 * u))   # smoothstep
    return 0.0


def jitter(t, seed):
    return 0.11 * math.sin(t * 39.1 + seed) + 0.07 * math.sin(t * 73.7 + seed * 2.3)


def outer(points, normal, seed, steps=30):
    edge = []
    for i in range(steps + 1):
        t = i / steps
        w = profile(points, t) + (jitter(t, seed) if 0.05 < t < 0.95 else 0)
        p = P(t)
        edge.append((p[0] + normal[0] * w, p[1] + normal[1] * w))
    return edge


def catmull(points):
    """Catmull-Rom through the points, emitted as cubic beziers."""
    out = ["M%.2f %.2f" % points[0]]
    ext = [points[0]] + points + [points[-1]]
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out.append("C%.2f %.2f %.2f %.2f %.2f %.2f" % (c1 + c2 + p2))
    return "".join(out)


def vane(points, normal, seed):
    """Tip, out along the edge, then back up the shaft to close."""
    back = catmull([P(t) for t in (1.0, 0.8, 0.6, 0.4, 0.2, 0.0)]).replace("M", "L", 1)
    return catmull(outer(points, normal, seed)[::-1]) + back + "Z"


def barbs(points, normal, count, reach=0.92, rake=0.5, lo=0.06, hi=0.97):
    out = []
    for i in range(count):
        t = lo + (hi - lo) * i / (count - 1)
        w = profile(points, t)
        if w < 0.45:
            continue
        p = P(t)
        start = (p[0] + normal[0] * 0.4, p[1] + normal[1] * 0.4)
        end = (p[0] + normal[0] * w * reach - d[0] * w * rake,
               p[1] + normal[1] * w * reach - d[1] * w * rake)
        control = ((start[0] + end[0]) / 2 + d[0] * w * 0.18,
                   (start[1] + end[1]) / 2 + d[1] * w * 0.18)
        out.append('<path d="M%.2f %.2fQ%.2f %.2f %.2f %.2f" />' % (start + control + end))
    return out


if __name__ == "__main__":
    print("=== wide vane ===\n" + vane(WIDE, nL, 1.7))
    print("\n=== narrow vane ===\n" + vane(NARROW, nR, 4.3))
    print("\n=== wide barbs ===\n" + "\n".join(barbs(WIDE, nL, 15)))
    print("\n=== narrow barbs ===\n" + "\n".join(barbs(NARROW, nR, 12)))
    # The shaft stops short of the tip so the outlines do not converge to a spike.
    body = catmull([P(t) for t in (0, 0.2, 0.4, 0.6, 0.78, 0.92)])
    print("\n=== shaft ===\nM5.90 48.90C7.30 46.30 8.60 43.90 9.40 41.50" + body[body.index("C"):])
