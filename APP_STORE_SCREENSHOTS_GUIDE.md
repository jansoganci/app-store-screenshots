# NutriWeek — App Store Screenshot Rehberi

> Son güncelleme: 2026-06-01  
> Kapsam: 5 iPhone screenshot slaytı — strateji, metinler, renkler, ekran eşleştirmesi, mevcut taslak yorumları.

---

## 1. Uygulama dili durumu

### Kısa cevap

Uygulama **tek dil değil**. `Localizable.xcstrings` içinde **İngilizce (en) + Türkçe (tr)** birlikte tanımlı. Cihaz/simulator dili hangisiyse o gösterilir.

### Teknik özet

| Alan | Değer |
|------|--------|
| Kaynak dil (`sourceLanguage`) | `en` |
| Xcode `developmentRegion` | `en` |
| Xcode `knownRegions` | `en`, `tr`, `Base` |
| Toplam string anahtarı | 441 |
| EN çevirisi olan | 414 |
| TR çevirisi olan | 408 |
| EN + TR ikisi birden | 408 |
| Sadece EN (TR eksik) | 6 — hepsi format string (`%lld/%lld` vb.) |

Örnek:

- `tab.meal_plan` → EN: **Meal Plan** / TR: **Yemek Planı**
- `log.title` → EN: **Quick Log** / TR: **Hızlı Kayıt**

### Ne yapman gerekiyor?

**Yeni çeviri eklemen gerekmiyor** — UI metinleri büyük ölçüde hazır.

Screenshot / test için:

1. Simulator veya cihaz dili **English** → UI İngilizce gelir.
2. Simulator veya cihaz dili **Türkçe** → UI Türkçe gelir (mevcut görsellerdeki gibi).

**Notlar:**

- TR çevirilerin bir kısmında kalite sorunu var (ASCII transliterasyon, bazı anlam hataları). Detay: `docs/archive/i18n-turkish-translation-audit.md`
- USDA arama sonuçları API’den gelir; yemek adları **İngilizce** kalabilir — bu localization’dan bağımsız.
- Şu an screenshot’larda **İngilizce pazarlama metni + Türkçe UI** var. TR-only mağaza için **metinleri de Türkçe yap**; global/ABD için **simulator’ı EN’e al ve screenshot çek**.

---

## 2. Ürün özeti (briefing)

| Soru | Cevap |
|------|--------|
| Uygulama adı | NutriWeek |
| Ana fayda | Hedef kalori/makrolara uygun AI destekli haftalık yemek planı; yemek kaydı ve ilerleme takibi tek uygulamada |
| Hedef kullanıcı | Beslenmesini takip edenler, makro hedefi olanlar, haftalık plan isteyen yoğun kullanıcılar |
| İlk pazar (öneri) | TR veya EN — screenshot dili mağaza diliyle aynı olmalı |
| Görsel stil | Açık wellness UI, turuncu vurgu `#FF6B35`, Rocky 🦝 maskot, minimal SwiftUI kartlar |
| Hazır asset | Simulator screenshot’ları + editor uploaded PNG’ler mevcut; metin/kurgu revize aşamasında |

---

## 3. Beş slayt stratejisi

Akış: **problem → çözüm → özellik → güven → sonuç**

| # | Rol | Önerilen ekran | Arka plan |
|---|-----|----------------|-----------|
| 1 | Hook — haftalık plan | `MealPlanHomeView` (haftalık plan + makro halkaları) | `#FF6B35` → `#FFF3EE` gradient |
| 2 | AI / hızlı plan | Haftalık plan listesi veya progressive “2/7 gün hazır” | `#FFF3EE` düz |
| 3 | Makro takibi | Home — “Bugünün İlerlemesi” makro halkaları | `#2D2D2D` (inverted) |
| 4 | Yemek kaydı | `LogView` — USDA arama, tekrarlanan yemekler | `#FAFAFA` düz |
| 5 | Kapanış / CTA | `ProgressSegmentView` — trendler, haftalık özet | `#FF6B35` → `#FFB300` gradient |

**Kullanma:** Market listesi (`grocery`) — uygulamada yok, App Store’da gösterme.

---

## 4. Önerilen metinler

### 4.1 Türkçe set (TR mağaza + TR UI — önerilen)

