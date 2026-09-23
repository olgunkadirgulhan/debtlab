# DebtLab — Sıralı, Ücretsiz ve Tam Otomatik Kurulum Planı

> Sıra: **1) YouTube kanalı → 2) Web sitesi → 3) Mobil uygulamalar**
> Hedef: Bir kez kur, bilgisayarı kapat, sistem bulutta kendi kendine çalışsın.

---

## 0. Önce Gerçekler (okumadan geçme)

"Tamamen ücretsiz + tamamen otomatik" hedefinin **%90'ı** mümkün. Kalan %10 için net durum:

| Konu | Durum | Çözüm |
|---|---|---|
| Sunucu | Bilgisayarın kapalıyken çalışacak yer lazım | **GitHub Actions** (cron). Sunucu yok, bakım yok, ücretsiz. |
| YouTube API ile yükleme | Doğrulanmamış (audit'siz) API projesiyle yüklenen videolar **private kilitlenir** | Faz 1'in ilk günü **YouTube API Compliance Audit** formunu gönder. Onay gelene kadar sistem video üretip kuyrukta tutar. |
| OAuth token | Consent ekranı "Testing" modunda kalırsa refresh token **7 günde ölür** | Consent ekranını **"In production"** yap (kişisel kullanım için doğrulamasız olur). |
| Claude API / ElevenLabs / HeyGen | Ücretli | **Gemini API free tier** (metin) + **Kokoro/Piper TTS** (açık kaynak ses) + **avatarsız, grafik/animasyon tabanlı video** |
| Vercel Hobby | Ticari kullanım (AdSense, affiliate) yasak | **Cloudflare Pages** (ücretsiz, ticari kullanım serbest) |
| `debtlab.ai` domain | .ai pahalı (min. 2 yıl kayıt) | Başlangıç: `debtlab.pages.dev` (ücretsiz) → gelir gelince `.com` (~10$/yıl) |
| Google Play | 25$ tek sefer | Kaçınılmaz. **Estonya şirketinle "Organization" hesabı** aç → 12 tester / 14 gün kuralından muaf olursun (D-U-N-S numarası gerekir, ücretsiz ama ~30 gün sürebilir → **şimdi başvur**). |
| Apple App Store | 99$/yıl + macOS build | iOS'u gelir gelene kadar **ertele**. Build'i GitHub'ın macOS runner'ı yapar. |
| Monetizasyon riski | YouTube "inauthentic/tekrarlayan içerik" politikası şablon üretimi cezalandırır | Her video **gerçek hesaplama + gerçek grafik** içerecek (aşağıda). 1000 aynı-kalıp video yerine günde 2 kaliteli video. |

**Tek seferlik manuel işler** (otomatikleştirilemez, toplam ~1 gün): hesap açmak, API anahtarı almak, audit formu, AdSense/AdMob başvurusu, mağaza listeleme. Bunlardan sonra her şey akar.

---

## Mimari (bilgisayar kapalıyken nasıl çalışır)

```
GitHub repo: debtlab/
│
├── .github/workflows/
│   ├── shorts.yml        ← Günde 2x: script → ses → video → YouTube
│   ├── blog.yml          ← Haftada 3x: makale yaz → commit → site otomatik deploy
│   └── app-release.yml   ← Tag atılınca: Flutter build → Play Store
│
├── youtube/              ← Faz 1
├── web/                  ← Faz 2 (Next.js, static export)
├── app/                  ← Faz 3 (Flutter)
└── shared/
    ├── links.json        ← TÜM cross-promo linkleri tek yerde
    └── debt_math.py      ← Snowball/avalanche hesap motoru (video + site aynı mantık)
```

**`shared/links.json`** — faz ilerledikçe sadece burayı güncellersin, tüm videolar/sayfalar otomatik yeni linki kullanır:

```json
{
  "website": "",
  "play_store": "",
  "app_store": "",
  "affiliate_experian": "AFFILIATE_LINK_EXPERIAN",
  "youtube_channel": "https://youtube.com/@DebtLabAI"
}
```

Boş alanlar CTA'da gösterilmez. Örn. Faz 1'de açıklama sadece "Subscribe" der; Faz 2'de `website` dolunca tüm yeni videolar "Free debt plan: debtlab…" yazar.

---

# FAZ 1 — YOUTUBE KANALI (Hafta 1–3)

## 1.1 Tek seferlik kurulum (manuel, ~3 saat)

1. [ ] Yeni Google hesabı → YouTube kanalı: **DebtLab AI** (@DebtLabAI). Logo, banner, açıklama.
2. [ ] Google Cloud Console → yeni proje → **YouTube Data API v3** etkinleştir.
3. [ ] OAuth consent screen → External → **Publish app ("In production")**.
4. [ ] OAuth Client ID (Desktop app) → bir kez yerelde çalıştır, **refresh token** al.
5. [ ] **API Audit formunu gönder** (YouTube API Services – Audit and Quota Extension Form). Kullanım: "Kendi kanalıma kendi ürettiğim eğitim videolarını otomatik yüklüyorum."
6. [ ] Google AI Studio → **Gemini API key** (ücretsiz).
7. [ ] Pexels API key (ücretsiz stok görsel/video, opsiyonel).
8. [ ] GitHub → **private** repo `debtlab` → Settings → Secrets:
   - `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`
   - `GEMINI_API_KEY`, `PEXELS_API_KEY`

## 1.2 İçerik stratejisi (monetizasyonu koruyan kısım)

Her video bir **gerçek senaryo hesabı** içerir → YouTube gözünde "şablon spam" değil, değerli içerik.

`youtube/topics.csv` (script üretir, ~600 satır; tekrar etmeyen kombinasyonlar):

| title | pillar | balance | apr | min_payment |
|---|---|---|---|---|
| $5,000 credit card debt at 24% APR? Do this | debt_scenario | 5000 | 24 | 150 |
| Snowball vs Avalanche on $20K — which wins? | calculation | 20000 | 19 | 500 |
| 5 mistakes that drop your credit score 100 points | credit_mistake | – | – | – |
| Paying only the minimum on $10K takes HOW long? | hack | 10000 | 22 | 250 |

Varyasyon eksenleri: bakiye (1K–50K), APR (15–29), ödeme miktarı, borç sayısı (1–5), strateji. Başlık kalıbı en az 15 farklı tip.

## 1.3 Pipeline (her çalışmada)

```
topics.csv'den kullanılmamış satır seç
 → debt_math.py: gerçek hesap (payoff süresi, toplam faiz, tasarruf)
 → Gemini: 110–130 kelime script (hesap sonuçları prompt'a gömülü → sayılar uydurulmaz)
 → Kokoro TTS: ses (.wav)
 → faster-whisper: kelime zamanlaması → karaoke altyazı
 → Remotion/FFmpeg: 1080x1920 video
     • 0–3 sn: büyük hook yazısı + sayı
     • orta: animasyonlu bakiye düşüş grafiği (gerçek veri)
     • son 3 sn: CTA kartı (links.json'dan)
     • alt bant: "Educational only. Not financial advice."
 → YouTube API upload (title, description, tags, #Shorts)
 → published.csv'ye yaz, commit et
```

> Not: Her çalışmada repoya commit atılması, GitHub'ın 60 gün hareketsiz repo cron'larını durdurma kuralını da engeller.

## 1.4 Gemini prompt

```
You are a friendly personal-finance educator. Write a 45-second YouTube Shorts
voiceover (110-130 words) for the title: "{title}".
Use ONLY these computed facts, never invent numbers:
{facts_json}
Structure: hook in first sentence (under 12 words) → the math → one actionable tip
→ CTA: "{cta_text}".
No guarantees, no "you will", say "could". Plain spoken English. No emojis.
Output only the script.
```

## 1.5 `shared/debt_math.py` (çekirdek hesap)

```python
def payoff(balance, apr, payment, max_months=600):
    r = apr / 100 / 12
    months, interest = 0, 0.0
    while balance > 0 and months < max_months:
        i = balance * r
        if payment <= i:
            return None  # asla bitmez
        interest += i
        balance = balance + i - payment
        months += 1
    return {"months": months, "total_interest": round(interest, 2)}

def compare(balance, apr, min_pay, extra):
    base = payoff(balance, apr, min_pay)
    fast = payoff(balance, apr, min_pay + extra)
    return {
        "min_only": base, "with_extra": fast,
        "months_saved": base["months"] - fast["months"],
        "interest_saved": round(base["total_interest"] - fast["total_interest"], 2),
    }
```

(Çoklu borç için snowball/avalanche aynı dosyada: her ay tüm minimumları öde, fazlayı sıralamaya göre ilk borca ver.)

## 1.6 `.github/workflows/shorts.yml`

```yaml
name: shorts
on:
  schedule:
    - cron: "0 13 * * *"   # 16:00 TR = 09:00 ABD Doğu
    - cron: "0 23 * * *"   # 02:00 TR = 19:00 ABD Doğu
  workflow_dispatch:

permissions:
  contents: write

jobs:
  make-and-upload:
    runs-on: ubuntu-latest
    timeout-minutes: 40
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - name: Cache models
        uses: actions/cache@v4
        with:
          path: ~/.cache
          key: models-v1
      - run: sudo apt-get update && sudo apt-get install -y ffmpeg
      - run: pip install -r youtube/requirements.txt
      - run: cd youtube/render && npm ci
      - name: Run pipeline
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          YT_CLIENT_ID: ${{ secrets.YT_CLIENT_ID }}
          YT_CLIENT_SECRET: ${{ secrets.YT_CLIENT_SECRET }}
          YT_REFRESH_TOKEN: ${{ secrets.YT_REFRESH_TOKEN }}
        run: python youtube/run.py
      - name: Commit log
        run: |
          git config user.name "debtlab-bot"
          git config user.email "bot@users.noreply.github.com"
          git add youtube/published.csv youtube/queue/ || true
          git commit -m "short: $(date -u +%F-%H%M)" || echo "nothing"
          git push
```

**Private repo bütçesi:** ayda 2.000 dk ücretsiz. 1 video ≈ 6–10 dk → günde 2 video ≈ 600 dk/ay. Rahat.

## 1.7 Hata dayanıklılığı (otomatik)

- `run.py` her adımı try/except ile sarar; hata olursa videoyu `queue/`'ya bırakır, sonraki çalışma önce kuyruğu yükler.
- Audit onayı gelmediyse: videolar `queue/`'da birikir (ya da `privacyStatus: private` ile yüklenir). Onay gelince `PUBLIC=true` secret'ını ekle, biriken kuyruk otomatik yayına çıkar.
- GitHub, workflow başarısız olunca e-posta atar → telefonundan görürsün.
- Kota: YouTube upload kotası 2026'da değişti; günlük 2 video her senaryoda kotanın çok altında. Yine de `run.py` kota hatasında o günü durdurup ertesi güne bırakır.

## 1.8 Faz 1 bitti kriteri

- [ ] 7 gün üst üste insan müdahalesi olmadan 2 video/gün
- [ ] Audit onaylandı, videolar public
- [ ] İlk 30 videonun izlenme verisi → en iyi 3 pillar'a ağırlık ver (`topics.csv` sırasını değiştir)

---

# FAZ 2 — WEB SİTESİ (Hafta 4–6)

## 2.1 Stack (tamamı ücretsiz)

- **Next.js 14** App Router + TypeScript + Tailwind + shadcn/ui + Recharts
- `output: 'export'` → tamamen statik (hesaplayıcılar tarayıcıda çalışır, sunucu yok)
- **Cloudflare Pages** → GitHub'a her push'ta otomatik deploy
- Domain: `debtlab.pages.dev` → sonra `.com`

## 2.2 Sayfalar

| Yol | İçerik |
|---|---|
| `/` | Hero: "Pay Off Your Debt Faster — See Exactly When" + 4 hesaplayıcı kartı + YouTube bölümü |
| `/calculators/debt-snowball` | Çoklu borç girişi, aylık grafik, bitiş tarihi, toplam faiz |
| `/calculators/debt-avalanche` | Aynı + snowball ile karşılaştırma kutusu |
| `/calculators/credit-card-payoff` | Tek kart: bakiye, APR, ödeme → süre + faiz |
| `/calculators/credit-score-simulator` | 5 soru → 300–850 tahmini skor + seviye + **uyarı metni** |
| `/blog`, `/blog/[slug]` | MDX makaleler |
| `/privacy`, `/terms`, `/disclaimer`, `/about` | AdSense onayı için zorunlu |

Hesap mantığı `shared/debt_math.py`'nin TypeScript karşılığı (`web/lib/debtMath.ts`) → videodaki sayılar ile sitedeki sayılar birebir aynı.

Her sayfada:
- `<div id="ads-top">`, `<div id="ads-in-content">` (AdSense onayına kadar boş)
- CTA 1: "Get the App" (links.json'da link varsa görünür)
- CTA 2: "Check Your Real Credit Score" → affiliate + **"Affiliate link" etiketi** (FTC kuralı)
- JSON-LD FAQ schema, meta title/description, `sitemap.xml`, `robots.txt`

Tasarım: NerdWallet tarzı, `#0F52BA` mavi + beyaz + `#16A34A` yeşil (tasarruf).

## 2.3 Otomatik blog — `.github/workflows/blog.yml`

```
Pazartesi/Çarşamba/Cuma 06:00 UTC
 → blog/keywords.csv'den sıradaki anahtar kelime
 → debt_math ile o senaryonun gerçek tablosu
 → Gemini: 1200–1600 kelimelik makale (MDX), FAQ bölümü, iç linkler (ilgili hesaplayıcıya)
 → İlgili YouTube Short'u makaleye göm (published.csv'den eşleşen)
 → web/content/blog/ altına commit
 → Cloudflare Pages otomatik deploy
```

**Önemli:** Google "ölçeklenmiş içerik istismarı" politikası seri AI makaleyi cezalandırır. Bu yüzden:
- Haftada 3 makale (günde 10 değil)
- Her makalede o makaleye özel hesaplanmış tablo/grafik
- İlk 10 makaleyi yayına almadan önce **bir kez oku**; sonra ayda bir örnek kontrol

## 2.4 Tek seferlik manuel işler

1. [ ] Cloudflare hesabı → Pages → GitHub repo'yu bağla (root: `web/`)
2. [ ] Google Search Console → siteyi ekle, sitemap gönder
3. [ ] 20+ makale birikince **AdSense başvurusu**
4. [ ] Experian / Credit Karma affiliate başvurusu (genelde Impact/CJ üzerinden) → link gelince `links.json`
5. [ ] `links.json` → `website` alanını doldur → **tüm yeni YouTube açıklamaları artık siteye link verir**

## 2.5 Faz 2 bitti kriteri

- [ ] 4 hesaplayıcı çalışıyor, mobil uyumlu, Lighthouse 90+
- [ ] Blog 3/hafta kendi kendine yayınlanıyor
- [ ] YouTube açıklamaları siteye yönlendiriyor

---

# FAZ 3 — MOBİL UYGULAMA (Hafta 7–12)

## 3.1 Sıra: önce Android, iOS gelir gelince

| | Android | iOS |
|---|---|---|
| Maliyet | 25$ tek sefer | 99$/yıl |
| Build | GitHub Actions ubuntu (ücretsiz) | GitHub Actions macOS (private repo'da dakikası 10x sayılır) |
| Ne zaman | Hafta 7 | AdSense/AdMob geliri 99$'ı geçince |

## 3.2 Uygulama: Debt Payoff Planner (Flutter 3.x)

Ekranlar: Onboarding (3 slayt) → Ana sayfa (borç listesi + toplam + pasta grafik) → Borç ekle → Plan (Snowball/Avalanche, bitiş tarihi, faiz tasarrufu, bar grafik) → Skor simülatörü (sitedekiyle aynı 5 soru) → Premium.

- Depolama: **Hive** (lokal, giriş yok)
- Bildirim: `flutter_local_notifications` ile günlük hatırlatma (Android 13+ bildirim izni bir kez sorulur; "hiç izin yok" hedefi bildirimle çelişir → bildirimi opsiyonel yap, onboarding sonunda sor)
- Paylaş: "I'll be debt-free by {date}!" + site linki
- Ayarlar: disclaimer + privacy policy (sitedeki `/privacy` sayfası)

## 3.3 Gelir

- **AdMob:** Ana sayfada banner, plan hesaplandıktan sonra interstitial (5 dk'da en fazla 1)
- **RevenueCat** (belirli aylık gelire kadar ücretsiz):
  - `premium_monthly` 4.99$ — sınırsız borç, PDF export, reklamsız
  - `lifetime` 19.99$
- Affiliate butonu → `links.json`'daki Experian linki (uygulama build sırasında okur)
- Ödemeler: Play Billing → Estonya şirket hesabına

## 3.4 Otomatik release — `.github/workflows/app-release.yml`

```
git tag v1.0.x → push
 → Flutter build appbundle (keystore GitHub Secret'tan)
 → fastlane supply → Play Console "internal" track
 → (onaylıysa) production'a otomatik promote
```

Secrets: `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `PLAY_SERVICE_ACCOUNT_JSON`, `REVENUECAT_KEY`, `ADMOB_APP_ID`.

## 3.5 Tek seferlik manuel işler

1. [ ] **D-U-N-S numarası** (Estonya şirketi için) — **bugün başvur**, en uzun süren iş bu
2. [ ] Google Play Console **Organization** hesabı (25$)
3. [ ] Store listing: ikon, 4 ekran görüntüsü, açıklama, Data Safety formu, içerik derecelendirmesi
4. [ ] AdMob hesabı + uygulama kaydı
5. [ ] RevenueCat → Play ürünlerini bağla
6. [ ] İlk sürümü elle yükle (Play API ilk yüklemeye izin vermez), sonrakiler otomatik
7. [ ] `links.json` → `play_store` doldur → YouTube + site otomatik "Get the App" göstermeye başlar

## 3.6 Faz 3 bitti kriteri

- [ ] Play Store'da yayında
- [ ] 3 ürün birbirine link veriyor (video → site → app → site)
- [ ] Tag atınca yeni sürüm insan eli değmeden mağazaya gidiyor

---

## Cross-Promo Akışı (her şey birbirini besler)

```
YouTube Short ──(açıklama + son kart)──► Web hesaplayıcı
      ▲                                      │
      │                                      ▼
  Blog'da gömülü video ◄──────────── "Get the App" CTA
      ▲                                      │
      └────── Uygulamada "Watch tips" ◄──────┘
                         +
       Her yerde: "Check your real score" → affiliate
```

---

## Maliyet Özeti

| Kalem | Tutar |
|---|---|
| GitHub Actions, Cloudflare Pages, Gemini free tier, Kokoro TTS, Remotion (bireysel), YouTube API | **0$** |
| Google Play Organization hesabı | 25$ (tek sefer) |
| Domain `.com` (opsiyonel) | ~10$/yıl |
| Apple Developer (ertelenmiş) | 99$/yıl |
| **Faz 1 + Faz 2 toplam** | **0$** |

---

## Bugün Yapılacaklar (sıralı)

1. [ ] D-U-N-S başvurusu (arka planda ~30 gün sürer)
2. [ ] YouTube kanalı + Google Cloud projesi + OAuth "In production"
3. [ ] **YouTube API Audit formu**
4. [ ] Gemini API key
5. [ ] GitHub private repo + secrets
6. [ ] `debt_math.py` + `topics.csv` + `shorts.yml` → ilk manuel tetikleme (`workflow_dispatch`) → video kontrol
7. [ ] Bilgisayarı kapat ☕

---

## Uyarı Metinleri (her yerde aynı)

- Video: *"Educational only. Not financial advice."*
- Site/App: *"This tool provides educational estimates only and is not financial advice. Estimated scores are not your actual FICO® or VantageScore®. Not affiliated with Experian, Equifax, or TransUnion."*
- Affiliate: *"We may earn a commission if you sign up through our links."*
