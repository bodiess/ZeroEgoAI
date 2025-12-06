import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Bu fonksiyon, metni alıp Duygusallık skorlarını döndürür.
def analyze_text_sentiment(text):
    analyzer = SentimentIntensityAnalyzer()
    
    # Vader ile analizi gerçekleştir
    vs = analyzer.polarity_scores(text)
    
    # Skorları daha okunur bir formata dönüştür
    results = {
        "negatif_skor": vs['neg'],
        "nötr_skor": vs['neu'],
        "pozitif_skor": vs['pos'],
        "bileşik_skor": vs['compound'] # En önemli skor: -1 (aşırı negatif) ile +1 (aşırı pozitif) arası
    }
    
    # JSON formatında döndür (API'ye uygunluk için)
    return results

if __name__ == "__main__":
    # Konsol testi için örnek metin
    test_text = "Tüm paramı bu hisseye yatırma fikri beni hem çok heyecanlandırıyor hem de panikletiyor. Düşerse mahvolurum."
    
    # Fonksiyonu test et ve çıktıyı göster
    analysis = analyze_text_sentiment(test_text)
    
    print(json.dumps(analysis, indent=4))