| # | Eyebrow | Başlık | Alt metin |
|---|---------|--------|-----------|
| 1 | HAFTANI PLANLA | **Haftalık planın hazır** | Kalori ve makro hedeflerine uygun kişisel öğünler |
| 2 | AKILLI PLANLAMA | **7 günlük plan tek dokunuşla** | Hedeflerini söyle — NutriWeek haftanı oluştursun |
| 3 | BESLENME TAKİBİ | **Her makroyu gör** | Kalori, protein, karbonhidrat ve yağ — tek ekranda |
| 4 | ÖĞÜN KAYDI | **Yediklerini kaydet** | Gerçek besin verisiyle ara, porsiyonunu takip et |
| 5 | HEMEN BAŞLA | **Planla. Kaydet. Takipte kal.** | Öğünlerini, makrolarını ve ilerlemeni tek uygulamada yönet |

### 4.2 İngilizce set (EN mağaza + EN simulator UI)

| # | Eyebrow | Başlık | Alt metin |
|---|---------|--------|-----------|
| 1 | PLAN YOUR WEEK | **Plan your week in minutes** | Personalized meals that match your calorie and macro goals |
| 2 | SMART PLANNING | **Get a 7-day meal plan** | Tell us your goals — NutriWeek builds the week for you |
| 3 | TRACK NUTRITION | **Know every macro** | Calories, protein, carbs, and fat — all in one view |
| 4 | LOG MEALS | **Log what you eat** | Search real foods and track portions against your plan |
| 5 | START TODAY | **Plan. Log. Stay on track.** | Manage your meals, macros, and progress in one app |

### 4.3 Mevcut taslaktaki metinler (referans)

| # | Eyebrow | Başlık | Alt metin |
|---|---------|--------|-----------|
| 1 | PLAN YOUR WEEK | AI meal plans for your goals | — |
| 2 | SMART PLANNING | Get your week planned fast | NutriWeek creates a 7-day plan from your goals |
| 3 | TRACK NUTRITION | Know every macro | See calories, protein, carbs, and fat in one view. |
| 4 | LOG MEALS | Log what you eat easily. | — |
| 5 | START TODAY | Plan. Log. Stay on track. | Manage your meals, macros, and progress in one app |

**Metin notları (ASO):**

- Başlık: 3–6 kelime ideal; thumbnail’da okunabilir olmalı.
- “easily”, “perfect”, “magically” gibi boş sıfatlardan kaçın.
- Tıbbi iddia kullanma; AI vaadi gerçek özellikle uyumlu olmalı.
- Slayt başına tek mesaj.

---

## 5. Renk ve tipografi yönlendirmesi

### Uygulama paleti (kaynak: `ColorToken.swift`)

| Token | Hex | Kullanım |
|-------|-----|----------|
| primary | `#FF6B35` | Marka, CTA, tab bar |
| secondary | `#FFF3EE` | Vurgulu kart / yumuşak arka plan |
| background | `#FAFAFA` | Uygulama zemini |
| foreground | `#2D2D2D` | Koyu metin |
| macroProtein | `#4CAF50` | Protein |
| macroFat | `#FFB300` | Yağ |

### Screenshot arka planları (5 slayt)

1. `#FF6B35` → `#FFF3EE` gradient — beyaz başlık  
2. `#FFF3EE` — koyu metin `#2D2D2D`, eyebrow `#FF6B35`  
3. `#2D2D2D` — beyaz başlık, makro accent noktaları  
4. `#FAFAFA` — koyu metin, eyebrow `#FF6B35`  
5. `#FF6B35` → `#FFB300` gradient — beyaz başlık + alt metin  

### Kaçınılacaklar

- Editor teması `ocean-fresh` (mavi `#E0F2FE`, `#0284C7`) — marka dışı.
- Koyu yeşil gradient — uygulamada yok.
- Slaytlar arası rastgele mavi eyebrow / glow — seti koparıyor.

---

## 6. Mevcut taslak — slayt slayt yorum

### Slide 1 — PLAN YOUR WEEK / AI meal plans for your goals

**Güçlü:** Doğru hero ekran (haftalık plan + makro halkaları). Turuncu gradient markayla uyumlu. Başlık net.

**Zayıf:** Eyebrow ve başlık mavi (ocean-fresh). EN metin + TR UI uyumsuz.

**Aksiyon:** Metin rengini beyaz/koyu gri yap; mavi accent kaldır. TR mağaza → metinleri Türkçeleştir.

---

### Slide 2 — SMART PLANNING / Get your week planned fast

**Güçlü:** Alt metin somut. İki telefon kompozisyonu dinamik. Sol telefondaki öğün listesi iyi.

**Zayıf (en zayıf slayt):** Açık mavi arka plan marka dışı. Sağ telefon **boş Aktivite ekranı** (“0 kcal yakıldı”) — satmaz. Mesaj “hızlı plan” ama görsel aktivite takibi.

