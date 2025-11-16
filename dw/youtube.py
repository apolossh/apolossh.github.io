import yt_dlp
import os
import sys

def sanitize_filename(filename):
    import re
    filename = filename.replace(' ', '_')
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = re.sub(r'_+', '_', filename)
    return filename

def download_video(url, download_path='downloads'):
    if not os.path.exists(download_path):
        os.makedirs(download_path)
    
    output_path = os.path.join(download_path, 'video.mp4')
    
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'best',
        'merge_output_format': 'mp4',
        'ignoreerrors': True,
        'no_warnings': False,
        'quiet': False,
        'extract_flat': False,
        'cookiefile': 'cookies.txt',
    }
    
    if 'instagram.com' in url:
        ydl_opts.update({
            'format': 'best',
            'extract_flat': False,
        })
    
    try:
        print("🔍 Analisando URL...")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'vídeo')
            duration = info.get('duration', 'N/A')
            uploader = info.get('uploader', 'N/A')
            
            print(f"📹 Título: {title}")
            print(f"👤 Uploader: {uploader}")
            if duration != 'N/A':
                mins, secs = divmod(duration, 60)
                print(f"⏱️ Duração: {mins:.0f}:{secs:02.0f}")
            
            print("⬇️ Iniciando download...")
            
            ydl.download([url])
            
            print(f"✅ Download concluído com sucesso!")
            print(f"📁 Salvo em: {output_path}")
            
            return True
        
    except yt_dlp.utils.DownloadError as e:
        print(f"❌ Erro específico do download: {e}")
        if 'instagram.com' in url:
            print("🔄 Tentando método alternativo para Instagram...")
            return try_instagram_alternative(url, download_path)
        else:
            return False
    except Exception as e:
        print(f"❌ Erro durante o download: {e}")
        return False

def try_instagram_alternative(url, download_path):
    try:
        output_path = os.path.join(download_path, 'video.mp4')
        
        ydl_opts_alt = {
            'outtmpl': output_path,
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
    print("🎬 Downloader Universal - YouTube & Instagram")
    print("=" * 45)
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("\n📋 Cole a URL do vídeo (YouTube/Instagram): ").strip()
    
    if not url:
        print("❌ URL não fornecida.")
        return
    
    if not url.startswith(('http://', 'https://')):
        print("❌ URL inválida. Deve começar com http:// ou https://")
        return
    
    print(f"🌐 URL detectada: {url}")
    
    if 'youtube.com' in url or 'youtu.be' in url:
        print("📺 Plataforma: YouTube")
    elif 'instagram.com' in url:
        print("📸 Plataforma: Instagram")
        print("⚠️  Instagram pode ser instável. Tentando métodos alternativos...")
    else:
        print("🌐 Plataforma: Outra (tentando download)")
    
    print("\n" + "=" * 45)
    
    success = download_video(url)
    
    if success:
        print("👋 Script finalizado")
    else:
        print("\n💡 Dicas de solução para Instagram:")
        print("• O Instagram pode estar bloqueando downloads")
        print("• Tente acessar a URL no navegador primeiro para verificar se o vídeo está disponível")
        print("• Alguns vídeos do Instagram requerem login")
        print("• Atualize o yt-dlp: pip install --upgrade yt-dlp")
        print("• Tente novamente em alguns minutos")

if __name__ == "__main__":
    main()
