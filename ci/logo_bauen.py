#!/usr/bin/env python3
"""Baut das Tanneberger-Zeichen (Tanne im offenen Goldring) als Vektor nach der Visitenkarte.

Ausgabe: zeichen-pfade.txt (Tanne + Ring für index.html), zeichen.svg, logo-hell.svg, logo-dunkel.svg, favicon.svg.
Maße aus der Visitenkarte gemessen (Tannenmitte, Stufen-Spitzen, Stamm, Ring), Koordinaten 0..200.
Aufruf: python3 ci/logo_bauen.py
"""
import base64, math, pathlib

HIER = pathlib.Path(__file__).resolve().parent
GRUEN, GOLD, GOLD_HELL, CREME = "#152C22", "#B98A3E", "#D9B56A", "#F8F6F0"

# Stufen (gemessen auf der Karte, Pixel): y der Astspitze, halbe Breite an der Spitze. Einzug ≈ 16 px tiefer, ≈ halbe Breite.
S = 200 / 344  # Ringdurchmesser auf der Karte ≈ 344 px → 200 Einheiten
STUFEN = [(170, 24), (196, 40), (226, 60), (264, 76), (304, 96), (346, 116), (392, 118)]
MX, SPITZE, RING_OBEN, STAMM = 100, 124, 88, (11, 398, 419)


def tanne() -> str:
    """Rechte Hälfte als Punktfolge (Spitze → Stamm), dann gespiegelt zurück. Jede Stufe: hohle Flanke nach außen-unten
    zur hängenden Astspitze, Unterseite zurück zum Einzug – wie die gezeichnete Tanne der Karte."""
    def p(x, y):
        return f"{MX + x * S:.1f} {(y - RING_OBEN) * S:.1f}"
    teile, w0, y0 = [], 0, SPITZE
    for i, (ys, ws) in enumerate(STUFEN):
        letzte = i == len(STUFEN) - 1
        yn, wn = (STAMM[1], STAMM[0]) if letzte else (ys + 16, ws * .5)
        teile.append((w0 + (ws - w0) * .3, ys - 3, ws, ys))                     # Flanke hohl, Spitze hängt
        teile.append((ws * .72, ys - 1, wn, yn))                                  # Unterseite zum Einzug
        w0, y0 = wn, yn
    rechts = " ".join(f"Q{p(cx, cy)} {p(x, y)}" for cx, cy, x, y in teile)
    links = []
    punkte = [(0, SPITZE)] + [(x, y) for _, _, x, y in teile]
    for k in range(len(teile) - 1, -1, -1):
        cx, cy, _, _ = teile[k]
        zx, zy = punkte[k]
        links.append(f"Q{p(-cx, cy)} {p(-zx, zy)}")
    stamm = f"L{p(STAMM[0], STAMM[2])} L{p(-STAMM[0], STAMM[2])} L{p(-STAMM[0], STAMM[1])}"
    return f"M{p(0, SPITZE)} {rechts} {stamm} {' '.join(links)} Z"


def ring() -> str:
    # offener Ring, Lücke unten (Enden ca. 48° unter der Waagrechten), Mitte (100,100), r 96
    r, a = 96, math.radians(48)
    x1, y1 = 100 - r * math.cos(a), 100 + r * math.sin(a)
    x2, y2 = 100 + r * math.cos(a), 100 + r * math.sin(a)
    return f"M{x1:.1f} {y1:.1f} A{r} {r} 0 1 1 {x2:.1f} {y2:.1f}"


def zeichen_svg(gruen=GRUEN, gold=GOLD, rand=8):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-{rand} -{rand} {200 + 2 * rand} {200 + 2 * rand}">'
            f'<path d="{ring()}" fill="none" stroke="{gold}" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="{tanne()}" fill="{gruen}"/></svg>')


def logo_svg(grund, gruen, gold, schrift_b64):
    font = f"@font-face{{font-family:M;src:url(data:font/woff2;base64,{schrift_b64}) format('woff2');font-weight:100 900}}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><style>{font}</style>'
            f'<rect width="640" height="400" fill="{grund}"/>'
            f'<g transform="translate(250 20) scale(.7)"><path d="{ring()}" fill="none" stroke="{gold}" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="{tanne()}" fill="{gruen}"/></g>'
            f'<text x="320" y="300" text-anchor="middle" font-family="M" font-weight="800" font-size="64" letter-spacing="1" fill="{gruen}">TANNEBERGER</text>'
            f'<path d="M110 340h110M420 340h110" stroke="{gold}" stroke-width="2.5"/>'
            f'<text x="322" y="352" text-anchor="middle" font-family="M" font-weight="600" font-size="30" letter-spacing="13" fill="{gold}">SERVICE</text></svg>')


if __name__ == "__main__":
    schrift = base64.b64encode((HIER.parent / "fonts/montserrat.woff2").read_bytes()).decode()
    (HIER / "zeichen-pfade.txt").write_text(f"ring: {ring()}\ntanne: {tanne()}\n")
    (HIER / "zeichen.svg").write_text(zeichen_svg())
    (HIER / "zeichen-dunkel.svg").write_text(zeichen_svg(gruen=CREME, gold=GOLD_HELL))
    (HIER / "logo-hell.svg").write_text(logo_svg(CREME, GRUEN, GOLD, schrift))
    (HIER / "logo-dunkel.svg").write_text(logo_svg(GRUEN, CREME, GOLD_HELL, schrift))
    (HIER / "favicon.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 228 228"><rect x="-14" y="-14" width="228" height="228" rx="48" fill="{GRUEN}"/>'
        f'<path d="{ring()}" fill="none" stroke="{GOLD_HELL}" stroke-width="10" stroke-linecap="round"/><path d="{tanne()}" fill="{CREME}"/></svg>')
    print("ok:", ", ".join(sorted(p.name for p in HIER.glob("*.svg"))))