**Aksiyon:** Sağ telefonu haftalık plan / progressive loading ile değiştir. Arka plan `#FFF3EE`. İki ekran da plan hikâyesini anlatsın.

---

### Slide 3 — TRACK NUTRITION / Know every macro

**Güçlü:** Koyu arka plan iyi kontrast. Başlık + alt metin uyumlu. Dolu makro verisi inandırıcı. Rocky maskotu marka kişiliği.

**Zayıf:** Ekran aslında **Hızlı Kayıt** — Slide 4 ile çakışıyor. Mavi eyebrow / sol glow marka dışı.

**Aksiyon:** Ekranı Home makro halkalarına taşı **veya** Slide 4’ü farklı tutup bu slaytı log odaklı bırak (ikisinden biri). Glow kaldır.

---

### Slide 4 — LOG MEALS / Log what you eat easily.

**Güçlü:** Doğru ekran (arama, tekrarlanan yemekler, makro rozetleri). Açık zemin UI’yi temiz gösterir. USDA arama kanıtı iyi.

**Zayıf:** Slide 3 ile aynı tab tekrarı. Mavi arka plan/eyebrow. “easily” zayıf kelime. Alt metin yok.

**Aksiyon:** Slide 3’ü Home makrolara al → tekrar biter. Arka plan `#FAFAFA`. Başlık: “Log what you eat” / TR: “Yediklerini kaydet”. USDA alt metni ekle.

---

### Slide 5 — START TODAY / Plan. Log. Stay on track.

**Güçlü:** Güçlü kapanış. Üç kelimelik ritim tüm hikâyeyi özetler. Turuncu arka plan marka uyumlu. İlerleme ekranı trend grafikleri — dolu, inandırıcı.

**Zayıf:** Sol üst mavi-mor glow marka dışı. Klasik “Download on the App Store” CTA yok. Demo veriler (ör. düşük ort. alım) dikkatli bakınca şüphe uyandırabilir.

**Aksiyon:** Glow kaldır; isteğe bağlı app icon + App Store rozeti ekle. Demo verileri gerçekçi tut.

---

## 7. Set geneli değerlendirme

| Kriter | Durum |
|--------|--------|
| İlk 3 saniyede değer önerisi | ✅ Slide 1 |
| Slayt başına tek mesaj | ⚠️ Slide 2–3–4 çakışmaları |
| Marka renk tutarlılığı | ❌ Mavi tema sızıntısı |
| Metin ↔ ekran uyumu | ⚠️ Slide 2, 3–4 |
| Dil tutarlılığı | ❌ EN metin + TR UI |
| Boş state kullanımı | ❌ Slide 2 sağ telefon |
| Slide 5 kapanış | ✅ Güçlü |

### Öncelik sırası (revizyon)

1. Pazarlama metni dili = UI dili (TR veya EN, ikisi birden değil)
2. Slide 2 boş Aktivite ekranını değiştir
3. Slide 3 ↔ 4 ekran tekrarını çöz (Home makro vs Log)
4. Mavi accent/arka plan → NutriWeek turuncu paleti
5. Slide 5 glow temizle; isteğe bağlı indirme CTA

---

## 8. App Store uyumluluğu

- **Gerçek UI göster** — marketing-only mockup yok; mevcut taslak doğru yönde.
- **Olmayan özellik gösterme** — grocery listesi yok.
- **Abartılı iddia** — “perfect plan”, tıbbi sonuç vaadi yok.
- **Boyut:** iPhone 6.9" → 1320 × 2868 px (editor `constants.ts`).
- **İlk 3 screenshot** arama sonuçlarında en çok görünen çerçeve — en güçlü mesajlar burada.

---

## 9. Editor dosyaları

| Dosya | Amaç |
|-------|------|
| `app-store-screenshots.json` | Slayt metinleri, screenshot path, layout |
| `src/lib/constants.ts` | Canvas boyutları, tema tanımları |
| `public/screenshots/apple/iphone/` | Ham simulator PNG’ler |
| `public/screenshots/uploaded/` | Editor’a yüklenen görseller |

**Tema önerisi:** `themeId` için `ocean-fresh` yerine turuncu palete uygun özel tema (`nutriweek-warm`) eklenebilir.

---

## 10. Açık kararlar

- [ ] İlk mağaza: TR mi, EN/global mi?
- [ ] Screenshot metinleri TR mi EN mi? (UI ile aynı olmalı)
- [ ] Slide 5: value summary mi, “Download NutriWeek” CTA mı?
- [ ] Slide 3 ekranı: Home makro mu, Log mu?
