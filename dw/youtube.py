import yt_dlp
import os
import sys

def download_video(url, download_path='downloads'):
    """
    Baixa vídeos do YouTube e Instagram na melhor qualidade até 720p
    
    Args:
        url (str): URL do vídeo (YouTube ou Instagram)
        download_path (str): Pasta onde salvar os downloads
    """
    
    # Criar pasta de downloads se não existir
    if not os.path.exists(download_path):
        os.makedirs(download_path)
    
    # Configurações otimizadas para YouTube e Instagram
    ydl_opts = {
        'outtmpl': f'{download_path}/%(title)s.%(ext)s',
        'format': 'best[height<=720]',  # Melhor qualidade até 720p
        'merge_output_format': 'mp4',
        'ignoreerrors': True,
        'no_warnings': False,
        'quiet': False,
        'extract_flat': False,
    }
    
    try:
        print("🔍 Analisando URL...")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Primeiro obtém informações do vídeo
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'vídeo')
            duration = info.get('duration', 'N/A')
            uploader = info.get('uploader', 'N/A')
            
            print(f"📹 Título: {title}")
            print(f"👤 Uploader: {uploader}")
            if duration != 'N/A':
                print(f"⏱️ Duração: {duration} segundos")
            print("⬇️ Iniciando download...")
            
            # Faz o download
            ydl.download([url])
            
        print("✅ Download concluído com sucesso!")
        print(f"📁 Salvo em: {download_path}")
        
    except Exception as e:
        print(f"❌ Erro durante o download: {e}")
        return False
    
    return True

def main():
    """Função principal"""
    
    print("🎬 Downloader Universal - YouTube & Instagram")
    print("=" * 45)
    
    # Verificar se a URL foi passada como argumento
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        # Pedir URL interativamente
        url = input("\n📋 Cole a URL do vídeo (YouTube/Instagram): ").strip()
    
    if not url:
        print("❌ URL não fornecida.")
        return
    
    # Validar URL básica
    if not url.startswith(('http://', 'https://')):
        print("❌ URL inválida. Deve começar com http:// ou https://")
        return
    
    print(f"🌐 URL detectada: {url}")
    
    # Detectar plataforma
    if 'youtube.com' in url or 'youtu.be' in url:
        print("📺 Plataforma: YouTube")
    elif 'instagram.com' in url:
        print("📸 Plataforma: Instagram")
    else:
        print("🌐 Plataforma: Outra (tentando download)")
    
    print("\n" + "=" * 45)
    
    # Fazer download
    success = download_video(url)
    
    if not success:
        print("\n💡 Dicas de solução:")
        print("• Verifique se a URL está correta")
        print("• Certifique-se de ter conexão com internet")
        print("• Tente atualizar o yt-dlp: pip install --upgrade yt-dlp")

if __name__ == "__main__":
    main()