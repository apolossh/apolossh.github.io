import yt_dlp
import os
import sys

def download_video(url, download_path='downloads'):
    """
    Baixa vídeos do YouTube e Instagram na melhor qualidade disponível
    
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
        'format': 'best',  # Melhor qualidade disponível
        'merge_output_format': 'mp4',
        'ignoreerrors': True,
        'no_warnings': False,
        'quiet': False,
        'extract_flat': False,
        # Configurações específicas para Instagram
        'cookiefile': 'cookies.txt',  # Opcional: usar cookies se tiver
    }
    
    # Se for Instagram, usar configurações específicas
    if 'instagram.com' in url:
        ydl_opts.update({
            'format': 'best',  # Para Instagram, deixar escolher o melhor formato
            'extract_flat': False,
        })
    
    try:
        print("🔍 Analisando URL...")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Primeiro obtém informações do vídeo
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'vídeo')
            duration = info.get('duration', 'N/A')
            uploader = info.get('uploader', 'N/A')
            formats = info.get('formats', [])
            
            print(f"📹 Título: {title}")
            print(f"👤 Uploader: {uploader}")
            if duration != 'N/A':
                mins, secs = divmod(duration, 60)
                print(f"⏱️ Duração: {mins:.0f}:{secs:02.0f}")
            
            # Listar formatos disponíveis para debug
            if formats:
                print(f"📊 Formatos disponíveis: {len(formats)}")
            
            print("⬇️ Iniciando download...")
            
            # Faz o download
            ydl.download([url])
            
        print("✅ Download concluído com sucesso!")
        print(f"📁 Salvo em: {download_path}")
        
    except yt_dlp.utils.DownloadError as e:
        print(f"❌ Erro específico do download: {e}")
        # Tentar método alternativo para Instagram
        if 'instagram.com' in url:
            print("🔄 Tentando método alternativo para Instagram...")
            try_instagram_alternative(url, download_path)
        else:
            return False
    except Exception as e:
        print(f"❌ Erro durante o download: {e}")
        return False
    
    return True

def try_instagram_alternative(url, download_path):
    """Método alternativo para download do Instagram"""
    try:
        ydl_opts_alt = {
            'outtmpl': f'{download_path}/%(title)s.%(ext)s',
            'format': 'best',
            'merge_output_format': 'mp4',
            'ignoreerrors': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts_alt) as ydl:
            ydl.download([url])
        print("✅ Download alternativo concluído!")
        return True
    except Exception as e:
        print(f"❌ Método alternativo também falhou: {e}")
        return False

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
        print("⚠️  Instagram pode ser instável. Tentando métodos alternativos...")
    else:
        print("🌐 Plataforma: Outra (tentando download)")
    
    print("\n" + "=" * 45)
    
    # Fazer download
    success = download_video(url)
    
    if not success:
        print("\n💡 Dicas de solução para Instagram:")
        print("• O Instagram pode estar bloqueando downloads")
        print("• Tente acessar a URL no navegador primeiro para verificar se o vídeo está disponível")
        print("• Alguns vídeos do Instagram requerem login")
        print("• Atualize o yt-dlp: pip install --upgrade yt-dlp")
        print("• Tente novamente em alguns minutos")

if __name__ == "__main__":
    main()
