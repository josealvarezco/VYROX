"""Rendimiento IA: a demo of a week's track record, the same numbers for the same date, flagged `simulated`.

VYROX keeps no history (no database, and API-Football's free plan serves only yesterday to tomorrow), so the real
record of VYROX IA's picks cannot be computed: these are demo numbers, and the interface labels them as such.
"""
import random
from datetime import date, timedelta

DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
MARKETS = ["Ambos Anotan", "Más de 2.5 goles", "Más de 1.5 goles", "Gana local", "Doble oportunidad 1X", "Menos de 3.5 goles"]
MATCHES = [
    "Millonarios vs Atlético Nacional",
    "Arsenal vs Chelsea",
    "Real Madrid vs Sevilla",
    "Inter vs Napoli",
    "Boca Juniors vs Racing Club",
    "Bayern München vs Leverkusen",
    "América de Cali vs Junior",
    "PSG vs Lyon",
]


def get_performance(today: date) -> dict:
    """The 7 days before `today`: picks per day, hits and misses, and the KPIs those picks give at a flat stake."""
    picks = []  # (day, match, market, odd, won), oldest first
    for back in range(7, 0, -1):
        day = today - timedelta(days=back)
        rnd = random.Random(day.toordinal())  # a day always draws the same picks
        for _ in range(rnd.randint(4, 8)):
            odd = round(rnd.uniform(1.45, 2.3), 2)
            # A pick wins a little more often than its odd implies: a modest, believable edge.
            picks.append((day, rnd.choice(MATCHES), rnd.choice(MARKETS), odd, rnd.random() < 1.06 / odd))

    won = [pick for pick in picks if pick[4]]
    roi = (sum(pick[3] for pick in won) - len(picks)) / len(picks) * 100
    return {
        "simulated": True,
        "kpis": {
            "win_rate": round(100 * len(won) / len(picks)),
            "avg_odd": round(sum(pick[3] for pick in picks) / len(picks), 2),
            "roi": f"{roi:+.1f}%",
        },
        "daily_trend": [
            {
                "day": DAYS[day.weekday()],
                "won": sum(1 for pick in picks if pick[0] == day and pick[4]),
                "lost": sum(1 for pick in picks if pick[0] == day and not pick[4]),
            }
            for day in sorted({pick[0] for pick in picks})
        ],
        "recent_hits": [
            {"match": match, "market": market, "odd": odd, "date": day.strftime("%d/%m")}
            for day, match, market, odd, _ in reversed(won[-3:])
        ],
    }
