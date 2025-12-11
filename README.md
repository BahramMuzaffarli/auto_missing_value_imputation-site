# Missing Value İmputasiya Aləti

Bu veb sayt CSV fayllarındakı missing value-ları avtomatik doldurmaq üçün nəzərdə tutulub.

## Xüsusiyyətlər

- **CSV Fayl Yükləmə**: Drag & drop və ya kliklə fayl seçmə imkanı
- **Missing Value Təhlili**: Avtomatik missing value aşkarlama və sayma
- **Çoxlu İmputasiya Metodları**:
  - Orta qiymət (Mean) imputasiyası
  - Median imputasiyası
  - Missing value olan sətirləri silmə
- **Real-time Təhlil**: Verilənlərin statistikası və missing value sayı
- **CSV Eksport**: Emal edilmiş verilənləri yenidən yükləmə

## İstifadə Qaydası

1. **Fayl Yükləyin**
   - Ana səhifədə "CSV faylınızı buraya sürüşdürün" sahəsinə klikləyin və ya faylı sürüşdürün
   - Yalnız .csv formatlı fayllar qəbul olunur

2. **Verilənləri Nəzərdən Keçirin**
   - Cədvəldə verilənlər göstəriləcək
   - Missing value olan hüceyrələr sarı rənglə vurğulanacaq
   - Ümumi statistika (sətir sayı, sütun sayı, missing value sayı) göstəriləcək

3. **İmputasiya Tətbiq Edin**
   - "Sütun seçin" dropdown menyusundan işləmək istədiyiniz sütunu seçin
   - İstədiyiniz imputasiya metodunu seçin:
     - **Orta Qiymət**: Sütundakı mövcud qiymətlərin ortalamasını missing value-lara doldurur
     - **Median**: Sütundakı qiymətlərin medianını missing value-lara doldurur
     - **Sətirləri Sil**: Missing value olan bütün sətirləri silir

4. **Nəticəni Yükləyin**
   - "CSV yüklə" düyməsinə klikləyin
   - Emal edilmiş verilənlər `processed_data.csv` adı ilə yükləniləcək

## Texniki Detallar

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSV Parser**: Xüsusi CSV parser (quote handling, escape characters)
- **Missing Value Detection**: Aşağıdakı qiymətlər missing value kimi tanınır:
  - Boş sətirlər
  - `null`, `NULL`
  - `na`, `n/a`, `N/A`
  - `none`, `NONE`

## Brauzer Dəstəyi

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## İşə Salma

1. Bu faylları veb serverdə yerləşdirin
2. `index.html` faylını açın
3. Veb sayt hazırdır!

Və ya local development üçün:

```bash
# Python 3 ilə
python -m http.server 8000

# Node.js ilə
npx http-server

# PHP ilə
php -S localhost:8000
```

Sonra `http://localhost:8000` ünvanına daxil olun.

## Nümunə Verilənlər

Layihədə `sample_data.csv` faylı nümunə verilənlər ilə təqdim olunur. Bu faylda müxtəlif missing value nümunələri var.
